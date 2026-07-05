import os
from langchain_groq import ChatGroq

# Initialize Groq LLM configuration
def get_llm(model="llama-3.3-70b-versatile", temperature=0.1) -> ChatGroq:
    return ChatGroq(
        model=model,
        temperature=temperature,
        groq_api_key=os.getenv("GROQ_API_KEY")
    )