const mongoose = require('mongoose');

const foodPreferencesSchema = new mongoose.Schema({
  userId:      { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  foodTypes:       [String],     // e.g. ['vegetarian']
  allergies:       [String],     // e.g. ['nuts']
  medicalConditions: [String],   // e.g. ['diabetes','heart']
  diabeticRange:   { type: String },   // e.g. '120-140'
  pregnancyStatus: { type: Boolean },  // true if pregnant
  budget:          { type: Number },   // BDT per meal
}, { timestamps: true });

module.exports = mongoose.model('FoodPreferences', foodPreferencesSchema);