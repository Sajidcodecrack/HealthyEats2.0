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


router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const prefs = await FoodPreferences.findOne({ userId });

    if (!prefs) {
      return res.status(404).json({ message: 'Preferences not found' });
    }

    res.json(prefs);
  } catch (err) {
    console.error('Error fetching preferences:', err);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});
module.exports = router;
