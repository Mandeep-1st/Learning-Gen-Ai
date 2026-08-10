import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";

dotenv.config();

export const llm = new ChatOpenAI({
  model: "gpt-4.1-mini",
  temperature: 0.2,
  apiKey: process.env.OPENAI_API_KEY,
});

export async function runLLM(nameOfLLM) {
  const myLLM = new ChatOpenAI({
    model: nameOfLLM,
    temperature: 0.2,
    apiKey: process.env.OPENAI_API_KEY,
  });
}
