import llm from "./model.js";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
export async function multiQuery(userQuery) {
  const systemPrompt = `
    Generate 4 unique search queries that maximize retrieval diversity.

    Requirements:
    - Query 1: Expanded Version of the original query.
    - Query 2: Beginner explanation query.
    - Query 3: Practical implementation query.
    - Query 4: Related concept query.
    
    Return only valid JSON in this format:

    {
    "original":"<original query>",
    "expanded_queries": [
        "...",
        "...",
        "...",
        "..."
    ]
    }
    `;

  const response = await llm.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(userQuery),
  ]);

  return JSON.parse(response.content);
}
