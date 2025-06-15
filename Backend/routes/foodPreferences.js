// Backend/routes/foodPreferences.js
const express = require('express');
const router = express.Router();
const FoodPreferences = require('../models/FoodPreferences');

// POST /api/foodPreferences
router.post('/', async (req, res) => {
  try {
    const foodPref = new FoodPreferences(req.body);
    await foodPref.save();
    res.status(201).json(foodPref);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
