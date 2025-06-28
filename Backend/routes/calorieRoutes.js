const express = require('express');
const router = express.Router();
const calorieController = require('../controllers/calorieController');
const auth = require('../middleware/auth');

router.post('/goal', auth, calorieController.setCalorieGoal);
router.post('/log', auth, calorieController.logMeal);
router.get('/today', auth, calorieController.getTodayLog);
router.get('/weekly', auth, calorieController.getWeeklyLog);
router.patch('/confirm', auth, calorieController.confirmMeal);

module.exports = router;