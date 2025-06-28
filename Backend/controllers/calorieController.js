const CalorieTracker = require('../models/CalorieTracker');
const moment = require('moment');
const UserProfile = require('../models/UserProfile');
const { calculateBMI, suggestCalorieIntake } = require('../utils/bmiUtils');

exports.setCalorieGoal = async (req, res) => {
    const { calorieGoal } = req.body;
    const userId = req.user.userId;
    const date = moment().format('YYYY-MM-DD');

    let log = await CalorieTracker.findOne({ user: userId, date });
    if (!log) log = new CalorieTracker({ user: userId, date });

    log.calorieGoal = calorieGoal;
    await log.save();
    res.json({ message: 'Calorie goal set', log });
};

exports.logMeal = async (req, res) => {
    const { mealType, calories } = req.body;
    const userId = req.user.userId;
    const date = moment().format('YYYY-MM-DD');

    let log = await CalorieTracker.findOne({ user: userId, date });
    if (!log) log = new CalorieTracker({ user: userId, date });

    const mealIndex = log.meals.findIndex(m => m.mealType === mealType);
    if (mealIndex > -1) {
        log.meals[mealIndex].calories = calories;
    } else {
        log.meals.push({ mealType, calories });
    }

    log.totalCalories = log.meals.reduce((sum, m) => sum + m.calories, 0);

    //  BMI-based fallback before saving
    if (!log.calorieGoal) {
        const profile = await UserProfile.findOne({ userId });
        if (profile) {
            const bmi = calculateBMI(profile.heightFeet, profile.heightInches, profile.weight);
            const suggestedCalories = suggestCalorieIntake(bmi);
            log.calorieGoal = suggestedCalories;
        }
    }

    await log.save();
    res.json({ message: 'Meal logged', log });
};


exports.getTodayLog = async (req, res) => {
    const userId = req.user.userId;
    const date = moment().format('YYYY-MM-DD');
    const log = await CalorieTracker.findOne({ user: userId, date });
    res.json(log || {});
};

exports.getWeeklyLog = async (req, res) => {
    const userId = req.user.userId;
    const fromDate = moment().subtract(6, 'days').format('YYYY-MM-DD');

    const logs = await CalorieTracker.find({
        user: userId,
        date: { $gte: fromDate }
    });
    res.json(logs);
};

exports.confirmMeal = async (req, res) => {
    const { mealType } = req.body;
    const userId = req.user.userId;
    const date = moment().format('YYYY-MM-DD');

    const log = await CalorieTracker.findOne({ user: userId, date });
    if (!log) return res.status(404).json({ error: 'No log found for today' });

    const meal = log.meals.find(m => m.mealType === mealType);
    if (meal) meal.confirmed = true;
    await log.save();

    res.json({ message: 'Meal confirmed', log });
};