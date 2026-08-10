import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { llm } from "./model.js";

export async function abstractUserQuery(userQuery) {
  const systemPrompt = `
    You are a query abstracting assistant for a step-back prompting retrieval-augmented generation (RAG) system.

    Given a user's query, you have to overlook the question asked by the user and have to check the overall persona of the question.

    
    Rules:
    - The given query should not deviate the whole topic, our main focus is to broad up the view a bit.
    - Do not include reasoning, explanations, or the final answer - only the final query.
    - Return only valid JSON in this exact format, with no preamble or markdown formatting:
    {
        "finalQuery":"..."
    }


    Here are some few examples, showing how to do the same,
    Example:
    user_query:- when did england last get to the semifinal in a world cup as of 2019?

    Output:
    {
        "finalQuery":"Which year did england get to the semi final in a world cup as of 2019?"
    }
    
    user_query:- what is the biggest hotel in las vegas nv as of November 28,1993
    
    Output:
    {
        "finalQuery":"What is the size of hotels in las vegas nv as of November 28,1993"
    }
    `;

  const response = await llm.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(userQuery),
  ]);

  return JSON.parse(response.content);
}
