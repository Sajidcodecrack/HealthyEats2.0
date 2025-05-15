// models/MedicalCondition.js
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const MedicalConditionSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  severityLevel: String,
  dietaryRestrictions: [String],
  fitnessAdvice: String,
  riskLevel: Number,
  recommendedCalorieRange: {
    min: Number,
    max: Number,
  },
}, { timestamps: true });

// this returns a proper Model with .find(), .create(), etc.
const MedicalCondition = model('MedicalCondition', MedicalConditionSchema);

module.exports = MedicalCondition;
