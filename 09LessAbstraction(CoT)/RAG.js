import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { multiStepGen } from "./multiStepGen.js";
import vectorStore from "./retriever.js";
import { llm } from "./model.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import fs from "fs";
import path from "path";
import { log } from "node:console";

/**
 * one log file per run.
 */
const LOG_DIR = "./logs";
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

const runTimeStamp = new Date().toISOString().replace(/[:.]/g, "-");

const logFilePath = path.join(LOG_DIR, `chunks_${runTimeStamp}.md`);

function logToFile(heading, content) {
  const block = `\n## ${heading}\n\n${content}\n`;
  fs.appendFileSync(logFilePath, block, "utf8");
}

function terminalStep(msg) {
  console.log(`→ ${msg}`);
}

const rl = readline.createInterface({ input, output });

try {
  const query = await rl.question(
    "Enter your query or type out quit to exit the chat.\n",
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

  terminalStep("Generating sub-query plan...\n");
  const data = await multiStepGen(query);
  const subQueries = data.sub_queries;
  let prevOutput = "";
  let prevConversation = [];

  terminalStep(
    `Got ${subQueries.length} sub-queries. Starting retrieval + generation loop...`,
  );
  for (let i = 0; i < subQueries.length; i++) {
    const subQuery = subQueries[i];
    const stepNum = i + 1;

    terminalStep(
      `[${stepNum}/${subQueries.length}] Retrieving chunks for: "${subQuery}"`,
    );

    const relevantChunk = await vectorStore.similaritySearch(subQuery, 4);
    if (prevOutput != "") {
      const moreChunk = await vectorStore.similaritySearch(prevOutput, 4);
      relevantChunk.push(...moreChunk);
    }

    const contextText = relevantChunk
      .map((doc) => doc.pageContent)
      .join("\n\n---\n\n");

    logToFile(
      `Step ${stepNum} — Sub-query: ${subQuery}`,
      `**Retrieved ${relevantChunk.length} chunks:**\n\n${contextText}`,
    );

    terminalStep(
      `[${stepNum}/${subQueries.length}] Retrieved ${relevantChunk.length} chunks. Calling LLM...`,
    );

    const systemPrompt = `You are a helpful AI Assistant, who works solely to help on certain topics which are in your context.
  
    You are expert when it comes to answering from the context and you don't involve any outside data irrespective of what you think about it, you see the context you are provided with and give the priority to the context only.
  
    Below this "context" is your source of truth and everything, follow this give a good and sensible response to the user.
    
    Context:
    ${contextText}
    `;

    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(subQuery),
    ]);

    prevOutput = response.text;

    logToFile(`Step ${stepNum} — Output`, prevOutput);
    terminalStep(`[${stepNum}/${subQueries.length}] Done.\n`);

    prevConversation.push({
      role: "user",
      content: subQuery,
    });

    prevConversation.push({
      role: "assistant",
      content: response.text,
    });
  }

  terminalStep(
    "All sub-steps complete. Generating final synthesized answer...",
  );

  const finalSystemPrompt = `
You are an AI assistant that answers strictly based on the conversation history provided,
which contains grounded, retrieved information from a document database.

Rules:
- Only use information present in the conversation history below.
- Do NOT use any outside knowledge, even if you know the answer.
- If the conversation history does not contain enough information to answer the 
  user's original query, explicitly say so instead of guessing or using general knowledge.
- Do not fabricate or infer facts not present in the retrieved context.
- If user had asked something different from the context then also tell them on what knowledge basis you work.
`;

  //using this {} syntax because we can use this also.
  const response = await llm.invoke([
    { role: "system", content: finalSystemPrompt },
    ...prevConversation,
    { role: "user", content: query },
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
