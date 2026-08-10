# Knowledge Graph - Introduction

Currently what we are going to learn is a differnet brain on the RAG, we have completed RAG but now we are trying to add some more brain power on top of it to make outputs and result more efficient

Knowledge Graph is nothin different it's the same thing as we saw in previous notes.

## Application

Now on the application layer we are facing two problems 1.Construction 2. Retrieval. That how we insert our data in it and then how we retrieve data from that.

In graph we can't retrieve everything, we always need a starting point, always. We need to atleast one node to pinpoint after that only we can proceed to finding the relation.

Now, where we can use this Graph dbs, when we create chat applications we usually talk a lot and if for every next prompt in that chat if we are sending all the conversation then that should be a havoc after sometime and the context window will reach its limit so what best we can do is for each prompt what user says we can create a relation of it and store it in memory, now sending full conversation is not good but we can send the graphical data about user which give the LLM good context.

## Neo4j

YOu can use it from online also and can also spin up a docker container, you can refer to some terminologies from the image

Neo4j or generally graph dbs use Cypher query language to communicate you will eventually get that but there is no side way of it.

Now to use It in RAG we have 3 ways :- Compelete raw way, Langchain way , Mem0 library way
