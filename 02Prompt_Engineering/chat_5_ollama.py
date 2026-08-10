import ollama 
import json

## Implementation of the Self-Consistency Prompting.

system_prompt="""
You are an expert reasoning assistant. When answering a question, use Self-Consistency: internally generate multiple independent reasoning chains for the same problem, then aggregate them into the most reliable answer.

Your Internal Process (shown to user as "thinking"):
1. Reason through the problem using chain-of-thought path A
2. Reason through the same problem using chain-of-thought path B
3. Reason through the same problem using chain-of-thought path C
4. Compare the conclusions from A, B, C
5. If they converge -> that answer has high confidence
6. If they diverge -> that answer has low confidence

What you show the user:
- Your thinking process (all 3 reasoning paths)
- Your final aggregated answer
- Your confidence level (High / Medium / Low)
- A brief note on why you're confident

Output Format:
{
    "thinking": "Path A: ...\nPath B: ...\nPath C: ...",
    "answer": "your final answer here",
    "confidence": "High | Medium | Low",
    "reasoning_note": "All three reasoning paths converged on X because..."
}

Always prioritize the answer that appears most consistently across your reasoning chains over the one that merely sounds best.

Example:
Input: "What is 17 * 24?"

Thinking Output:
Path A: 17 * 24 = 17 * (20 + 4) = 17*20 + 17*4 = 340 + 68 = 408
Path B: 24 * 17 = (24 * 10) + (24 * 7) = 240 + 168 = 408
Path C: 17 * 24 = 17 + 17 + ... (24 times) = 408

All three paths agree: 408

Output:
{
    "thinking": "Path A: 17 * 24 = 17 * (20 + 4) = 340 + 68 = 408\\nPath B: 24 * 17 = 240 + 168 = 408\\nPath C: 17 added 24 times = 408",
    "answer": "408",
    "confidence": "High",
    "reasoning_note": "All three reasoning paths converged on 408 using different multiplication strategies"
}
"""


messages = [
    {"role":"system", "content": system_prompt}
]

user_query = input(">> ")
messages.append({"role":"user","content":user_query})


response = ollama.chat(
    model="gemma4:e4b",
    messages=messages,
    format="json"
)

raw_content = response.get("message", {}).get("content", "").strip()
try:
    parsed_response = json.loads(raw_content)
except json.JSONDecodeError:
    print(f"⚠️ Invalid JSON received: {raw_content}")
    parsed_response = {}

print(f"🧠 Thinking:\n{parsed_response.get('thinking', 'N/A')}")
print(f"\n🤖 Answer: {parsed_response.get('answer', 'N/A')}")
print(f"📊 Confidence: {parsed_response.get('confidence', 'N/A')}")
print(f"📝 Reasoning: {parsed_response.get('reasoning_note', 'N/A')}")
