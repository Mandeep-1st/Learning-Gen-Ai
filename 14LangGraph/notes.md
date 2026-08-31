# LangGraph

LangGraph is an orchestration(one which manage work by itself run things etc), it was created by langchain only to solve the messiness of the code

How? When we used langchain we saw that while creating that model what the very thing that we lost is the code reliability importing a thing from somewhere and then using it anywhere without any restriction that it should be used here.

So this is unmoudularity which this code is giving us, it's not suitable for application where multiple programmers are working. Now LangGraph is an Framework, so we have to follow some of its rule of how to write code and where to write code and then on top of it, the langGraph will run the code.

So langGraph, make the humans stays in the loop for complex tasks, and help us building controllable agents.

## working

What langGraph says that you create modular code, you should write code in diff-diff modules, and then create a different file let say rag_graph and in that file tell me how you want to run that code like mod_1 -> mod2-> mod3/mod4 (depending on some condition) -> mod5 -> mod6/mod7(depending on the condition) -> mod5 -> mod6/7 (like there can be a loop where we have to run mod5 -> mod6/7 loop again ) -> End

This is the basic structure that Langgraphs says that we have to do now, more to this we can atlast do rag_graph.invoke(), this will run the whole workflow.

Now, to debug this is easy, to change in this is easy, removing and adding is easy.

They suggest us that we use langchain in that modules but we can use anything in that nodes/modules so we have to just write the logic and all.

## Sharing of the Data

Now at the very start of the data we share a Initial state to our graph, Now every time the flow of work reaches to the forthcoming module it will send this updated data / State to that module now that module itself can do several things with this data.

At the end then we will get a processed state.

## Creating first simple agent using langgraph only

Here in the file graph.py i am creating a simple agent which will follow a grpah structure so we will test the langGraph,

Now introducing some of the things here, the file was so small and concise it's not even some big deal,

So first i create 4 functions with simple logic in which 3 of them is true logic and one function is a router which routes on some specific if else case. creating a seperate function for routing is good and helps us in the future.

State Class :- so this is the class that langGraph need us to create in this we define our inital state and we pass it to the first node and till the very last node, it take TypedDict as argument which we import from langGraph only.

StateGraph :- we need to import and call this function with our passing our state in it. It's the one which creates a graphBuilder for us a tool which in future we create graph with.

Now in order to proceed in graph making first we declare all the nodes which we are gonna use in future for ordering and structuring to be added in the graphBuilder using add_node() method

Now we have to create edges which defines the flow of the execution. You will see START, END these two literals helps us to end and start our graph, so while adding edge we always give our source edge to destination edge now for the every first node there will be no source edge so we use START

now when we reach the stage where we are passing our edge which do the routing we have to do 2 diffeerent things.

1. like other nodes it won't return state it will return the name of the nodes that's gonna be in the choices (nodes from which we have to take choice) in the routing function we have to typecast it so it return desired result, we import Literal from typing module and give it the nodes names we are opting for redirection by choice.

2. we will not use simple add_edge() but we will use add_conditional_edge(srcEdge, routerFuncName), in here we don't pass the name of the node but the actual function who will do the routing.Then we can write other edges as usual and for the edges which are mentioned in the router there will be no source edge we assume that they will get called internally so we surpass their edge making and write code after it.

Moving ahead we will compile our graphBuilder and then we use the compiled code to invoke with the initial state

## MORE IN LANGGRAPH.

### Tools and Checkpoints and human in the loop

So in the previous step we get to know about how we can build a graph which then we can use to define how our flow is going to run so that part is good.

But in the real world agents we have tools to call which in the back are called by the model which we are using now how we can add that tools in these workflow.

Also, Talking about the state as we know that state get restart when we call again, so we need to save the state also like somewhere, so we can retrieve it again and model can start it's conversation from there.

See the graph.py file in the apps folder i have created a basic method of chatbot what this do is it invokes the llm and get the result and add that result in the state again, now this is basic we will add it as a node in the graph then we can invoke our graph with initial state.

Now you will see another function HumanAssistance this function is tool so for the i will use a decorator @tool() so I can flag it as tool """xxxx""", we have to write this type of comment there so langgraph can know what this tool do, xxxx will became the description of the tool automatically.

Now tool is created what tool does is simple it `interrupts` the graph flow and stop it there only.

Will continue from here, first let me tell you what checkpointing is?

So checkpointing you will see in the bot.py i have local mongo url, we are using mongoDb becuase it is to store data in NoSQL dbs, then from langGraph.checkpoint we import MongoDBSaver, we give the connection string, and create it as checkpointer.

now we will pass this checkpointer to the createGraph function, we defined this function in the graph.py, what this function does is it takes the mongoDb instance that we started as checkpointer and invoke the graph with that checkpointer.

```note
We are not using .invoke() to invoke the graph this time we can obviously and it will work good with checkpointer there is no downside but .stream() have an extra feature in which what happen is it continuously notifies us about the actions happening in the graph like state changing and interruptions etc and it will return us that values by firing events and we can catch that events. like let suppose state got changed so it will notify us about it and we can see our updated state.

what .stream() gives us is an event that event contain all the data. now you will see i am using an argument stream_mode="values" you can get to know more about them in docs but this will only return the values from the graph.

And that event will contains only values which contain our data.
```

now our graph can manage memory, what graph will do is at every event from start to end whatever change in state happen it will store it in the database or what ever tool get called it will store everything with the timestamps.

Coming back to interruption, so when interrupt will get called checkpointer will remember that the particular user query required some tool calling so it will stop the graph here and save it's current state with the state that tool_call has happened and also wait for the reply from tool call.

`Config` :- Let me tell you a bit about config like what it is and why we are using it, so langGraph consider each graph invoke or stream as an seperate thread so it wants us to give that thing some unique id from others now this is useful because for one user we need their data to be seperated from other users so `thread_id` will help us differentiation between the users and help us manage them.

`support.py`: Now see the support.py file in that file you will see, the same mongo connection thing and then graph stream.

Now you can see we are asking the graph it's previous state where it get closed, by passing the config which contains the thread_id which will help us retrieving the exact user data which we want.

This file's main purpose is it's execute the idea of human_response like what we have created tool there so what we are doing is we run this file and check if for a particular user is in their last conversation with chatbot, does chatbot called some tool???

how we can know that by seeing the last message from our state, which obviously would be an aiMessage and if that message contains an array tool_calls with length more than 0 like 1 or more. then we will be knowing that there was an tool call then checking if that tool call was human_assistance and if yes then we extract the data came with that tool call obviously it would going to be query param which was inserted by our model, we will show that query to human, and then ask for a response (in CLI only for now HEHHE),

```important
That human will give it's solution. Now, important part, we have to notify the graph that response has came please run again. from the last stage you got interrupted so for that notifying thing we use, `Command` which came from langGraph.types only from where the interrupt came, we use the Command(resume=data) this Command function give the graph instruction and resume parameter will resume the graph from the same point where it got interrupted. and then interrupt will return the data we pass with resume,


yes we can pass data while resuming and we can extract this data by just storing the interrupt() call in some variable so when graph will resume it will resume by assigning the data you shared in the "resume" argument will get stored in that variable.

```

```note
You might be thinking why we are passing the query in the interrupt because currently we are fetching independently from the saved state that if Ai called the humanAssistant or not and if yes then what was the query.

But in state.tasks from here you can always get all the interruption that happened and where graph got stopped. now you can resolve them one by one. which means you can pick query from here also.
```
