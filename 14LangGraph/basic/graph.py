from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from typing import Literal
from pydantic import BaseModel # zod of python
from dotenv import load_dotenv
load_dotenv()
from langsmith.wrappers import wrap_openai
from openai import OpenAI


client = wrap_openai(OpenAI())

# just a schema i want to give to openAi to give response in the same format only.
# Now openai will return in the same format as written in this class
class DetectCallResponse(BaseModel):
    isCodingQuestion: bool
    
    
class CodingAIResponse(BaseModel):
    answer: str
    
class State(TypedDict):
    userMessage: str
    aiMessage: str
    isCodingQuestion: bool


# we needed a routing node (Node 1)
def detectQuery(state: State):
    userMessage = state.get('userMessage')
    SYSTEM_MESSAGE = """
    You are an AI assistant. Your job is to detect if the user's query is related to coding question or not.
    Return the response in specified JSON boolean only.
    """
    
    result = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        response_format=DetectCallResponse,
        messages=[
            {"role":"system","content":SYSTEM_MESSAGE},
            {"role":"user", "content":userMessage}
        ]    
    )    
    state.update(isCodingQuestion= result.choices[0].message.parsed.isCodingQuestion)
    return state


# a route edge.
def routeEdge(state: State) -> Literal["codingQuery","simpleQuery"]:
    isCodingQuestion = state.get("isCodingQuestion")

    if isCodingQuestion:
        return "codingQuery"
    else:
        return "simpleQuery"



# Solve the coding question(Node 2.1) runs if user query is about coding 
def solveCodingQuery(state: State):
    userMessage = state.get('userMessage')
    
    SYSTEM_MESSAGE = """
        You are an AI assistant. Your job is to resolve the user's query based on coding related question he/she is facing.
        """

    result = client.beta.chat.completions.parse(
        model="gpt-4.1-mini",
        response_format=CodingAIResponse,
        messages=[
            {"role":"system","content":SYSTEM_MESSAGE},
            {"role":"user", "content":userMessage}
        ]    
    )
    state.update(aiMessage=result.choices[0].message.parsed.answer)

    return state


# Solve simple question(Node 2.2) runs if user query is not about coding 
def solveSimpleQuery(state: State):
    userMessage = state.get('userMessage')
    
    SYSTEM_MESSAGE = """
        You are an AI assistant. Your job is to chat with user.
        """

    result = client.beta.chat.completions.parse(
        model="gpt-4.1-nano",
        response_format=CodingAIResponse,
        messages=[
            {"role":"system","content":SYSTEM_MESSAGE},
            {"role":"user", "content":userMessage}
        ]    
    )
    state.update(aiMessage=result.choices[0].message.parsed.answer)

    return state


# Now we will create graph
graphBuilder = StateGraph(State)

# then we add all the nodes we have
graphBuilder.add_node("detectQuery", detectQuery)
graphBuilder.add_node("codingQuery", solveCodingQuery)
graphBuilder.add_node("simpleQuery", solveSimpleQuery)
graphBuilder.add_node("routeEdge", routeEdge)

# now we tell them how to traverse
graphBuilder.add_edge(START, "detectQuery")
# when we deal in the conditional functions we hve to pass actual function
graphBuilder.add_conditional_edges("detectQuery",routeEdge)
# now routeEdge have condition from where we have 2 options
graphBuilder.add_edge("codingQuery",END)
graphBuilder.add_edge("simpleQuery",END)


# now we compile this graph
graph = graphBuilder.compile()


# calling the graph
def callGraph(userQuery:str):
    state = {
        "userMessage":userQuery,
        "aiMessage":"",
        "isCodingQuestion":False
    }
    final_Result = graph.invoke(state)
    
    print("Result: ", final_Result)
    
    
callGraph("Hey! how are you? My name is Mandeep Sharma")