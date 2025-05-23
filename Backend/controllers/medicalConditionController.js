// controllers/medicalConditionController.js
const MedicalCondition = require('../models/MedicalCondition');
const User = require('../models/User');

// 1. Add condition to DB (global, not user)
exports.createCondition = async (req, res) => {
  try {
    const cond = await MedicalCondition.create(req.body);
    res.status(201).json(cond);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 2. Get all conditions (global list)
exports.getAllConditions = async (req, res) => {
  try {
    const conds = await MedicalCondition.find();
    res.json(conds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Update a medical condition by ID (global)
exports.updateCondition = async (req, res) => {
  try {
    const { id } = req.params;
    const cond = await MedicalCondition.findByIdAndUpdate(id, req.body, { new: true });
    if (!cond) return res.status(404).json({ error: "Condition not found" });
    res.json(cond);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 4. Delete a medical condition by ID (global)
exports.deleteCondition = async (req, res) => {
  try {
    const { id } = req.params;
    const cond = await MedicalCondition.findByIdAndDelete(id);
    if (!cond) return res.status(404).json({ error: "Condition not found" });
    res.json({ message: "Condition deleted", cond });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 5. Add a condition to a user
exports.addConditionToUser = async (req, res) => {
  try {
    const { userId, conditionId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.medicalConditions.includes(conditionId)) {
      user.medicalConditions.push(conditionId);
      await user.save();
    }
    res.json({ message: "Condition added to user", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 6. Remove a condition from a user
exports.removeConditionFromUser = async (req, res) => {
  try {
    const { userId, conditionId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.medicalConditions = user.medicalConditions.filter(
      cid => cid.toString() !== conditionId
    );
    await user.save();
    res.json({ message: "Condition removed from user", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 7. Get a user's medical conditions
exports.getUserConditions = async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await User.findById(userId).populate('medicalConditions');
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.medicalConditions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
