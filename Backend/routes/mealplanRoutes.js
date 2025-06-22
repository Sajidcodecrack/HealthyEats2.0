const express = require('express');
const router = express.Router();
const MealPlan = require('../models/MealPlan'); // Adjust path as needed
const mongoose = require('mongoose');

// Create or Update a meal plan for a user
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      Breakfast,
      Lunch,
      Snack,
      Dinner,
      TotalCalories,
      TotalEstimatedCost,
      WaterIntakeLiters,
      Notes,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    // Upsert: find meal plan by userId, update if exists, else create new
    const mealPlan = await MealPlan.findOneAndUpdate(
      { userId },
      {
        Breakfast,
        Lunch,
        Snack,
        Dinner,
        TotalCalories,
        TotalEstimatedCost,
        WaterIntakeLiters,
        Notes,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(mealPlan);
  } catch (error) {
    console.error('Error creating/updating meal plan:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a meal plan by userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    const mealPlan = await MealPlan.findOne({ userId });

    if (!mealPlan) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    res.status(200).json(mealPlan);
  } catch (error) {
    console.error('Error fetching meal plan:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete meal plan by userId
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    const deleted = await MealPlan.findOneAndDelete({ userId });

    if (!deleted) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    res.status(200).json({ message: 'Meal plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
