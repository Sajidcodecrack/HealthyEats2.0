import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
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
Generate a full 1-day meal plan (Breakfast, Lunch, Snack, Dinner) for this user, suggesting healthy local fruits and drinks/tea based on all medical preferences and dietary needs, using only modern Bangladeshi foods. Do not suggest any food or drinks not commonly eaten in Bangladesh.

STRICT RULES:
- If BMI is LOW (underweight): Prioritize nutritious, high-calorie foods for weight gain, but ONLY if not restricted by medical conditions (e.g., no oily food for heart patients, no sweets for diabetics).
- If BMI is HIGH (overweight/obese): Prioritize calorie control, more fiber, and healthy, balanced foods.
- If the user has diabetes, always avoid foods/drinks with added sugar, honey, sweets, sugary fruits (like ripe mango, banana, jackfruit, chiku), and all desserts. Do NOT recommend milk tea, sweetened tea, fruit juice, or sugary drinks of any kind.
- If the user has heart, kidney, or liver conditions, do NOT recommend oily, deep-fried, salty, spicy foods, processed meats, or foods high in saturated fat. Prioritize easily digestible, low-sodium, and heart-healthy options.
- Respect ALL allergies and food restrictions. Never suggest any item that includes an allergen.
- All recommendations must be different for each meal in a day—do NOT repeat dishes, fruits, or drinks.
- Fruits: Only suggest fruits for 1 or 2 meals in the day (ideally breakfast and/or snack). For lunch and dinner, suggest fruits only if medically necessary; otherwise, use 'Fruits: None'. Never suggest fruit with every meal.
- Drinks/Tea: Recommend local healthy drinks/teas (lemon water, green tea, coconut water) only if culturally and medically appropriate. Avoid tea with lunch or dinner. Never recommend sweetened drinks for diabetics. If no drink is suitable, use 'Drinks/Tea: None'.
- Water: Always recommend a suitable total daily water intake (in liters), and list this clearly at the end.
- All meal recommendations must fit within the user's daily budget—show cost per meal and total day cost.
- The plan must be practical and use only locally available foods and preparation methods.
- Output must be in a clear, human-friendly BOX format (NOT JSON).
- If any usual Bangladeshi food is not appropriate due to the user's medical conditions, allergies, or religious/cultural restrictions (such as beef or pork), explicitly avoid it.

USER STATS:
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

Instructions:
- Provide breakfast, lunch, snack, and dinner for 1 day. All meals, fruits, and drinks/teas must be different.
- Fruits should be included with at most 2 meals (ideally breakfast and snack). If no fruit is needed for a meal, write 'Fruits: None'.
- Drinks/Teas should be culturally appropriate (e.g., tea at breakfast or snack), never at every meal, and never if medically inappropriate. If not suitable, write 'Drinks/Tea: None'.
- For each meal, list the foods, suggested fruits, drinks or teas, estimated calories, basic nutrition highlights, and estimated cost.
- Show total calories for the day, and total estimated cost for the day.
- At the end, recommend a suitable amount of water to drink (in liters).
- Highlight any special instructions or dietary cautions clearly (e.g., “This plan is higher in protein for low BMI”, “All meals are low sodium for heart health”, etc.).

Format your output as follows:

=============================
#        1-Day Meal Plan
# -----------------------------
# Breakfast:
# - Foods: [list]
# - Fruits: [list or None]
# - Drinks/Tea: [list or None]
# - Nutrition: [info]
# - Estimated Cost: [amount] TK

# Lunch:
# - Foods: [list]
# - Fruits: [list or None]
# - Drinks/Tea: [list or None]
# - Nutrition: [info]
# - Estimated Cost: [amount] TK

# Snack:
# - Foods: [list]
# - Fruits: [list or None]
# - Drinks/Tea: [list or None]
# - Nutrition: [info]
# - Estimated Cost: [amount] TK

# Dinner:
# - Foods: [list]
# - Fruits: [list or None]
# - Drinks/Tea: [list or None]
# - Nutrition: [info]
# - Estimated Cost: [amount] TK

-----------------------------
Total Estimated Cost: [amount] TK
Total Calories: [amount] kcal

Water Intake Recommendation: [liters] liters

Notes: [any special notes or cautions]
=============================

- Do NOT include any food, fruit, or drink that is inappropriate for the user's medical conditions, allergies, restrictions, or culture.
- If any meal must be particularly high in calories/protein/fiber/low in sodium/etc. due to BMI or health conditions, state this clearly.
"""
    return prompt

@app.post("/generate-meal")
async def generate_meal(user: UserRequest):
    user_dict = user.dict()
    height_m = (user_dict["heightFeet"] * 12 + user_dict["heightInches"]) * 0.0254
    user_dict["bmi"] = round(user_dict["weight"] / (height_m ** 2), 1)
    user_dict["bmi_cat"] = bmi_category(user_dict["bmi"])
    prompt = build_prompt(user_dict)
    model = genai.GenerativeModel('gemini-2.0-flash-lite')
    response = model.generate_content(prompt)
    return {"meal_plan": response.text}

@app.get("/")
def root():
    return {"message": "HealthyEats Meal Generator API is running!"}
