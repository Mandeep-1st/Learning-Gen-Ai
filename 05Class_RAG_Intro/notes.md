# INtroduction to RAG.

So what is RAG, What we actually do in it.

Full form :- Retrieval Augmented Generation.

It's use is to add the relevant data inside the prompt or context before sending to some NLP surface. Before we created the Weather application, so we did this there, in which we called a tool call and the result from that we used to add that in the current chat window.

Because for the model nothing matters your tool call or anything what it cares about the chat window which it's working in, so when you were asking the weather of the "Patiala", so we just added a tool call layer in between this chat where after understanding what user is asking model evaluated that and then based on our examples it followed the instruction and made the tool call not by itself but it just gave the string in which we expected and we are smart so we interpreted that he wants to do some action so we just did on it's behalf and added the result in the chat only, now model can read the result from the chat which we obviously don't let the user see, user can see his and bot's chat.

Now this seams so linear and easy to follow or build but the problems comes here :

As we move forward in this we have the whole world data for a business use case or for whole countries now from that piece of thing and finding the relevant data for the requesting user is very hard task why?

## Context Window

Yes, because of the context window that in the given amount of time we can only send a certain amount of process should happen of a data.

Now let's take an scenario of an business having 50K row in an excel sheet now if some employ wan't some inferring then we have to understand their needs and then input the relevant 40 rows only not the everything.

Now the optimization of this pipeline where finding between the the user's relevant data from a big bulk of data.

## Creating a normal application from the RAG.

-> Let suppose we have a nodejs pdf documentation and we need our agent to write code on file handling, so what i can do is i can use that whole pdf of nodejs file handling and convert it in the text and then i will convert that text and pass it in with the system prompt.

Now initially my system prompt will be bigger but then after entering the chat it will be good and let suppose we are okay with the system prompt and don't have any problem with the context window and if we are okay to send the whole thing.

-> But what if the pdf gets too long and we are not able to send the whole pdf in the context in that case we have to re-architect the whole thing so we can choose the relevant data on the base of the user query and then we can make it work like nothing else.

-> Now that means i have to do some pre-processing on the file.

-> We will do Indexing to the data, which means we will break the whole data source that we have in chunks and do the numbering.

-> Then we will send these indexed pages to get Vectorized and from which we will get the Vectors for the particular data like let suppose we have divided pdf in 10 chunks then for each chunks we will convert them into Vectors to get their semantic meaning and we will store them in the database.

-> Now after doing this when user asks something we will take their query and also convert it into vectors to get their semantic meaning so we will use that semantic meaning to search in our vector database where we have putted all the vectors from pdf, now we will extract the number of chunks which are semantic so close to the user query and let suppose chunk 3 and 4 is the closest so we can use that chunk to feed in the system prompt with the user query now that's the way we can reduce the load from the system prompt.

-> So this pipeline had two work to do, 1. Indexing 2.Data retrieving.

-> DATA_SOURCE ===> Chunking ====> Embeddings ====> Vector DB.
-> User_Query ====> Embeddings =====> Search in Vector DB ====> Relevant chunks
-> Relevant_chunks ===> Data Source ===> Relevant_Data + User Query ===> LLM MODEL ===> OUTPUT.

Here the question might be that why we are going from the Relevant chunks to the DataSource, because if we have stored chunk numbers or indexed values then in that case we have to retrieve the very last data that we have to and that can only be came from the real data store, now in a case where you have stored the complete data instead of some chunk numbers, then in that case you don't have to go the Data source again you can be satisfied with the Vector db only.

-> Now we are going to write the code for it, so in order to do that you have to perform every step now either we can do that by ourself completely and if you don't want to do things by yourself then we have a product called LangChain let's see what that do.

## LangChain

So if you see the documentation of the LangChain so you will come to know it's a big library. With tones of pre-made functions for everything and that's pretty darn good thing.

So Using these provided components we make chain for our pipeline.

Example:-

1. Ingest_chain -> loader = pdf_loader ------ splitter = text_splitter() ------- embedding = OpenAi() --- QuadrantDB = Quad_vector()
   - Here we send one's output inside one's input and like this we move ahead and make a chain. You can then invoke a chain.

Starting to use some Langchain in the rag_1.py.

## Real World RAG

So the RAG that we saw up till now was nothing it was not even considered a rag in real world because that's a pretty dumb thing to make where we are not doing anything and trusting a lot on user's input which will not happen in the real world use case.

### Example of high level RAG.

Let's talk about High level RAG.

In High level rag when you get a query you don't usually consider it as whole ask of user (cos user is dumb), what we can do is we can feed that query of the user to our ai model and ask it to give us multiple same sounding query, like more forms of the same questions around 4-5 more ways.

Now we will search in our vector db with for all these queries around 5-6 queries including user's actual query, then we will get bunch of documents on that basis, then after accumulating all the document we will rank them on the basis of the some algorithm that we have like "rank_fusion" and all, after ranking we will get some highly repeated documents now we take that documents and combine them in to an arbitary one document, then we will send that arbitary document to a Ai model and ask it to give us more information around that topic which document is holding, now it will give us some more information.

We will take that information given by him and run a document search again in our database now we will get some more documents, now we will feed this all documents to our model with the user query and make him answer the query.

-> This is an good level of RAG that we implement.
