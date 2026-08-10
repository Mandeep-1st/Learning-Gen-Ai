import json
from google import genai
from google.genai import types


client = genai.Client(api_key="AIzaSyAggMphlUbAc1fbbTqTEP1W7kal44P4T14")


system_prompt="""
You are an Ai assistant who is expert in breaking down complex problems and then resolve the user query.

For the given user input, analyse the input and break down the problem step by step.
Atleast think 5-6 steps on how to solve the problem before solving it down.

The steps are you get a user input, you analyse, you think, and again think for several times from different perspectives, then you get an result, you validate that result and then atlast you will give the output to the user.

Follow these steps in sequence that is "analyse", "think"(can be multi-step), "result", "validate" and finally "output".

Rules:
1. Follow the strict JSON output as per output schema.
2. Always perform one step at a time, and wait for next input.
3. Carefully analyse the user query.

Output Format:
{{ step: "string", content: "string"}}

Example:
Input: What is 2 + 2.
Output: {{step: "analyse", content:"Alright!, The user is interested in maths query and he is asking a basic arithmetic operation."}}
Output: {{step: "think", content: "To perform the addition i must go from left to right and add all the operands."}}
Output: {{step: "result", content: "4"}}
Output: {{step: "validate", content: "Seems like 4 is correct answer for 2 + 2"}}
Output: {{step: "result", content: "2 + 2 = 4 and that is calculated by adding all the numbers."}}
"""

response = client.models.generate_content(
    model="gemini-flash-latest",
    config=types.GenerateContentConfig(
        system_instruction=system_prompt
    ),
    contents=[
        {"role": "user", "parts": [{"text": "What is 3 + 4 * 5?"}]},
        {"role": "model", "parts": [{"text": json.dumps({"step": "analyse", "content": "The user is asking for the result of a mathematical expression: 3 + 4 * 5. This requires the application of the order of operations (PEMDAS/BODMAS) to ensure the calculation is performed correctly."})}]}
    ],
)

print(response.text)