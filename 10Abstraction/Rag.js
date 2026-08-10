import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { abstractUserQuery } from "./abstractQuery.js";
import { llm } from "./model.js";
import fs from "fs";
import path from "path";
import vectorStore from "./retriever.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const LOG_DIR = "./logs";
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

const runTimeStamp = new Date().toISOString().replace(/[:.]/g, "-");
const logFilePath = path.join(LOG_DIR, `chunks_${runTimeStamp}.md`);

function logToFile(heading, content) {
  const block = `\n## ${heading}\n\n${content}\n`;
  fs.appendFileSync(logFilePath, block, "utf8");
}

function terminalStep(msg) {
  console.log(`-> ${msg}`);
}

const rl = readline.createInterface({ input, output });

try {
  const query = await rl.question(
    "Enter your query or type quit to exit the chat.\n",
  );

  if (query.toLowerCase() == "quit") {
    console.log("Link close");
    rl.close();
    process.exit(0);
  }

  logToFile(
    "Session",
    `**Original query:** ${query}\n\n**Started:** ${new Date().toLocaleString()}`,
  );

  terminalStep("Generating abstract query...\n");
  const data = await abstractUserQuery(query);
  const modifiedQuery = data.finalQuery;
  terminalStep("Fetching relevant Data...");

  const chunks = await vectorStore.similaritySearch(modifiedQuery, 4);
  const relevant_context = chunks
    .map((doc) => doc.pageContent)
    .join("\n\n---\n\n");

  logToFile(
    `${modifiedQuery}`,
    `**Retrieved ${chunks.length} chunks:**\n\n${relevant_context}`,
  );

  terminalStep(`Retrieved ${chunks.length} chunks. Calling LLM...`);

  const systemPrompt = `You are a helpful AI Assistant, who works solely to help on certain topics which are in your context.
  
  You are expert when it comes to answering from the context and you don't involve any outside data irrespective of what you think about it, you see the context you are provided with and give the priority to the context only.
  
  Context:
  ${relevant_context}
  `;

  const response = await llm.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(modifiedQuery),
  ]);

  logToFile("Final Answer", response.text);

  terminalStep(
    `Done. Answer written to response.md. Full trace logged to ${logFilePath}`,
  );
} catch (error) {
  console.log("ERROR: ", error);
} finally {
  console.log("Exiting...");
  rl.close();
}
