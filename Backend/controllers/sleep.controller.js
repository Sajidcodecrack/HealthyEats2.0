const SleepTracker = require("../models/SleepTracker");

// 1. Log sleep data
exports.logSleep = async (req, res) => {
  try {
    const { userId, sleepStart, sleepEnd, reminderTime } = req.body;

    const start = new Date(sleepStart);
    const end = new Date(sleepEnd);

    if (start >= end) return res.status(400).json({ error: "Start time must be before end time." });

    const duration = (end - start) / (1000 * 60 * 60); // convert ms to hours

    const entry = new SleepTracker({
      userId,
      sleepStart: start,
      sleepEnd: end,
      durationHours: parseFloat(duration.toFixed(2)),
      reminderTime,
    });

    await entry.save();
    res.status(201).json({ message: "Sleep data logged", data: entry });

  } catch (err) {
    console.error("Sleep log error:", err.message);
    res.status(500).json({ error: "Failed to log sleep" });
  }
};

// 2. Get past 7-day sleep data (for graphs)
exports.getWeeklySleep = async (req, res) => {
  try {
    const { userId } = req.params;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const logs = await SleepTracker.find({
      userId,
      sleepStart: { $gte: oneWeekAgo }
    }).sort({ sleepStart: 1 });

    res.status(200).json({
      message: "Weekly sleep trend",
      data: logs.map(log => ({
        date: log.sleepStart.toISOString().split("T")[0],
        hours: log.durationHours
      }))
    });

  } catch (err) {
    console.error("Weekly fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch sleep trend" });
  }
};
