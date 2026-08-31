from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph.message import add_messages
from langchain.chat_models import init_chat_model
from langgraph.graph import StateGraph, START, END
from dotenv import load_dotenv
load_dotenv()
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.types import interrupt

@tool()
def humanAssistanceTool(query: str):
    """Requesting assistance from Human"""
    # Requesting assistance from human, it will be called by AI only
    humanResponse = interrupt({"query":query}) # At this point graph will exit out after saving everything in db. which means when graph interact with Interrupt it automatcially saves the data and flag that he didn't received data yet and when it receives it proceed from here only.
    return humanResponse["data"] # when the human give response it will resume from here with the data. And graph will send the tool response with all the other messages in the context. like usual.
    
    
tools = [humanAssistanceTool]

llm = init_chat_model(model_provider="openai", model="gpt-4.1-mini") 
llmWithTools = llm.bind_tools(tools=tools)

class State(TypedDict):
    messages: Annotated[list, add_messages]
    
    
def chatbot(state: State):
    message = llmWithTools.invoke( state.get("messages"))
    assert len(message.tool_calls) <= 1, "Only one tool call allowed at once."
    return {"messages":[message]}



toolNode = ToolNode(tools=tools)

graphBuilder = StateGraph(State)

graphBuilder.add_node("chatbot", chatbot)
graphBuilder.add_node("tools",toolNode)


graphBuilder.add_edge(START, "chatbot")
graphBuilder.add_conditional_edges("chatbot", tools_condition)
graphBuilder.add_edge("tools", "chatbot")
graphBuilder.add_edge("chatbot", END)



# graph with no memory    
graph = graphBuilder.compile()

def createChatGraph(checkpointer):
    return  graphBuilder.compile(checkpointer=checkpointer)


