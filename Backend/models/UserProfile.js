const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  age: { type: Number },
  gender: { type: String },
  heightFeet: { type: Number },   // e.g., 5 for 5 feet 7 inches
  heightInches: { type: Number }, // e.g., 7 for 5 feet 7 inches
  weight: { type: Number },       // Weight in kg
  updatedAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);
