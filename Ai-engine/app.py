from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from modules.chatmodule import get_health_advice
from modules.rag_fitness_plan import PlanRequest, PlanResponse, generate_fitness_plan

# FastAPI setup
app = FastAPI(title="HealthyEats AI Chatbot and Fitness API")

# Allow frontend (optional)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for chat request and response
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

# Chat Endpoint
@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Endpoint to handle chat queries from the user."""
    reply = get_health_advice(request.message)
    return ChatResponse(reply=reply)

# Fitness Plan Endpoint
@app.post("/plan", response_model=PlanResponse)
async def create_plan(req: PlanRequest):
    """Endpoint to generate a personalized 7-day fitness plan."""
    try:
        return generate_fitness_plan(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Root Endpoint
@app.get("/")
def root():
    return {"message": "HealthyEats AI Chatbot and Fitness API is running."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)