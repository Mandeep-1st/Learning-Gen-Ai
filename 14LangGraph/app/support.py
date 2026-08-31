from graph import createChatGraph
from langgraph.checkpoint.mongodb import MongoDBSaver
from langgraph.types import Command

MONGODB_URI="mongodb://localhost:27017/"
config = {"configurable":{"thread_id":"8"}}
def init():
    with MongoDBSaver.from_conn_string(MONGODB_URI) as checkpointer:
        graphWithMongo = createChatGraph(checkpointer=checkpointer)
        
        state = graphWithMongo.get_state(config=config)
        # for message in lastState.values["messages"]:
        #     message.pretty_print()
        print(state.tasks)
        lastMessage = state.values['messages'][-1]
        toolCalls = lastMessage.tool_calls

        userQuery = None
        
        for call in toolCalls:
            if call.get("name") == "humanAssistanceTool":
                args = call.get("args")
                userQuery = args.get("query")
        print("User is Trying to Ask: ", userQuery)
        ans = input("Resolution >> ")

        resume_command = Command(resume={"data":ans})
        
        for event in graphWithMongo.stream(resume_command,config,stream_mode="values"):
            if "messages" in event:
                event["messages"][-1].pretty_print()


init()