## Routing

Now this is non-opinionated topic which means it doesn't have any blueprint that where it will work and how it will work.

we can just know about it that how it will work and what is routing, and what' the purpose of it.

the placeOfUse, the system prompt etc will depend from application to application

### Logical Routing

THIS PART COMES BEFORE QUERY DECOMPOSITION

you will actually route user on the basis of actions from the user.

A business can never have a single type of data like pdfs. A business can never have only pdfs, it can have websites, videos, images, blogs, articles etc.

So now Logical Routing's work is to point us in the right data's direction.

now let suppose we have chunked each type of data and stored it in some db(pinecone,qdrant) now after that, when user asks some query which have nothing to do with other data but only with the website one, so searching in that data will after all killing our processing and slowing us down.

So Logical Routing's our very first step is go to correct data source.So we can create a function like getRightDb(query) we can use a smaller model to recognise by the user query and the available dbs that which is gonna used.

we have to spin multiple databases(or namespace inside one database) then we can point easily which one we have to go for this particular query.

Now there can be a possibility that you have to search in multiple databases instead of one like some query get that type of requirement. Now in that case what you do??

the way of giving db information to agent before asking you can give a simple detail like if you have particular db so what it stores and in which way. like financial records : PDFs, employee record : JSON etc.

Sir: According to Sir, He says that for the userQuery we can get 3-4 diff version of the same userQuery now we will retrieve the whole list of database that's gonna needed for this query now like this for each query we will get some list of databases like [we have 100 dbs] now from that for each query we are getting 2 or 3 or 5, now we will use ranking in here also and we can rank the dbs which got selected the most number of times, and we will choose first 5 or 3. then we will do our usual thing. SO ranking db before ranking documents.

ME: What we can do is for the query we can send that to the model nad tell the model to break its requirement, like if it's requirement is 2 dbs than i can tell model to break the query in 2 diff parts and then 3rd query indicating their union. now for each query i will get their relevant db and then the relevant db too, now we will find relevant chunks and then we will feed all the chunks with user's main query so like this we can get the answer. "NOW HOW EFFECTIVE IS THIS I DON't FUCKING KNOW WE HAVE TO CHECK."

there's a things that we can do while scraping the websites sometimes what happen is we have to know like if there is a lot of differrent type of data in the web-page so we have to use a model in between where after creating a chunk we can can ask the model that from which db this chunk belong if it belong to any pre-created then okay and if it need new collection so model can just name and we can create a new one for it.

Which conclude that you can route to anything specific models, googleSearch, dbs, websites etc. just create tools for that.

### Semantic Routing

This is used in very less cases. Where you create a RAG on a very specific topic a very very specific topic that you are going to ask query on a very specific case like checking sales or etc.

What actually happen is you will see that the RAG pipeline you created is working on some prompts better and more fine then the custom prompts from user like the model is not able to give the answers.

So in this case what we do is we pre-create prompts and store them, like because our RAG is very specific so definitely it is doing 4-5 tasks so what we do is we create detailed huge prompts to do that task now for that prompts agent is working best.

So we use semantic routing, like when any user asks us a question we will use a model to route user's query to one of the prompt by that we can get what user wanted to ask then we will tell the model to embed user's intent and query into this prompt like modify this pre-written prompt including user given details.

ex:- We wrote a long prompt on how to create sales dashboard like include this info in line chart , and this in bar chart and this etc...

Now user asks that can you please create sales dashboard of last quarter in dark mode, so the long prompt that we had model will edit that in a way where user query will get resolve and model can also give it's best result.

So this is what known as semantic routing.

**Now Routing is not limited to the dbs or different llms or models only it also works how we switch from one type of db from another type of db, we also route what to do first like where to route first then to this and then to that.**

## Graph Database

When people were creating complex RAG systems there was on thing which ccame across that because of the Vector Databases we can create RAGs to a specific limit only.

Vector databases have the biggest con and that is the Relations there are no relationships stored or maintained in the vector databases.Which are one of the most important thing to have in a database.

So this is the point where Graph database got a Peak, where Graph database started getting used on very high basis in AI applications.

So how we work now?????????

So when we create a chunk from the data, first thing we do is creating vectors for it like do create embeddings.
then in another pipeline we ask LLM to extract out the entities, from the chunk, let suppose we had embedded a story, now we are extracting the entities from it, which can be lion, rabbit, well, hunter, and all animals

And then we create that entities in graph database, and then we find out relations between them , like rabbit was running from hunter, rabbit got stuck with lion, lion got drowned in well, rabbit and remaining animals were happy at the end.

So these are the relations, so currently what i wrote is in text but actually in graph database there is a mapping which happens.
And these is also extracted by LLMs only.And we stored it in graph.

now if someone search for rabbit , i will extract out the chunk of the rabbit and in that chunk if Lion is also there, now what i do is extract out the entities from chunk [lion, rabbit] and find both node in graph, now graph will tell me the relation of them like in story how they both are connected to each other.

Now if I will give this relation from graph database and also the chunk to LLM, I will get far better answer.

Because if you were working on some story or novel, with just a name of someone, like Victor, you can't predict something or get information on that thing. What was the context going on.

MODERN Apps used both.

"Neo4J" is graph database which adapted and gave vector embeddings in it only, prior they were graph database but now with it they are doubling down on AI so they are also giving this Vector embeddings things.

**`So vector databases Semantic meaning nikal k laate hein and graph database relations nikal kai late h.`**
