import fs from "node:fs/promises";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import dotenv from "dotenv";

dotenv.config();
// getMarkdownFiles(
//   "C:/Users/mande/Desktop/GENAI/Parallel(Fan_out)/knowledge/nodejs",
// );
// we will get an array then we will put an for each on this array. which includes reading the file, making chunks of it then a loop to insert that chunks in the db.

async function getMarkdownFiles(directoryPath) {
  let response = await fs.readdir(directoryPath);
  let result = [];
  response.forEach((element) => {
    result.push(`knowledge/nodejs/${element}`);
  });

  return result;
}
async function myReadFile(filePath) {
  return await fs.readFile(filePath, "utf-8");
}

async function chunkText(document, filename) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 20,
  });

  const splittedDocs = await splitter.createDocuments(
    [document],
    [{ source: filename }],
  );
  console.log(splittedDocs.length);
  return splittedDocs;
}

const embedder = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  apiKey: process.env.OPENAI_API_KEY,
});

const vectorStore = await QdrantVectorStore.fromExistingCollection(embedder, {
  url: "http://localhost:6333",
  collectionName: "parallel_fan_out",
});

let allFiles = await getMarkdownFiles(
  "C:/Users/mande/Desktop/GENAI/Parallel(Fan_out)/knowledge/nodejs",
);

for (const eachFile of allFiles) {
  let docs = await chunkText(await myReadFile(eachFile), eachFile);

  await vectorStore.addDocuments(docs);
}

console.log("INGESTION DONE");
