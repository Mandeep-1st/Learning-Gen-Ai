import os
import platform
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph.message import add_messages
from langchain.chat_models import init_chat_model
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.graph import StateGraph, START, END
from dotenv import load_dotenv
from langchain_classic.schema import SystemMessage
load_dotenv()


class State(TypedDict):
    messages:Annotated[list,add_messages]


#tools
@tool
def run_command(cmd: str):
    """Takes a command line prompt and executes it on the user's machine and returns the output of the command.
    Example: run_command(cmd="ls") where ls is the command to list the file.
    """
    result = os.system(command=cmd)
    return result

@tool
def write_file(path: str, content: str) -> str:
    """Write content to a file at the given path, creating directories as needed."""
    import os
    dir_path = os.path.dirname(path)
    if dir_path:
        os.makedirs(dir_path, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    return f"File written successfully: {path}"

def get_system_prompt():
    os_name = platform.system()  # 'Windows', 'Darwin', 'Linux'
    shell = "PowerShell" if os_name == "Windows" else "bash"
    return {"shell":shell, "os_name":os_name}

llm = init_chat_model(
    model_provider="openai",
    model="gpt-4.1",
)
llm_with_tools = llm.bind_tools(tools=[run_command,write_file], parallel_tool_calls=False)

#node 1
def chatbot(state: State):
    os_details = get_system_prompt()
    system_prompt = SystemMessage(content=f"""You are an AI coding assistant. You take input from the user and, based on the tools available to you, choose the correct tool and execute it to fulfill the request.

    ENVIRONMENT: You are running on {os_details["os_name"]}, with {os_details["shell"]} as the underlying shell for run_command.
    
    You can even execute commands and help user with the output of the command.

    Always make sure to keep your generated codes and files in chat_gpt/ folder. you can create one if not already there.
    """)
    message = llm_with_tools.invoke([system_prompt] + state["messages"])
    assert len(message.tool_calls) <= 1, "Only one tool call allowed at once."
    return {"messages":[message]}


#node 2
tool_node = ToolNode(tools=[run_command,write_file])


graph_builder = StateGraph(State)
#adding the nodes
graph_builder.add_node("chatbot", chatbot)
graph_builder.add_node("tools", tool_node)

#defining the edges

graph_builder.add_edge(START,"chatbot")
graph_builder.add_conditional_edges("chatbot",tools_condition)
graph_builder.add_edge("tools", "chatbot")
graph_builder.add_edge("chatbot", END)

def create_chat_graph(checkpointer):
    return graph_builder.compile(checkpointer=checkpointer)
