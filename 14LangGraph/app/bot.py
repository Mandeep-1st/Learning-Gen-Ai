from graph import createChatGraph
from langgraph.checkpoint.mongodb import MongoDBSaver

MONGODB_URI="mongodb://localhost:27017/"
# according to langGraph every stream/graph is a thread in it owns so we give it's unique ID so two user's data will not get mix up.
config = {"configurable":{"thread_id":"8"}}

def init():
    with MongoDBSaver.from_conn_string(MONGODB_URI) as checkpointer:
        graphWithMongo = createChatGraph(checkpointer=checkpointer)

        while True:
            userInput = input(">> ")
            for event in graphWithMongo.stream({"messages":[{"role":"user", "content": userInput}]},config, stream_mode="values"):
                if "messages" in event:
                    # why using [-1] becauses event["messages"] is a list obviously its what our state is a list, so we are taking last message of every list why because the last message is what added in the recent stream all others are already came in the stream when they got added.
                    event["messages"][-1].pretty_print()


init()