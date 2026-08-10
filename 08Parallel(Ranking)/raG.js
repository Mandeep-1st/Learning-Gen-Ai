import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import llm from "./model.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { writeFile } from "node:fs";
import { multiQuery } from "../Parallel(Fan_out)/multiQuery.js";
import vectorStore from "../Parallel(Fan_out)/retriever.js";

const rl = readline.createInterface({ input, output });

const query = await rl.question("Enter your query or type out quit to exit.\n");

if (query.toLowerCase() !== "quit") {
  const data = await multiQuery(query);
  console.log(data);
  const expandedQueries = [...data.expanded_queries, query];

  const allDocs = [];

  for (const eachQuery of expandedQueries) {
    console.log("\nSearching: ", eachQuery);

    const docs = await vectorStore.similaritySearch(eachQuery, 4);

    allDocs.push(docs);
  }

  //now we rank them
  const resultantDocs = reciproalRankFusion(allDocs);

  const context = resultantDocs.map((doc) => doc[0].pageContent).join("\n\n\n");
  const systemPrompt = `
    You are a helpful AI Assistant, who works solely to help on certain topics which are in your context.
  
    You are expert when it comes to answering from the context and you don't involve any outside data irrespective of what you think about it, you see the context you are provided with and give the priority to the context only.
  
    Below this "context" is your source of truth and everything, follow this give a good and sensible response to the user.

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

  console.log("Query Solved");
}

function reciproalRankFusion(rankings, k = 50) {
  const scores = new Map();

  for (const ranking of rankings) {
    ranking.forEach((docId, rank) => {
      const current = scores.get(docId) || 0;
      scores.set(docId, current + 1 / (k + rank + 1));
    });
  }

  //converting in Array[docId, score] and sort descending by score
  return Array.from(scores.entries()).sort((a, b) => b[1] - a[1]);
}
