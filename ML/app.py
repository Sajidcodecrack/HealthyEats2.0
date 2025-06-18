import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from fastapi.responses import JSONResponse
import google.generativeai as genai

# Configure Gemini API key from environment
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------- Models -------------------------
class UserRequest(BaseModel):
    name: str
    age: int
    gender: str
    pregnant: bool = False
    heightFeet: int
    heightInches: int
    weight: float
    activityLevel: str
    budget: int
    medicalConditions: list = Field(default_factory=list)
    diabetesRange: str = None
    allergies: list = Field(default_factory=list)
    preferredFoodTypes: list = Field(default_factory=list)

# ------------------------- Helpers -------------------------
def bmi_category(bmi):
    if bmi < 18.5:
        return "Underweight"
    elif bmi < 25:
        return "Normal weight"
    elif bmi < 30:
        return "Overweight"
    else:
        return "Obese"

def build_prompt(user):
    prompt = f"""
You are a certified nutritionist and health AI for Bangladesh (2025).
Generate a 1-day meal plan (Breakfast, Lunch, Snack, Dinner) based on the user's full profile. 
Return ONLY a valid JSON in the following format. Do NOT return any explanation or formatting outside of JSON.

User Stats:
- Name: {user['name']}
- Age: {user['age']}
- Gender: {user['gender']}
- Pregnant: {user['pregnant']}
- Height: {user['heightFeet']}ft {user['heightInches']}in
- Weight: {user['weight']}kg
- BMI: {user['bmi']} ({user['bmi_cat']})
- Activity Level: {user['activityLevel']}
- Budget: {user['budget']} TK
- Medical Conditions: {", ".join(user['medicalConditions']) if user['medicalConditions'] else 'None'}
- Diabetes Range: {user['diabetesRange'] if user['diabetesRange'] else 'N/A'}
- Allergies: {", ".join(user['allergies']) if user['allergies'] else 'None'}
- Food Preferences: {", ".join(user['preferredFoodTypes']) if user['preferredFoodTypes'] else 'None'}

Return JSON like:
{{
  "Breakfast": {{
    "Foods": [...],
    "Fruits": [...],
    "Drinks/Tea": [...],
    "Nutrition": "...",
    "EstimatedCost": "..."
  }},
  "Lunch": {{
    "Foods": [...],
    "Fruits": [...],
    "Drinks/Tea": [...],
    "Nutrition": "...",
    "EstimatedCost": "..."
  }},
  "Snack": {{
    "Foods": [...],
    "Fruits": [...],
    "Drinks/Tea": [...],
    "Nutrition": "...",
    "EstimatedCost": "..."
  }},
  "Dinner": {{
    "Foods": [...],
    "Fruits": [...],
    "Drinks/Tea": [...],
    "Nutrition": "...",
    "EstimatedCost": "..."
  }},
  "TotalCalories": "...",
  "TotalEstimatedCost": "...",
  "WaterIntakeLiters": "...",
  "Notes": "..."
}}
"""
    return prompt

# ------------------------- Route -------------------------
@app.post("/generate-meal")
async def generate_meal(user: UserRequest):
    user_dict = user.dict()
    height_m = (user_dict["heightFeet"] * 12 + user_dict["heightInches"]) * 0.0254
    user_dict["bmi"] = round(user_dict["weight"] / (height_m ** 2), 1)
    user_dict["bmi_cat"] = bmi_category(user_dict["bmi"])

    prompt = build_prompt(user_dict)
    model = genai.GenerativeModel('gemini-2.0-flash-lite')
    response = model.generate_content(prompt)

    # Try to parse JSON from model output
    try:
        # Clean if extra content exists before/after JSON
        json_start = response.text.find('{')
        json_end = response.text.rfind('}') + 1
        json_str = response.text[json_start:json_end]
        meal_data = json.loads(json_str)
        return JSONResponse(content=meal_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse JSON response: {e}")

# ------------------------- Root -------------------------
@app.get("/")
def root():
    return {"message": "HealthyEats Meal Generator API is running!"}
