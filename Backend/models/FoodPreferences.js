const mongoose = require('mongoose');

const FoodPreferencesSchema = new mongoose.Schema({
  foodTypes: [String],
  allergies: [String],
  budget: { type: Number },
  budgetUnit: { type: String },
  pregnancyStatus: { type: String },
  medicalConditions: [String],
  lastUsed: { type: Date },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }
});

module.exports = mongoose.model('FoodPreferences', FoodPreferencesSchema);
