const mongoose = require('mongoose');

const CalorieTrackerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  meals: [
    {
      mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
        required: true,
      },
      calories: { type: Number, required: true },
      confirmed: { type: Boolean, default: false },
    },
  ],
  totalCalories: { type: Number, default: 0 },
  calorieGoal: { type: Number },
});

module.exports = mongoose.model('CalorieTracker', CalorieTrackerSchema);
