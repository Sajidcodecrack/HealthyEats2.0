const express = require('express');
const router = express.Router();
const calorieController = require('../controllers/calorieController');
const auth = require('../middleware/auth');

router.post('/goal', auth, calorieController.setCalorieGoal);
router.post('/log', auth, calorieController.logMeal);
router.get('/today', auth, calorieController.getTodayLog);
router.get('/weekly', auth, calorieController.getWeeklyLog);
router.patch('/confirm', auth, calorieController.confirmMeal);
// Add to your backend API
router.post('/api/calorie/reset', async (req, res) => {
  try {
    const { userId } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    // Find today's log
    const log = await CalorieLog.findOne({ 
      user: userId, 
      date: today 
    });
    
    if (!log) {
      return res.status(404).json({ error: "No log found for today" });
    }
    
    // Reset all meals
    log.meals = [];
    log.totalCalories = 0;
    
    await log.save();
    
    res.status(200).json({ message: "Calorie log reset", log });
  } catch (error) {
    console.error("Reset error:", error);
    res.status(500).json({ error: "Failed to reset calorie log" });
  }
});
module.exports = router;