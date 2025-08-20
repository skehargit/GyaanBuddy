import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
// import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";/
import crawlSite from "../tools/crawlSite.js";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer setup - store uploads in a temp folder
const uploadDir = path.resolve(__dirname, "../uploads");
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch {}
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Helper: load a local file into Documents based on extension
async function loadFileAsDocuments(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  // Prefer specialized loader for PDF
  if (ext === ".pdf") {
    const loader = new PDFLoader(filePath);
    return loader.load();
  }

  // For text-like files, treat as text
  const textLike = new Set([".txt", ".md", ".csv", ".json"]);
  if (textLike.has(ext)) {
    const loader = new TextLoader(filePath);
    return loader.load();
  }

  // Not supported parsers yet
  throw new Error(
    `Unsupported file type: ${ext}. Currently supported: .pdf, .txt, .md, .csv, .json`
  );
}

// POST /api/index - index text, url, and/or files
router.post("/api/index", upload.array("files"), async (req, res) => {
  try {
    const { text, url } = req.body || {};
    const files = req.files || [];

    const allDocs = [];
    // return res.json({ ok: true, indexed: allDocs.length });
    // Text input -> one Document
    if (text && String(text).trim().length > 0) {
      allDocs.push({ pageContent: String(text), metadata: { source: "text" } });
    }

    // URL input -> cheerio loader for landing page
    // if (url && String(url).trim().length > 0) {
    //   const loader = new CheerioWebBaseLoader(String(url));
    //   const docs = await loader.load();
    //   docs.forEach((d) => (d.metadata = { ...(d.metadata || {}), source: 'url', url }));
    //   allDocs.push(...docs);
    // }

    // URL input -> site crawler
    if (url && String(url).trim().length > 0) {
      try {
        const docs = await crawlSite(String(url), 2, 4); // (startUrl, maxDepth, maxPages)
        docs.forEach((d) => {
          d.metadata = {
            ...(d.metadata || {}),
            source: "url",
            url: d.metadata.url || url,
          };
        });
        allDocs.push(...docs);
      } catch (e) {
        return res.status(400).json({ ok: false, error: e.message, url });
      }
    }

    // Files -> load per file
    for (const f of files) {
      try {
        const docs = await loadFileAsDocuments(f.path);
        docs.forEach(
          (d) =>
            (d.metadata = {
              ...(d.metadata || {}),
              source: "file",
              filename: f.originalname,
            })
        );
        allDocs.push(...docs);
      } catch (e) {
        // Clean up file before throwing further
        await fs.unlink(f.path).catch(() => {});
        return res
          .status(400)
          .json({ ok: false, error: e.message, file: f.originalname });
      }
    }

    // Cleanup uploaded files
    for (const f of files) {
      await fs.unlink(f.path).catch(() => {});
    }

    if (allDocs.length === 0) {
      return res.status(400).json({
        ok: false,
        error: "No valid input provided. Provide text, url, or files.",
      });
    }

    // Embed + upsert to Qdrant
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
    });
    await QdrantVectorStore.fromDocuments(allDocs, embeddings, {
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
      collectionName: "chaicoderag-collection",
    });

    return res.json({ ok: true, indexed: allDocs.length });
  } catch (err) {
    console.error("Index error:", err);
    return res
      .status(500)
      .json({ ok: false, error: err.message || "Internal error" });
  }
});

// POST /api/chat - retrieve from Qdrant and answer with OpenAI
router.post("/api/chat", async (req, res) => {
  try {
    const { query, k = 3 } = req.body || {};
    if (!query || String(query).trim().length === 0) {
      return res.status(400).json({ ok: false, error: "Missing query" });
    }

    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
    });
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
        collectionName: "chaicoderag-collection",
      }
    );

    const retriever = vectorStore.asRetriever({ k: Number(k) || 3 });
    const contexts = await retriever.invoke(String(query));

    const SYSTEM_PROMPT = `You are an AI assistant who helps resolving user query based on the
    context available to you from a PDF file with the content and page number.

    Only ans based on the available context from file only.

    Context:
    ${JSON.stringify(contexts)}`;

    const client = new OpenAI();
    const completion = await client.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: String(query) },
      ],
    });

    const answer = completion.choices?.[0]?.message?.content || "";
    return res.json({ ok: true, answer, contexts });
  } catch (err) {
    console.error("Chat error:", err);
    return res
      .status(500)
      .json({ ok: false, error: err.message || "Internal error" });
  }
});

export default router;
