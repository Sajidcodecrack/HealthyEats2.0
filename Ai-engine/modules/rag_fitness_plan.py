import os
import json
import logging
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_community.vectorstores.faiss import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain.schema.runnable import RunnablePassthrough, RunnableParallel
from langchain_google_genai import ChatGoogleGenerativeAI
import google.generativeai as genai

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Load environment variables
load_dotenv()

# Configure Google API credentials
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY environment variable is not set. Please set it to a valid Google API key.")
genai.configure(api_key=api_key)

# Pydantic models for request and response
class PlanRequest(BaseModel):
    age: int
    gender: str
    fitness_goal: str
    experience_level: str
    available_equipment: str
    health_conditions: str

class PlanResponse(BaseModel):
    plan: list  # JSON structure for 7-day plan

# RAG Pipeline Initialization
EXERCISE_FILE = "Ai-engine/modules/exercise.json"
if not os.path.isfile(EXERCISE_FILE):
    raise RuntimeError(f"Missing {EXERCISE_FILE}")

with open(EXERCISE_FILE) as f:
    exercises = json.load(f)

texts = [
    (
        f"Name: {ex['name']}\n"
        f"Target Muscle: {ex['target_muscle']}\n"
        f"Description: {ex['description']}\n"
        f"Difficulty: {ex['difficulty']}\n"
        f"Type: {ex['type']}\n"
        f"Image: {ex['image_url']}\n"
        f"Video: {ex['video_url']}"
    )
    for ex in exercises
]

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vector_store = FAISS.from_texts(texts=texts, embedding=embeddings, metadatas=exercises, ids=[ex["name"] for ex in exercises])
retriever = vector_store.as_retriever(search_kwargs={"k": 12})

prompt = PromptTemplate(
    input_variables=["context", "query", "age", "gender", "fitness_goal", "experience_level", "available_equipment", "health_conditions"],
    template="""
You are a certified fitness coach. Your task is to create a personalized 7-day workout plan based on the provided exercise data and user input. You MUST return a valid JSON response, with no additional text, explanations, or comments outside the JSON structure. Ensure the JSON is properly formatted and includes all required fields.

Exercise data:
{context}

User details:
- Age: {age}
- Gender: {gender}
- Fitness Goal: {fitness_goal}
- Experience Level: {experience_level}
- Available Equipment: {available_equipment}
- Health Conditions: {health_conditions}

Create a 7-day workout plan where each day includes 4–5 exercises. Each exercise must include:
- name
- target_muscle
- description
- difficulty
- type
- image_url
- video_url
- reps

Return the response in the following JSON structure:
[
  {{"day": "Day 1", "exercises": [{{"name": "", "target_muscle": "", "description": "", "difficulty": "", "type": "", "image_url": "", "video_url": "", "reps": ""}}, ...]}},
  {{"day": "Day 2", "exercises": [{{"name": "", "target_muscle": "", "description": "", "difficulty": "", "type": "", "image_url": "", "video_url": "", "reps": ""}}, ...]}},
  {{"day": "Day 3", "exercises": [{{"name": "", "target_muscle": "", "description": "", "difficulty": "", "type": "", "image_url": "", "video_url": "", "reps": ""}}, ...]}},
  {{"day": "Day 4", "exercises": [{{"name": "", "target_muscle": "", "description": "", "difficulty": "", "type": "", "image_url": "", "video_url": "", "reps": ""}}, ...]}},
  {{"day": "Day 5", "exercises": [{{"name": "", "target_muscle": "", "description": "", "difficulty": "", "type": "", "image_url": "", "video_url": "", "reps": ""}}, ...]}},
  {{"day": "Day 6", "exercises": [{{"name": "", "target_muscle": "", "description": "", "difficulty": "", "type": "", "image_url": "", "video_url": "", "reps": ""}}, ...]}},
  {{"day": "Day 7", "exercises": [{{"name": "", "target_muscle": "", "description": "", "difficulty": "", "type": "", "image_url": "", "video_url": "", "reps": ""}}, ...]}}
]

If no suitable exercises are found or if the input is invalid, return an empty JSON array: []
"""
)

# Configure LLM with structured JSON output
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.4,
    google_api_key=api_key,
    response_mime_type="application/json"  # Enforce JSON output
)

# RAG chain with JsonOutputParser
rag_chain = (
    RunnableParallel(
        context=lambda x: retriever.invoke(x["query"]),  # Use invoke instead of get_relevant_documents
        query=RunnablePassthrough(),
        age=lambda x: x["age"],
        gender=lambda x: x["gender"],
        fitness_goal=lambda x: x["fitness_goal"],
        experience_level=lambda x: x["experience_level"],
        available_equipment=lambda x: x["available_equipment"],
        health_conditions=lambda x: x["health_conditions"],
    )
    | prompt
    | llm
    | JsonOutputParser()  # Use JsonOutputParser for robust JSON handling
)

def generate_fitness_plan(req: PlanRequest) -> PlanResponse:
    """
    Generate a personalized 7-day fitness plan using the RAG pipeline.
    
    Args:
        req (PlanRequest): User input containing age, gender, fitness goal, experience level,
                          available equipment, and health conditions.
    
    Returns:
        PlanResponse: A response containing the 7-day workout plan in JSON format.
    """
    query_text = (
        f"Generate plan for age={req.age}, gender={req.gender}, "
        f"goal={req.fitness_goal}, experience={req.experience_level}, "
        f"equipment={req.available_equipment}, conditions={req.health_conditions}"
    )

    try:
        inputs = {
            "query": query_text,
            "age": req.age,
            "gender": req.gender,
            "fitness_goal": req.fitness_goal,
            "experience_level": req.experience_level,
            "available_equipment": req.available_equipment,
            "health_conditions": req.health_conditions
        }
        result = rag_chain.invoke(inputs)
        logging.debug(f"LLM output: {result}")
        
        # Validate the result
        if not result:
            logging.warning("LLM returned an empty response")
            return PlanResponse(plan=[])
        
        return PlanResponse(plan=result)
    except Exception as e:
        logging.error(f"Error processing request: {str(e)}")
        raise