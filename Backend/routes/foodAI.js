const express = require('express');
const router = express.Router();
const axios = require('axios');
const Meals = require('../models/Meals');
const FoodPreferences = require('../models/FoodPreferences');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile'); // <-- ADD THIS

router.post('/generate', async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) return res.status(400).json({ error: 'No userId provided' });

    // 1. Fetch user profile and food preferences
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Try to get profile with the same userId
    const userProfile = await UserProfile.findOne({ userId }); // <-- PROFILE!
    if (!userProfile) return res.status(404).json({ error: "User profile not found" });

    const foodPref = await FoodPreferences.findOne({ userId });
    if (!foodPref) return res.status(404).json({ error: "Food preferences not found" });

    // 2. Prepare payload for AI API
    const payload = {
      name: user.name || "Test User",
      age: userProfile.age ?? user.age ?? 30,
      gender: userProfile.gender || user.gender || "male",
      pregnant: user.pregnancyStatus === 'yes',
      heightFeet: userProfile.heightFeet ?? 5,
      heightInches: userProfile.heightInches ?? 6,
      weight: userProfile.weight ?? 70,
      activityLevel: userProfile.activityLevel || "moderate",
      budget: foodPref.budget ?? 2000,
      medicalConditions: foodPref.medicalConditions || [],
      diabetesRange: typeof user.diabetesRange === 'string' ? user.diabetesRange : "",
      allergies: foodPref.allergies || [],
      preferredFoodTypes: foodPref.foodTypes || []
    };

    // 3. Call AI Meal API
    const aiRes = await axios.post(
      "https://foodsuggestion.onrender.com/generate-meal",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );
    const mealPlanText = aiRes.data.meal_plan;

    // 4. Store meal
    const meal = new Meals({
      date: new Date(),
      mealType: "fullDay",
      menu: [mealPlanText],
      aiSource: "Gemini v2 Render",
      userId: userId
    });
    await meal.save();

    res.json({ message: "Meal plan generated and saved!", mealPlan: mealPlanText });
  } catch (err) {
    if (err.response) {
      console.error("AI API error:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("AI API error:", err.message);
    }
    res.status(500).json({ error: "AI meal generation failed" });
  }
});

module.exports = router;
