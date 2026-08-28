import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
import { Document } from "@langchain/core/documents";
import { LLMGraphTransformer } from "@langchain/community/experimental/graph_transformers/llm";
import { OpenAIEmbeddings, OpenAIClient, ChatOpenAI } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

const rl = readline.createInterface({
  input,
  output,
});

import dotenv from "dotenv";
dotenv.config();

const llm = new OpenAIClient({
  model: "gpt-4.1-mini",
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
});

const schemaExtractLLM = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
});

const embedder = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  apiKey: process.env.OPENAI_API_KEY,
});

const vectorStore = await QdrantVectorStore.fromExistingCollection(embedder, {
  url: "http://localhost:6333",
  collectionName: "MemoryChatAgent",
});

const graph = await Neo4jGraph.initialize({
  url: "bolt://localhost:7687",
  username: "neo4j",
  password: "mysupersecretpassword",
});
//emptying the db
await graph.query("MATCH (n) DETACH DELETE n");

const dataToGraphTransformer = new LLMGraphTransformer({
  llm: schemaExtractLLM,
});

async function chat(query, activeUserId) {
  console.log("Query registered...");
  //will retrieve data from graph db because in chat app we don't use relevant chunks
  let allConnections = await graph.query(
    `
  MATCH (n {userId: $userId})
OPTIONAL MATCH (n)-[r {userId: $userId}]->(c {userId: $userId})
RETURN n.id AS sourceNode, labels(n)[0] AS sourceType,
       type(r) AS relationship,
       c.id AS targetNode, labels(c)[0] AS targetType
`,
    { userId: activeUserId },
  );

  let about = [
    {
      allUserConnections: allConnections,
    },
  ];
  let systemPrompt = `
You are chat agent, your task is to solve assigned user's queries. 
In order to solve them you have to always generate answer from your knowledge, with the customization based on the user's habits and history you have in the "About" Section.

Example:
User:- Hii! it's a long weekend i need to go to trip what do you say? where should i go?
Output:- Wow! it's a great news, As i know you like Mountains and Adrenaline rush so i will suggest you should go to Spiti Valley or Leh.

The about will contain all the data relation about the user. 
About:
${JSON.stringify(about)}
`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: query },
  ];

  console.log("Calling the agent...");

  const result = await llm.chat.completions.create({
    model: "gpt-4.1-mini",
    messages,
  });

  messages.push({
    role: "assistant",
    content: result.choices[0].message.content,
  });

  console.log("Agent is thinking...");
  //creating the document of the userquery + agentResponse
  const doc = new Document({
    pageContent: `UserQuery: ${query}\n\AgentResponse: ${result.choices[0].message.content}`,
    metadata: { userId: activeUserId },
  });

  //document is added in vector store. Just for the ingestion purpose we are not going to reterive 'em
  await vectorStore.addDocuments([doc]);

  //adding for the graph db.
  const graphDoc = await dataToGraphTransformer.convertToGraphDocuments([doc]);
  const graphDocsWithId = graphDoc.map((eachDoc) => {
    //adding userid in nodes
    eachDoc.nodes = eachDoc.nodes.map((node) => ({
      ...node,
      properties: { ...node.properties, userId: activeUserId },
    }));

    //adding user id in relationships

    eachDoc.relationships = eachDoc.relationships.map((rel) => ({
      ...rel,
      properties: { ...rel.properties, userId: activeUserId },
    }));

    return eachDoc;
  });

  await graph.addGraphDocuments(graphDocsWithId);

  console.log("Agent is writing the response...");
  return result.choices[0].message.content;
}

while (true) {
  const message = await rl.question(">> ");

  if (message.toLowerCase() === "quit") {
    break;
  }

  console.log("BOT: ", await chat(message, "123"));
}

rl.close();
