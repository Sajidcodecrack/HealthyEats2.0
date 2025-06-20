// routes/foodAI.js

const express = require('express');
const router = express.Router();
const axios = require('axios');

const Meals           = require('../models/Meals');
const FoodPreferences = require('../models/FoodPreferences');
const User            = require('../models/User');
const UserProfile     = require('../models/UserProfile');

// 1. Serve AI-question definitions
router.get('/questions', (req, res) => {
  const questions = [
    {
      key: 'foodTypes',
      label: 'Preferred food type',
      type: 'select',
      options: ['vegetarian', 'vegan', 'low-carb', 'high-protein', 'any'],
    },
    {
      key: 'allergies',
      label: 'Allergies or foods to avoid',
      type: 'multiselect',
      options: ['nuts', 'shellfish', 'dairy', 'gluten', 'soy', 'none'],
    },
    {
      key: 'medicalConditions',
      label: 'Health conditions',
      type: 'multiselect',
      options: ['heart', 'kidney', 'liver', 'diabetes', 'none'],
    },
    {
      key: 'diabeticRange',
      label: 'If diabetic, specify blood sugar range',
      type: 'text',
      dependsOn: 'medicalConditions',
    },
    {
      key: 'pregnancyStatus',
      label: 'Pregnancy status',
      type: 'toggle',
      options: ['yes', 'no'],
    },
    {
      key: 'budget',
      label: 'Budget per meal (BDT)',
      type: 'number',
    },
  ];
  res.json(questions);
});

// 2. Generate AI-based meal plan
router.post('/generate', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'No userId provided' });
    }

    // Fetch user, profile & saved preferences
    const user        = await User.findById(userId);
    const userProfile = await UserProfile.findOne({ userId });
    const foodPref    = await FoodPreferences.findOne({ userId });
    if (!user)        return res.status(404).json({ error: 'User not found' });
    if (!userProfile) return res.status(404).json({ error: 'User profile not found' });
    if (!foodPref)    return res.status(404).json({ error: 'Food preferences not found' });

    // Build payload for deployed ML model
    const payload = {
      name:               user.name,
      age:                userProfile.age,
      gender:             userProfile.gender,
      pregnant:           foodPref.pregnancyStatus,
      heightFeet:         userProfile.heightFeet,
      heightInches:       userProfile.heightInches,
      weight:             userProfile.weight,
      activityLevel:      userProfile.activityLevel || 'moderate',
      budget:             foodPref.budget,
      medicalConditions:  foodPref.medicalConditions,
      diabeticRange:      foodPref.diabeticRange || '',
      allergies:          foodPref.allergies,
      preferredFoodTypes: foodPref.foodTypes,
    };

    // Call deployed meal-generation API
    const aiRes = await axios.post(
      'https://healthyeats-meal-xohb.onrender.com/generate-meal',
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
    const aiData = aiRes.data;
    console.log('AI response payload:', aiData);

    // Format nested AI response into text
    let mealPlanText = '';
    for (const [section, content] of Object.entries(aiData)) {
      mealPlanText += `=== ${section} ===\n`;
      if (typeof content === 'object' && !Array.isArray(content)) {
        for (const [key, val] of Object.entries(content)) {
          if (Array.isArray(val)) {
            mealPlanText += `${key}: ${val.join(', ')}\n`;
          } else {
            mealPlanText += `${key}: ${val}\n`;
          }
        }
      } else {
        mealPlanText += `${content}\n`;
      }
      mealPlanText += '\n';
    }

    // Save to history
    const meal = new Meals({
      date:     new Date(),
      mealType: 'fullDay',
      menu:     [mealPlanText],
      aiSource: 'Gemini v2 Render',
      userId,
    });
    await meal.save();

    // Return formatted plan to frontend
    res.json({
      message:  'Meal plan generated and saved!',
      mealPlan: mealPlanText,
    });

  } catch (err) {
    console.error('AI meal generation error:', err.response?.data || err.message);
    res.status(500).json({ error: 'AI meal generation failed' });
  }
});

module.exports = router;
