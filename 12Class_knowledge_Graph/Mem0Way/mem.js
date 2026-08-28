import { config } from "./config.js";
import { MemoryClient } from "mem0ai";
import { OpenAI } from "openai";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

const rl = readline.createInterface({
  input,
  output,
});

import dotenv from "dotenv";
dotenv.config();

const memClient = new MemoryClient({ apiKey: process.env.MEM_KEY });

const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function chat(query) {
  const mem_results = await memClient.search(query, {
    filters: { user_id: "mandeep" },
  });

  console.log("Results:", mem_results);

  const messages = [{ role: "user", content: query }];

  const result = await openaiClient.chat.completions.create({
    model: "gpt-4.1-mini",
    messages,
  });

  messages.push({
    role: "assistant",
    content: result.choices[0].message.content,
  });

  try {
    const memory = await memClient.add(messages, {
      user_id: "mandeep",
    });
    console.log("Mem0:", memory);
  } catch (err) {
    console.error("Mem0 add failed:", err);
  }
  return result.choices[0].message.content;
}

while (true) {
  const message = await rl.question(">> ");

  if (message.toLowerCase() === "quit") {
    break;
  }

  console.log("BOT: ", await chat(message));
}

rl.close();
