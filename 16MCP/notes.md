# MCP (MODEL CONTEXT PROTOCOL) SERVERS

Quite hyped shite let see what it does actually in real life.

## Problem statement.

So in the tool calling class where we create multiple tools and called them and created our scratchy agent. In that class how we made our agent to use tools ?

We somehow figured our own hacky way where we used to dump all the tools and their defination in the system prompt.

And prompted our agent that whenever you get action as tool you should do that tool call and wait for us to feed you the answer from that tool call. THIS was our IN_AND_ALL concept.

So now if each developers make their own way of creating tools then how we are able to scale systems to multiple developers and also if we create some tools so project dependent that if we can't use them outside the project then also there is no way we are able to do the work in there also.

### Entry of OpenAI

So then open ai came in the picture they started a function feature in that you can tell them about your function like what it's name, description the parameters it takes their types and the required parameters and all like this...
![OPENAI_WAY](image.png)

now it's says like this i will store all your tools and when your agent was working and call some tool i will redirect that request to you, with the params and all information in the response.tools.name

Now as a developer i can create map of that thing, where i can put real tool functions with thier names and when openAi gives me tool name i can access it and find and call that function from my server. BUT BUT still this function calling overhead stays with us.

And there can be a different developer who can use a forloop instead of a map so still things are chaotic.

Now this problem can come where if Google is creating tools for gmail, drive etc so that other can automate their life it can't because the devs which are sitting here have to write the application logic according to google's gmail and drive tools

but for other companies, like slack, github, amazon etc. If they all are using there own ways of writing tools and sharing them then for someone like me sitting in between it would become a problem now to solve this problem,

For example:-
GOOGLE, SLACK, GITHUB, AMAZON etc, decided that they will use some set of protocols to write tools.

```OUT_OF_SCOPE
We all seen 'Signin with google', 'Signin with microsoft', 'Signin with github'

What they are doing all of 3 are different companies yet you click one button and all the process happen is you getting signin.

now they all use OAuth2, behind what is it a standardization that how this particular thing work

1. redirect 2. code 3. code will give token 4. that token will give user info

```

So same in this case also. ATLAST WHAT MCP IS IT'S AN PROTOCOL.

`MCP (MODEL CONTEXT PROTOCOL) :- IT'S AN PROTOCOL TO FEED CONTEXT INSIDE THE MODEL`

SO WHY IT WAS A BUZZ WORD??

SO HYPPPPEDDD??

BECAUSE THERE ARE LOT OF BUILDERS ON TWITTER, THEY HAD THEIR SIDE PROJECTS, WITH APIs SO WHOLE WORLD CAN ACCESS THEM, SO THEY ALSO BUILT THE MCPs FOR THEIR SIDE PROJECTS AND TOLD EVERYONE THAT NOW AI MODELS CAN ALSO USER THEIR SERVICES, AND THEY GOT BOOMEDDD.

So what if there was no MCP for some product but you had their Apis like every business exposes their APIs which you can hit and integrate in your, in that case what you will create an internal tool in which you will call the api of that product only...

So technically this work was done by that product company only. So that mcp will also call that tool and only takes input and gives us output.

MCP_CLient and MCP-SERVEr uses Standard Input output -stdio to talk to each other, bro wtf it ain't that tuff, this is their transport like TCP for http
which means client will send the request from terminal and get the response on terminal. bro wtf this is the transport nowadays without any network layer.

Why because both MCP_Client and MCP_Server runs on our `Local Machine`

So for a Gmail i can pip install their MCP because mcp never have the core code or crucial code what it have is just the implementation which internaly the apis which consists the real code.

### Behavior MCPs

So when Mcp client starts the very first thing it does is it sends a command like, list_tools to the MCP server

MCP server -> gives the list of tools with their descriptions

So when you chat with claude/openAI, and some tool call is required so it will send the mcp server a commannd with toolName and required params

MCP discovers the tools on its own, and the agent already knows how to send commands to the MCP server because agents like claude_code, chatgpt we use already have an internally an MCP client which they can use to connect to the mcp servers of any kind.

....
sir shown how we can connect our server from cursor application becuase creating mcp client is not that easy so this big companies have their clients which can talk to any mcp server in the world, so we had to test our mcp server so he used cursor's mcp client you can use openai's, claude's

First he created a basic mcp server from the github docs, github.com/modelcontextprotocol/typescript-sdk but this is a newer version of the code there is one older way which sir used you will get that from the ai_mode recent chat in alone mafia ID.

### SSE is one more way to communicate

So currently we are communicating through the local channel or somehow we had to give our mcp's code to the client through npm or docker.

But there is an hosted way also where you can host your mcp in some server and then Mcp client can connect to you via http in the form of SSE (SERVER SENT EVENTS), where you will hit to a url once and then there you will get connected to the mcp.

Which indireclty that server of ours will expose 2 end points one 'get' and one 'post' the get endpoint will connect once with the client and then keep the connection on..

And then the client can send it's tool request to the post endpoint where that post endpoint internally executes it's command and tell the get end point which then give that data to our client.

```mcp_json_file
So how our json file changes our json file will changes a little if we want to connect to the hosted mcp server

prior it was looking like

{
    "mcpServers": {
        "server-name": {
            "command":"npx",
            "args":["-y","mcp-server"]
            "env": {
                "API_KEY": "value"
            }
        }
    }
}

for sse it will look like this
{
    "mcpServers": {
        "server-name": {
            "url": "http://localhost:3000/sse",
            "env": {
                "API_KEY": "value"
            }
        }
    }
}
```

THIS IS ALL ABOUT THE MCP.
