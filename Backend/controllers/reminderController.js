const MealReminder = require('../models/MealReminder');

exports.setReminder = async (req, res) => {
  const { mealType, time } = req.body;
  const userId = req.user.userId;

  let reminder = await MealReminder.findOne({ user: userId, mealType });
  if (reminder) {
    reminder.time = time;
    reminder.active = true;
  } else {
    reminder = new MealReminder({ user: userId, mealType, time });
  }

  await reminder.save();
  res.json({ message: 'Reminder set', reminder });
};

exports.getReminders = async (req, res) => {
  const userId = req.user.userId;
  const reminders = await MealReminder.find({ user: userId, active: true });
  res.json(reminders);
};

exports.deactivateReminder = async (req, res) => {
  const { mealType } = req.body;
  const userId = req.user.userId;
  const reminder = await MealReminder.findOneAndUpdate(
    { user: userId, mealType },
    { active: false },
    { new: true }
  );
  res.json({ message: 'Reminder deactivated', reminder });
};
