import { multiQuery } from "./multiQuery.js";
import vectorStore from "./retriever.js";

import readline from "node:readline/promises"; // 1. Import module [1]
import { stdin as input, stdout as output } from "node:process"; // 2. Set up streams [1]
import llm from "./model.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { writeFile } from "node:fs";

const rl = readline.createInterface({ input, output }); // 3. Create interface [1]

const query = await rl.question("Enter your query or enter quit to quit.\n");

if (query.toLowerCase() !== "quit") {
  const data = await multiQuery(query);

  const expandedQueries = [...data.expanded_queries, query];

  const alldocs = [];

  for (const q of expandedQueries) {
    console.log("\nSearching:", q);

    const docs = await vectorStore.similaritySearch(q, 4);
    alldocs.push(...docs);
  }

  const uniqueDocs = [
    ...new Map(alldocs.map((doc) => [doc.pageContent, doc])).values(),
  ];

  const context = uniqueDocs.map((doc) => doc.pageContent).join("\n\n");

  const systemPrompt = `
You are a helpful AI assistant.

Answer ONLY from the provided context.

Context:
${context}
  `;

  const response = await llm.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(query),
  ]);

  writeFile("response.md", response.content, "utf8", (err) => {
    console.log(err);
  });
}
