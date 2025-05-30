const UserProfile = require('../models/UserProfile');

// Create profile (onboarding)
exports.createUserProfile = async (req, res) => {
  try {
    const { age, gender, heightFeet, heightInches, weight } = req.body;
    const userId = req.user.userId; // Set by auth middleware (from JWT)

    // Prevent duplicate profile
    const exists = await UserProfile.findOne({ userId });
    if (exists) return res.status(400).json({ msg: 'Profile already exists.' });

    const newProfile = new UserProfile({
      userId,
      age,
      gender,
      heightFeet,
      heightInches,
      weight
    });
    await newProfile.save();
    res.status(201).json(newProfile);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await UserProfile.findOne({ userId });
    if (!profile) return res.status(404).json({ msg: 'Profile not found.' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    // Only allow updating allowed fields
    const allowedUpdates = (({ age, gender, heightFeet, heightInches, weight }) => ({ age, gender, heightFeet, heightInches, weight }))(updates);
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { ...allowedUpdates, updatedAt: new Date() },
      { new: true }
    );
    if (!updatedProfile) return res.status(404).json({ msg: 'Profile not found.' });
    res.json(updatedProfile);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Delete user profile (rarely needed)
exports.deleteUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await UserProfile.findOneAndDelete({ userId });
    if (!result) return res.status(404).json({ msg: 'Profile not found.' });
    res.json({ msg: 'Profile deleted.' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
