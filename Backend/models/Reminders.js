const mongoose = require('mongoose');

const RemindersSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  type: { type: String, required: true },
  relatedRef: { type: mongoose.Schema.Types.ObjectId }, // Can reference Meals or FitnessPlans
  time: { type: Date, required: true },
  repeat: { type: String, default: "none" }, // e.g. daily, weekly, monthly, none
  status: { type: String, default: "pending" }, // pending, sent, confirmed, etc.
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reminders', RemindersSchema);
