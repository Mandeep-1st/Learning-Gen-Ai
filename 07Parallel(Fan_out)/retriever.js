import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import dotenv from "dotenv";

dotenv.config();

const embedder = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  apiKey: process.env.OPENAI_API_KEY,
});

const vectorStore = await QdrantVectorStore.fromExistingCollection(embedder, {
  url: "http://localhost:6333",
  collectionName: "parallel_fan_out",
});

export default vectorStore;
