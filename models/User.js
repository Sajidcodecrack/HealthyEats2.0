const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  height: { type: Number },    // in cm
  weight: { type: Number },    // in kg
  bmi: { type: Number },
  activityLevel: { type: String },
  budget: { type: Number },
  medicalConditions: [{ type: Schema.Types.ObjectId, ref: 'MedicalCondition' }],
}, { timestamps: true });

module.exports = model('User', UserSchema);