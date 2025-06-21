// routes/foodPreferences.js

const express = require('express');
const router = express.Router();
const FoodPreferences = require('../models/FoodPreferences');

// Create or update
router.post('/', async (req, res) => {
  const { userId, foodTypes, allergies, medicalConditions, diabeticRange, pregnancyStatus, budget } = req.body;
  try {
    const prefs = await FoodPreferences.findOneAndUpdate(
      { userId },
      { foodTypes, allergies, medicalConditions, diabeticRange, pregnancyStatus, budget },
      { upsert: true, new: true }
    );
    res.json(prefs);
  } catch (err) {
    res.status(500).json({ error: 'Could not save food preferences' });
  }
});

module.exports = router;
