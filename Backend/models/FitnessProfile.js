const mongoose = require('mongoose');

const FitnessProfileSchema = new mongoose.Schema({
  goals: [String],
  activityLevel: { type: String },
  chronicConditions: [String],
  preferredTime: { type: String },
  deviceSync: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }
});

module.exports = mongoose.model('FitnessProfile', FitnessProfileSchema);
