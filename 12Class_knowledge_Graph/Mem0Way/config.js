import dotenv from "dotenv";

dotenv.config();

const NEO4J_URL = "bolt://localhost:7687";
const NEO4J_USERNAME = "neo4j";
const NEO4J_PASSWORD = "mysupersecretpassword";

export const config = {
  version: "v1.1",
  embedder: {
    provider: "openai",
    config: {
      apiKey: process.env.OPENAI_API_KEY, // camelCase
      model: "text-embedding-3-small",
    },
  },
  llm: {
    provider: "openai",
    config: {
      apiKey: process.env.OPENAI_API_KEY, // camelCase
      model: "gpt-4.1-mini",
    },
  },
  vectorStore: {
    // camelCase
    provider: "qdrant",
    config: {
      host: "localhost",
      port: 6333,
    },
  },
  graphStore: {
    // camelCase
    provider: "neo4j",
    config: {
      url: "neo4j+s://1913da2d.databases.neo4j.io",
      username: "1913da2d",
      password: "HBQDivPOI7zJiWrr0__q9G_P-oUIroc6KQHp4YtrU7Q",
    },
  },
};
