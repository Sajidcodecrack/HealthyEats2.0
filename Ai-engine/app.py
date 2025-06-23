# app.py

from fastapi import FastAPI, Request
from pydantic import BaseModel
from modules.chatmodule import get_health_advice
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="HealthyEats AI Chatbot")

# Allow frontend (optional)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Endpoint to handle chat queries from the user."""
    reply = get_health_advice(request.message)
    return ChatResponse(reply=reply)

@app.get("/")
def root():
    return {"message": "HealthyEats AI Chatbot is running."}
