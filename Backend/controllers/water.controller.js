const WaterTracker = require("../models/WaterTracker");

exports.setWaterGoal = async (req, res) => {
  try {
    const { userId, dailyTarget, reminderInterval } = req.body;

    let existing = await WaterTracker.findOne({ userId });

    if (existing) {
      existing.dailyTarget = dailyTarget;
      existing.reminderInterval = reminderInterval;
      existing.lastUpdated = new Date();
      await existing.save();
      return res.status(200).json({ message: "Water goal updated", data: existing });
    }

    const newGoal = new WaterTracker({
      userId,
      dailyTarget,
      reminderInterval
    });

    await newGoal.save();
    res.status(201).json({ message: "Water goal set", data: newGoal });
  } catch (err) {
    console.error("Set Water Goal Error:", err.message);
    res.status(500).json({ error: "Failed to set water goal" });
  }
};

exports.updateIntake = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    const tracker = await WaterTracker.findOne({ userId });

    if (!tracker) return res.status(404).json({ error: "Tracker not found" });

    tracker.currentIntake += amount;
    tracker.lastUpdated = new Date();

    await tracker.save();
    res.status(200).json({ message: "Water intake updated", data: tracker });
  } catch (err) {
    console.error("Update Intake Error:", err.message);
    res.status(500).json({ error: "Failed to update intake" });
  }
};

exports.getWaterStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const tracker = await WaterTracker.findOne({ userId });

    if (!tracker) return res.status(404).json({ error: "No water tracker found" });

    res.status(200).json({ data: tracker });
  } catch (err) {
    console.error("Get Water Status Error:", err.message);
    res.status(500).json({ error: "Failed to fetch water tracker" });
  }
};
