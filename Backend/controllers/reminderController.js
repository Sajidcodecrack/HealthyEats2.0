const Reminder = require('../models/Reminder');

// Create reminder
exports.createReminder = async (req, res) => {
  try {
    const reminder = await Reminder.create(req.body);
    res.status(201).json(reminder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all reminders from the user
exports.getReminders = async (req, res) => {
  try {
    const { userId } = req.query;
    const reminders = await Reminder.find({ user: userId });
    res.json(reminders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update  reminder
exports.updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findByIdAndUpdate(id, req.body, { new: true });
    if (!reminder) return res.status(404).json({ error: "Reminder not found" });
    res.json(reminder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete  reminder
exports.deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findByIdAndDelete(id);
    if (!reminder) return res.status(404).json({ error: "Reminder not found" });
    res.json({ message: "Reminder deleted", reminder });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
