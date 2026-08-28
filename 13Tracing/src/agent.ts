import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import { stdin as input, stdout as output } from "node:process";
import { exec } from "child_process";
import { promisify } from "util";
import { wrapOpenAI } from 'langsmith/wrappers'
import { traceable } from "langsmith/traceable"
import readline from "node:readline/promises";
import dotenv from "dotenv";

dotenv.config();

const rl = readline.createInterface({
    input,
    output,
});

const execPromise = promisify(exec);
const openai = wrapOpenAI(new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
}));


const runCommand = traceable(async function runCommand(command: string): Promise<string> {
    console.log("[tool] run_command called with:", command);
    try {
        const { stdout, stderr } = await execPromise(command);
        const out = stdout + stderr;
        console.log("[tool] command output:", out);
        return out.trim() || "Command executed successfully.";
    } catch (error: any) {
        return error.message;
    }
});


const getWeather = traceable(async function getWeather(city: string): Promise<string> {
    console.log("[tool] get_weather called for city:", city);
    try {
        const url = `https://wttr.in/${city}?format=%C+%t`;
        const response = await axios.get(url);
        if (response.status === 200) {
            return `The weather in ${city} is ${response.data}`;
        }
        return "Api call didn't worked";
    } catch (error) {
        return "Api call didn't worked";
    }
});

async function getGoldenResult(x: string, y: string): Promise<number> {
    console.log(`[tool] get_golden_result called with: ${x}, ${y}`);
    const xNum = parseFloat(x);
    const yNum = parseFloat(y);
    return xNum * yNum + 27;
}

const writeFile = traceable(async function writeFile(filepath: string, content: string): Promise<string> {
    console.log(`[tool] write_file called for: ${filepath}`);

    const dir = path.dirname(filepath);
    if (dir && dir !== ".") {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filepath, content ?? "");
    return `File '${filepath}' created successfully.`;
});

interface ToolInfo {
    fn: Function;
    description: string;
    param_type: "single" | "multi";
    split_limit: number;
}

const availableTools: { [key: string]: ToolInfo } = {
    get_weather: {
        fn: getWeather,
        description:
            "Takes the city name as an input and returns the current weather for that city.",
        param_type: "single",
        split_limit: -1,
    },
    get_golden_result: {
        fn: getGoldenResult,
        description:
            "Takes two number x and y as input and returns a unique golden result for that values.",
        param_type: "multi",
        split_limit: -1,
    },
    run_command: {
        fn: runCommand,
        description:
            "Takes a command as input and executes that command on the user's terminal",
        param_type: "single",
        split_limit: -1,
    },
    write_file: {
        fn: writeFile,
        description:
            "Takes a filepath and content as input and writes the content to that file. Use this whenever you need to create or write any file.",
        param_type: "multi",
        split_limit: 1,
    },
};

let toolDescriptions = "";
for (const [toolName, toolInfo] of Object.entries(availableTools)) {
    toolDescriptions += `- ${toolName}: ${toolInfo.description} (param_type: ${toolInfo.param_type})\n`;
}

const systemPrompt = `
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
{
        "step": "string",
        "content": "string",
        "function": "function name (only if step is action)",
        "input": "input for the function, multiple params separated by ||"
}

Steps:
- start  : Understand the user query.
- plan   : Plan which tool to use and why.
- action : Call the tool with input.
- observe: Analyse the tool output.
- output : Give final answer to user.

Available Tools:
${toolDescriptions}

Example:
User Query: What is the weather of new york?
{"step": "start", "content": "The user wants to know the weather in New York."}
{"step": "plan", "content": "I will use get_weather tool with 'new york' as input."}
{"step": "action", "function": "get_weather", "input": "new york"}
{"step": "observe", "content": "The tool returned 12 Degree Celsius for New York."}
{"step": "output", "content": "The weather in New York is 12°C."}

Example:
User Query: Create a file hello.py with a hello world function.
{"step": "start", "content": "The user wants to create hello.py with a hello world function."}
{"step": "plan", "content": "I will use write_file tool with filename and content separated by ||."}
{"step": "action", "function": "write_file", "input": "hello.py||def hello():\\n    print('Hello, World!')\\n\\nhello()"}
{"step": "observe", "content": "File hello.py was created successfully."}
{"step": "output", "content": "Created hello.py with a hello world function."}
`;

interface Message {
    role: "system" | "user" | "assistant" | "tool_output";
    content: string;
}

const messages: Message[] = [{ role: "system", content: systemPrompt }];

/**
 * Splits `input` on "||" but only for the first `limit` occurrences,
 * keeping everything after the last split intact as the final element.
 *
 * Mirrors Python's `str.split(sep, maxsplit)` behaviour, which JS's native
 * `String.prototype.split(sep, limit)` does NOT replicate — JS's `limit`
 * just truncates the resulting array instead of limiting how many splits
 * happen, which was silently dropping file content in write_file.
 */
function splitWithMaxSplits(inputStr: string, limit: number): string[] {
    if (limit === -1) {
        return inputStr.split("||").map((p) => p.trim());
    }

    const parts: string[] = [];
    let rest = inputStr;

    for (let i = 0; i < limit; i++) {
        const idx = rest.indexOf("||");
        if (idx === -1) break;
        parts.push(rest.slice(0, idx).trim());
        rest = rest.slice(idx + 2);
    }

    parts.push(rest.trim());
    return parts;
}

async function main() {

    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not set.");
    }



    while (true) {

        const userQuery = await rl.question(">>: ")
        messages.push({ role: "user", content: userQuery });

        while (true) {
            const openaiMessages = messages.map((m) => {
                if (m.role === "tool_output") {
                    return {
                        role: "assistant" as const,
                        content: `Observation: ${m.content}`,
                    };
                }

                return {
                    role: m.role as "system" | "user" | "assistant",
                    content: m.content,
                };
            });


            const response = await openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
                messages: openaiMessages,
                response_format: { type: "json_object" },
                temperature: 0,
            });


            const rawContent = (response.choices[0]?.message?.content || "").trim();

            if (!rawContent) {
                console.log("[warn] empty response received from model. Retrying...");
                break;
            }

            let parsedResponse: any;
            try {
                parsedResponse = JSON.parse(rawContent);
            } catch {
                console.log(`[warn] invalid JSON received: ${rawContent}`);
                break;
            }

            // Push the model's own "action" message into history too, not just
            // the tool's result — otherwise the model sees an Observation on
            // the next turn with no record of which action it belonged to.
            messages.push({ role: "assistant", content: JSON.stringify(parsedResponse) });

            if (parsedResponse.step === "action") {
                const toolName = parsedResponse.function;
                const toolInputAssistant = parsedResponse.input ?? "";

                if (!availableTools[toolName]) {
                    messages.push({
                        role: "tool_output",
                        content: JSON.stringify(`Unknown tool: ${toolName}`),
                    });
                    continue;
                }

                let toolOutput;
                try {
                    if (availableTools[toolName].param_type === "multi") {
                        const limit = availableTools[toolName].split_limit;
                        const toolInputParts = splitWithMaxSplits(toolInputAssistant, limit);
                        toolOutput = await availableTools[toolName].fn(...toolInputParts);
                    } else {
                        toolOutput = await availableTools[toolName].fn(toolInputAssistant);
                    }
                } catch (err: any) {
                    toolOutput = `Error running tool '${toolName}': ${err.message}`;
                }

                messages.push({
                    role: "tool_output",
                    content: JSON.stringify(toolOutput),
                });
                continue;
            }

            if (parsedResponse.step === "output") {
                console.log(`[agent]: ${parsedResponse.content}`);
                break;
            }

            // start / plan / observe steps
            console.log(`[think]: ${parsedResponse.content}`);
        }
    }
}

main().catch(console.error);