const mongoose = require('mongoose');

const MealsSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  mealType: { type: String, required: true },
  menu: { type: mongoose.Schema.Types.Mixed, // or just Object
  required: true},
  nutritionInfo: { type: mongoose.Schema.Types.Mixed }, // Can be detailed object
  calories: { type: Number },
  confirmed: { type: Boolean, default: false },
  feedback: { type: String },
  aiSource: { type: String },
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }
});

module.exports = mongoose.model('Meals', MealsSchema);
