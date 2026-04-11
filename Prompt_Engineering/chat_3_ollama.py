import ollama
import json

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

chat_response = ollama.chat(
    model='gemma4:e4b',
    messages=[
        {"role":"system", "content": system_prompt},
        {"role": "user","content": "What is 3 + 4 * 5?"},
        {"role": "assistant", "content":json.dumps({
        "step": "analyse",
        "content": "The user has provided an empty input. I need to analyze this situation and prepare for the next interaction by adhering to the structured response format. The core task is to wait for a complex problem to break down, but I must follow the required steps regardless."
        })},
        {"role":"assistant", "content":json.dumps({"step": "analyse", "content": "The user is asking for the result of the mathematical expression '3 + 4 * 5'. This requires applying the established rules of mathematical operations, specifically the order of operations (PEMDAS/BODMAS)." })},
        {"role":"assistant","content":json.dumps({"step": "think", "content": "I need to solve the expression $3 + 4 * 5$. Following the order of operations (PEMDAS/BODMAS), Multiplication must be performed before Addition.\nStep 1: Identify the operations. We have addition (+) and multiplication (*).\nStep 2: Prioritize multiplication. Calculate $4 * 5$.\nStep 3: Perform the multiplication: $4 \times 5 = 20$.\nStep 4: Substitute the result back into the expression: $3 + 20$.\nStep 5: Perform the addition: $3 + 20 = 23$.\nAlternative perspective check: If I incorrectly calculate from left to right (Addition first): $3 + 4 = 7$, then $7 * 5 = 35$. This confirms that following the order of operations is critical, and 35 is incorrect."})},
        {"role":"assistant","content":json.dumps({"step": "think", "content": "I need to ensure the logic is sound and robust before stating the final result. The structure of the expression $3 + 4 * 5$ dictates that multiplication takes precedence over addition. \n\n1. **Operation identification:** Operations are addition (+) and multiplication (*).\n2. **Rule application:** PEMDAS/BODMAS states Multiplication must occur before Addition.\n3. **Calculation sequence:** First, calculate the product of 4 and 5. $4 \times 5 = 20$. \n4. **Final calculation:** Next, add 3 to the result: $3 + 20 = 23$. \n\nThe logic flow is sound, and the calculation is straightforward multiplication followed by addition."})},
        {"role":"assistant","content":json.dumps({"step": "result", "content": "23"})},
    ]
)

print(chat_response['message']['content'])