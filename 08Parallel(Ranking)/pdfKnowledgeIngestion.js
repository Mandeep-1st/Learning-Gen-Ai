import fs from "node:fs/promises";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";

import dotenv from "dotenv";

dotenv.config();

// // await letReadFile(
// //   getPdfFiles(`C:/Users/mande/Desktop/GENAI/Parallel(Ranking)/knowledge/js`),
// // );
async function getPdfFiles(directoryPath) {
  let response = await fs.readdir(directoryPath);
  let result = [];

  response.forEach((element) => {
    result.push(`knowledge/${element}`);
  });

  return result;
}

async function letReadFile(filePath) {
  //we need to see what this thing returns.
  const loader = new PDFLoader(`${filePath}`, {
    splitPages: true,
    parsedItemSeparator: " ",
  });
  const docs = await loader.load();
  console.log(docs.length);
  return docs;
}

async function getChunks(documents, filename) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 20,
  });

  /**
   * We have used splitDocuments here and not createDocuments because createDocuments accepts raw string data
   * because we have used PDFLoader it by default gives us the Document type result not raw strings so that's
   * the difference
   */
  const splittedDocs = await splitter.splitDocuments(documents);
  console.log(splittedDocs.length);
  splittedDocs.forEach((chunk) => {
    chunk.metadata.source = filename;
  });
  return splittedDocs;
}
const embedder = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  apiKey: process.env.OPENAI_API_KEY,
});

const vectorStore = await QdrantVectorStore.fromExistingCollection(embedder, {
  url: "http://localhost:6333",
  collectionName: "parallelRanking",
});

let allFiles = await getPdfFiles(
  `C:/Users/mande/Desktop/GENAI/Parallel(Ranking)/knowledge`,
);

for (const file of allFiles) {
  console.log(`Processing ${file}`);

  const docs = await letReadFile(file);
  const chunks = await getChunks(docs, file);

  console.log(`Uploading ${chunks.length} chunks...`);
  console.time("addDocuments");

  try {
    await vectorStore.addDocuments(docs);
    console.timeEnd("addDocuments");
    console.log("Upload complete");
  } catch (err) {
    console.error(err);
  }
  console.log(`Finished ${file}`);
}

console.log("INGESTION DONE");
