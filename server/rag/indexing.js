import dotenv from 'dotenv';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { fileURLToPath } from 'url';
import path from 'path';

// Ensure we load the env from the parent folder (server/.env) regardless of CWD
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function init() {
  const pdfFilePath = path.resolve(__dirname, 'basichtml.pdf');
  const loader = new PDFLoader(pdfFilePath);

  // Page by page load the PDF file
  const docs = await loader.load();

  // Ready the client OpenAI Embedding Model
  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-large',
  });

  const vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings, {
    url: 'http://localhost:6333',
    collectionName: 'chaicoderag-collection',
  });

  console.log('Indexing of documents done...');
}

init();