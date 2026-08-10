
from google import genai
from google.genai import types


client = genai.Client(api_key="AIzaSyAggMphlUbAc1fbbTqTEP1W7kal44P4T14")

response = client.models.generate_content(
    model='gemini-flash-latest', contents='2+2' ## Zero shot Prompting.
)

print(response.text)