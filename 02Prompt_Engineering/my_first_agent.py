## weather_api wttr.in/city_name?format=%C+%t

import ollama
import json
import requests


## Now we have created a agent on the database to query it.
def zomato_db(sql_query:str):
    pass

## Now we have our Warp
import subprocess

def run_command(command: str):
    print("⚙️: run_command is called with command:", command)
    result = subprocess.run(
        command,
        shell=True,
        capture_output=True,
        text=True
    )
    output = result.stdout + result.stderr
    print("Command Output:", output)
    return output.strip() if output.strip() else "Command executed successfully."

## Here now our agent had became an realtime bot, like chatgpt.
def google_search(query:str):
    pass

def get_weather(city:str):
    print("⚙️: get_weather is called for city: ",city)
    
    url=f"https://wttr.in/{city}?format=%C+%t"
    response = requests.get(url)
    
    if response.status_code == 200:
        return f"The weather in {city} is {response.text}"
    return "Api call didn't worked"


def get_golden_result(x:str, y:str):
    print(f"⚙️: get_golden_value is called with values: {x} and {y}")
    # Convert string inputs to numbers for calculation
    x = float(x)
    y = float(y)
    return x * y + 27

def write_file(filepath: str, content: str):
    print(f"⚙️: write_file called for: {filepath}")
    with open(filepath, "w") as f:
        f.write(content)
    return f"File '{filepath}' created successfully."

available_tools={
    "get_weather":{
        "fn":get_weather,
        "description": "Takes the city name as an input and returns the current weather for that city.",
        "param_type":"single",
        "split_limit": -1
    },
    "get_golden_result":{
        "fn": get_golden_result,
        "description": "Takes two number x and y as input and returns a unique golden result for that values.",
        "param_type":"multi",
        "split_limit": -1
    },
    "run_command":{
        "fn":run_command,
        "description": "Takes a command as input and executes that command on the user's terminal",
        "param_type": "single",
        "split_limit": -1
    },
    "write_file": {
        "fn": write_file,
        "description": "Takes a filepath and content as input and writes the content to that file. Use this whenever you need to create or write any file.",
        "param_type": "multi",
        "split_limit": 1
    }
}



tool_descriptions = ""
for tool_name, tool_info in available_tools.items():
    tool_descriptions += f"- {tool_name}: {tool_info['description']} (param_type: {tool_info['param_type']})\n"



system_prompt = f"""
You are a helpful AI Assistant specialized in resolving user queries.
You work in start, plan, action, observe, output mode.

For the given user query and available tools, plan step by step execution.
Select the relevant tool and perform one action at a time. Wait for observation before proceeding.

Rules:
- Always perform ONE step at a time and wait for next input.
- Carefully analyse the user query before starting.
- Never mention tools in your final output — always give crisp, short answers.
- Any pre-processing of data should be done by you, don't rely on tool calls for everything.
- While running commands, give ONE command per tool call.
- For file related operations, always check the location of file requested for and then do the asked operations.
- For Github related operations, always check the current status of the repo and then only proceed.
- For writing files, ALWAYS use the write_file tool. Never use run_command for file writing.
- For multi-param tools, separate inputs using || as delimiter.
  - Example for write_file: "sum.py||def add(a, b):\\n    return a + b"
  - Example for simple multi-args: "london||paris||new york"
- File content may contain commas, so NEVER use comma as a separator.

You MUST respond with ONLY valid JSON. Do NOT include explanations, thoughts, or extra text.

Output JSON Format:
{{
    "step": "string",         
    "content": "string",      
    "function": "function name (only if step is action)",
    "input": "input for the function, multiple params separated by ||"
}}

Steps:
- start  : Understand the user query.
- plan   : Plan which tool to use and why.
- action : Call the tool with input.
- observe: Analyse the tool output.
- output : Give final answer to user.

Available Tools:
{tool_descriptions}

Example:
User Query: What is the weather of new york?
{{"step": "start", "content": "The user wants to know the weather in New York."}}
{{"step": "plan", "content": "I will use get_weather tool with 'new york' as input."}}
{{"step": "action", "function": "get_weather", "input": "new york"}}
{{"step": "observe", "content": "The tool returned 12 Degree Celsius for New York."}}
{{"step": "output", "content": "The weather in New York is 12°C."}}

Example:
User Query: Create a file hello.py with a hello world function.
{{"step": "start", "content": "The user wants to create hello.py with a hello world function."}}
{{"step": "plan", "content": "I will use write_file tool with filename and content separated by ||."}}
{{"step": "action", "function": "write_file", "input": "hello.py||def hello():\\n    print('Hello, World!')\\n\\nhello()"}}
{{"step": "observe", "content": "File hello.py was created successfully."}}
{{"step": "output", "content": "Created hello.py with a hello world function."}}
"""

messages = [
    {"role":"system", "content": system_prompt}
]



while True:
    user_query = input(">> ")
    messages.append({"role":"user","content":user_query})


    while True:
        response = ollama.chat(
            model="gemma4:e4b",
            messages=messages,
            format="json"
        )
        
        raw_content = response.get("message", {}).get("content", "").strip()
        try:
            parsed_response = json.loads(raw_content)
        except json.JSONDecodeError:
            print(f"⚠️: Invalid JSON received: {raw_content}")
            break

        if parsed_response.get("step") == "action":
            tool_name = parsed_response.get("function")
            tool_input_assistant = parsed_response.get("input")
            # calling the function
            if available_tools[tool_name]["param_type"] == "multi":
                limit = available_tools[tool_name].get("split_limit", -1)
                if limit == -1:
                    tool_input_parts = [p.strip() for p in tool_input_assistant.split("||")]
                else:
                    tool_input_parts = [p.strip() for p in tool_input_assistant.split("||", limit)]
                tool_output = available_tools[tool_name]["fn"](*tool_input_parts)
            else:
                tool_output = available_tools[tool_name]["fn"](tool_input_assistant)
                  
            messages.append({"role":"tool_output", "content":json.dumps(tool_output)})
            continue

        
        messages.append({"role":"assistant", "content":json.dumps(parsed_response)})

        if parsed_response.get("step") == "output":
            print(f"🤖:{parsed_response.get("content")}")
            break
        
        if parsed_response.get("step") != "output":
            print(f"🧠:{parsed_response.get("content")}")
            continue

