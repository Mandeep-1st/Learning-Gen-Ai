import { llm } from "./model.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export async function multiStepGen(userQuery) {
  const systemPrompt = `
    You are a query planning assistant for a multi-step retrieval-augmented generation (RAG) system.

    Given a user's query, break it down into a sequence of up to 5 sub-queries that, when answered in order using document retrieval, will together produce a complete answer to the original query.

    Rules:
    - Each sub-query must be self-contained and specific enough to be used directly as a search query against a document database.
    - Sub-queries should progress logically: later sub-queries can assume the answers to earlier ones are already known, and may depend on them.
    - Do not include reasoning, explanations, or the final answer — only the list of sub-queries.
    - If the query is simple and doesn't need 5 steps, return fewer (minimum 2).
    - Return ONLY valid JSON in this exact format, with no preamble or markdown formatting:

    {
    "sub_queries": [
            "string",
            "string",
            .
            .
        ]
    }

    Example:

    User query: "How did the fall of the Roman Empire influence the development of feudalism in medieval Europe?"

    Output:
    {
    "sub_queries": [
        "What were the main causes and timeline of the fall of the Roman Empire?",
        "What was the political and economic structure of Western Europe immediately after Rome's collapse?",
        "What is feudalism and what were its core defining features?",
        "How did the power vacuum and decentralization after Rome's fall create conditions for feudalism to emerge?",
        "What specific institutions or practices from the post-Roman period evolved directly into feudal structures?"
    ]
    }
    `;

  const response = await llm.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(userQuery),
  ]);

  return JSON.parse(response.content);
}

// Ignore this below function for the 09module its some try

export async function chooseLLM(userQuery, listOfLLM) {
  const systemPrompt = `
    You are a llm decider for a multi-step retrieval-augmented generation (RAG) system.
    

    From the below given list select one llm which would be best for the userQuery, where you have to see that we are not wasting the tokens.

    Be careful that userquery can be from a spectrum of research or general lookup, so choosing an cost-effective and good llm is our target.
    ${listOfLLM}
    `;

  const response = await llm.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(userQuery),
  ]);

  return JSON.parse(response.content);
}
