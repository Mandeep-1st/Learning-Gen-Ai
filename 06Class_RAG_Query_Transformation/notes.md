# RAG Technique.

## Advance RAG.

There are 3 more top on things that we do majorly in advance rags, yes! advance rag's pipeline depend on the business use case but still these are some quite steps that we take nonetheless.

1. Query Transformation
2. Routing
3. Query Construction
4. Indexing
5. Retrieval
6. Generation

The motive of the advance rag is to make our system accurate or we can say to make our rag accurate.

## Query Transformation / Translation

In this part we solely focus on the user's part that what they enter and from a dev point of view we take it as that user doesn't completely know what they want so while entering the query they can do several mistakes which can be a major problem. HOW?

Because when user give input with ambiguity,the response also contains the ambiguity and that can make the user experience bad in itself. "GARBAGE IN GARBAGE OUT".

\*\* Abstraction :- A concept of hiding the details.

Now as we know the user query can get bad time to time and can miss the essence of what user actually intended to ask so in order to get that intent we use abstraction.

\*\* Less Abstraction & More Abstraction

Yes! we use both, because the user query will always stays in the middle but we want it to get stretched on both levels as we work with it. We will shift the user query to the less Abstraction and to the more Abstraction to get the more extract of his intent.

so our main goal is to re-write the query using some techniques like (RAG Fusion, Multi Query)

### Parallel Query (Fan Out).

It's a pretty straight forward thing that user will insert one query then we will create 4 queries out of it then we will search in any db (which already contains the data knowledge from which we want our llm to give replies.)

Then for each query we will get some chunks then i will take that chunks and get an intersection of them so the repeated chunks will not get involved. Then from the chunks i got we will put that in our llm, but how? so we will use the user's main query, with the relevant chunks that i have now, we put them inside the llm's and then combined we will get an output.

\*\* So what we did in this step is didn't changed anything core just did change the way of reterival and generation.

### Reciprocate Rank Fusion.

Now this is a little different than what we saw above, in above design we were doing an intersection on the documents that we were getting, but in this design we use an ranking algorithm to rank the documents instead of putting them as it is which means that algo will decide in which order we will put them in the LLM,

Now how that ranking will work would be simple the more one appear will be the first and if the appearance count is same then the order which they come like from A and B if both appeared 2 times but A appeared last both and B appeared first and last in both then B will be our priority.

\*\* THIS IS THE CODE THAT WE ARE USING TO RANK OUR THE DOCUMENTS.

```python
## what is k? it's a type of tunable constant which just say how much we have to rank the higher and lower documents it's just like if our ranking is looking like this [1,2,3,4] then k will just do [61, 62, 63, 64]
def reciprocal_rank_fusion(rankings, k=60):
    scores = {}
    for ranking in rankings:
        for rank, doc_id in enumerate(ranking):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank + 1)
        return sorted(scores.items(), key=lambda x: x[1], reverse=True)
```

### Query Decomposition

\*\* Till now what we were doing was just playing with the user query but so there are two options that we can do and that is Abstraction and less Abstraction that are two things that we can do.

This means hum user ki query kai saath 2 kaam kar skte h yaa toh uski query ko More abstract bna skte h yaa toh less abstract, and inn dono kaamo ko karne k humare passs ways hote hain.

### Less Abstraction

- CoT - Chain of thought :- use to break down the problem in smaller pieces.

how we do this let's find out that, in this method

In this for the given query we will generate 5 steps approx to solve that query, it's sound exactly same as we did it in the prompt engineering but this is different because we are creating a RAG pipeline now which is quite different.

User will give the query we will pick it and give to the model with system prompt like " For the given query generate step by step plan how to answer this" this is how we will get our 5 detailed break down of main query then :

1st query -> give to the db search for relevant chunk -> relevant chunk + 1st query -> LLM -> Output one

2nd query + output one -> give to the db search for relevant chunk -> relevant chunk + 2nd query -> LLM -> Output two
.
.
.
.
5th query + output four -> give to the db search for relevant chunk -> relevant chunk + 5th query -> LLM -> fifth Output

Now we will take the user query with these all output put them in llm and then we will get a good result

User query + 1st output + 2nd output + 3rd output + 4th output + 5th output -> LLM -> Final Result

'''
Based on our previous conversation:
{user_main_question}

[{prev_ques_ans}]
'''

#### Abstraction

- Step Back prompting

In this type of prompting we use abstraction, we want to overlook the question asked by the user and want to check the overall persona of the question, because there are times when we need to access the old data of the AI instead of doing some google search.

we use shot prompting in this system what is shot prompting where we give few examples to ai and it do it's work on that basis.
Here are some example which shows how a question can be framed as abstract then the original

e.g Original Question | Step-back question

      when did england last get to   | Which year did england get to the semi final in a world cup as of 2019?
      the semi-final in a world cup  |
      as of 2019                     |

      what is the biggest hotel in   | what is the size of hotels in las vegas nv as of November 28, 1993
      las vegas nv as of November 28,|
      1993                           |

now after creating this step-back query you can go and find the documents from db on this basis and then you will get some doc chunks use them to reply to the user's query, where you will again use the user's original query and answer it from the chunk you just found.

### HyDE :- one more way of Query Translation (most used)

Hypothetical Document Embeddings.

comparatively easier in this what we do is we take user query and tell our model to create a whole document on that topic our model will do the same then we will take that document and then we will find embedding or chunks on the basis of this hypothetical doc using that embeddinggs we can answer the user query.

now there is one downside of this and that is it only works in Large models like GPT 5.1 not mini or small models
