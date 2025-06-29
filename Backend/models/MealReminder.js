const mongoose = require('mongoose');

const MealReminderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
  time: { type: String, required: true }, // "08:30"
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model('MealReminder', MealReminderSchema);
