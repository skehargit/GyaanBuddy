import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

async function crawlSite(startUrl, maxDepth = 2, maxPages = 4) {
  const visited = new Set();
  const allDocs = [];

  async function crawl(url, depth) {
    if (depth > maxDepth || visited.size >= maxPages || visited.has(url)) return;
    visited.add(url);

    try {
      const loader = new CheerioWebBaseLoader(url);
      const docs = await loader.load();

      docs.forEach((d) => {
        d.metadata = { ...(d.metadata || {}), source: "url", url };
      });
      allDocs.push(...docs);

      // Extract links from HTML
      const html = docs[0].pageContent;
      const links = Array.from(html.matchAll(/href="(.*?)"/g))
        .map((m) => m[1])
        .filter((link) => link.startsWith("/") || link.startsWith(startUrl));

      // Normalize relative URLs
      for (const link of links) {
        if (visited.size >= maxPages) break;
        const fullUrl = link.startsWith("http")
          ? link
          : new URL(link, startUrl).href;

        await crawl(fullUrl, depth + 1);
      }
    } catch (err) {
      console.error("Failed to crawl:", url, err.message);
    }
  }

  await crawl(startUrl, 0);
  return allDocs;
}

export default crawlSite;



