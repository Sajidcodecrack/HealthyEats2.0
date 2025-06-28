const mongoose = require("mongoose");
const SleepTrackerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },  //  Tracks who this log belongs to
  sleepStart: { type: Date, required: true },                                     //  When the user went to sleep
  sleepEnd: { type: Date, required: true },                                       //  When the user woke up
  durationHours: { type: Number, required: true },                                //  Total hours slept
  reminderTime: { type: String },                                                 //  Optional bedtime reminder (24-hour format)
  loggedAt: { type: Date, default: Date.now }                                     //  When the log was saved
});
module.exports = mongoose.model("SleepTracker", SleepTrackerSchema);