// controllers/userController.js
const User = require('../models/User');

// Get user profile (by userId)
exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.query; // or req.body.userId
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    // Allowed fields
    const updateFields = [
      'name', 'age', 'gender', 'heightFeet', 'heightInches',
      'weight', 'activityLevel', 'budget', 'profilePhoto'
    ];

    const updates = {};
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
