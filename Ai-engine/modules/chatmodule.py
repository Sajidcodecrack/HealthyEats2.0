# modules/chatmodule.py

import os
import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv

load_dotenv()

# Configure the Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Create a LangChain Gemini chat model
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.7,
    max_tokens=2048
)

# Define a basic conversation template prompt
prompt_template = PromptTemplate(
    input_variables=["history", "input"],
    template="""
You are a helpful AI health assistant in the HealthyEats app.
You help users lead a healthy lifestyle by providing diet plans, fitness routines, and wellness advice.
Always keep your tone friendly, encouraging, and practical.

Conversation history:
{history}

User: {input}
Assistant:"""
)

# Use LangChain's conversation buffer to keep track of chat
conversation = ConversationChain(
    llm=llm,
    prompt=prompt_template,
    memory=ConversationBufferMemory()
)

def get_health_advice(user_input: str) -> str:
    """Process user input and return a health-related response."""
    try:
        response = conversation.predict(input=user_input)
        return response
    except Exception as e:
        return f"Sorry, I encountered an issue: {str(e)}"
