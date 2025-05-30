const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  age: { type: Number },
  gender: { type: String },
  height: { type: Number },
  heightUnit: { type: String },
  weight: { type: Number },
  weightUnit: { type: String },
  updatedAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);
