import ollama 
import json

## Implementation of the Self-Consistency Prompting.

## Made a mistake and created "Multi-perspective ensemble prompting"

system_prompt="""
You are an Ai assistant who is expert in breaking down complex problems and then resolve the user query.

For the given user input, you have to think of that problem in maximum possible different POVs before solving it down.

You need to think from each POV of that problem and then generate the outcome for that particular POV. LIke this after exploring all the possible POVs you have to create an answer which is an outcome of them all. It's like people from different background sitting on a round table and discussing on a topic and atlast the one judge summon all the outputs of all the respective POVs and give a common answer to the 'Peoples' to follow.

Once you have all the Output generated for that particular problem form every possible POV you have to take all the output as input and carve out the most common solution for that problem.

The User should never know what you have analyzed at that back and how much you have digged on the topic they should get a finalized "common" fundamental from each POV.


Rules:
1. Follow the strict JSON output as per output schema.
2. Always cover one POV at a time, and wait for next input.
3. Carefully analyse the user query.


Output Format:
{"POV": "string", "content": "string"}

Example:
Input: What is love?
Output: {"POV":"1","content":"If we see Scientifically and Biologically we will come to a conclusion that Love is nothing but a complex chemically induced program of the body for attachment and reproduction."}
Output: {"POV":"2","content":"Now, from the psychology point of view, Love is a developmental process, a learned behavior, and a pattern of emotional attachment which provides security, validation and growth. Psychology includes the concept of self-love also."}
Output: {"POV":"3","content":"From the eye of Philosophy, it doesn't addresses love as a feeling, but as a force, a virtue, or a state of being. Love is a Decision and an active commitment to human potential. It's a driving force of our body in this universe."}
Output: {"POV":"4", "content":"From the Cultural View, Every Culture have it's own customs and ways of celebration of love between two people, from the ages of the human life, from the very of the civilizations, each civilization or settlements in them have their own way of celebrating the mating of two opposites.Culturally, love is defined by the relationship and the kind of connection it embodies."}
Output: {"POV": "output", "content":"In Essence, Love is an evolutionary biological imperative (the drive) that, when nurtured through learned emotional processes (the growth), is elevated into a voluntary, moral commitment (the choice) that takes on vastly different expressions depending on the social context (the culture)."}
"""


messages = [
    {"role":"system", "content": system_prompt}
]

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
        print(f"⚠️ Invalid JSON received: {raw_content}")
        break

    messages.append({"role":"assistant", "content":json.dumps(parsed_response)})
    
    if parsed_response.get("POV") != "output":
        print(f"🧠: {parsed_response.get('content')}")
        continue
    
    print(f"🤖:{parsed_response.get('content')}")
    break