const mongoose = require("mongoose");

const WaterTrackerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  dailyTarget: { type: Number, required: true },      //  2000 ml
  currentIntake: { type: Number, default: 0 },         // how much taken so far
  reminderInterval: { type: Number, default: 60 },     // minutes
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("WaterTracker", WaterTrackerSchema);
