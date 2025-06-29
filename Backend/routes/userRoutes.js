const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Use correct path & only declare once
const upload = require('../middleware/upload');
const User = require('../models/User');

// Registration
router.post('/register', userController.register);
router.post('/verify-signup-otp', userController.verifySignupOtp);

// Login
router.post('/login', userController.login);

// Get user by ID (protected, needs auth middleware)
router.get('/:id', userController.getUser);

//  Upload profile picture
router.post('/upload-profile/:id', upload.single('profile'), async (req, res) => {
  try {
    const userId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const imagePath = `/uploads/profiles/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: imagePath },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.status(200).json({
      msg: 'Profile image uploaded successfully',
      imagePath: imagePath,
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error while uploading image' });
  }
});
// Forgot & Reset Password
router.post('/forgot-password', userController.forgotPassword);
router.post('/verify-reset-token', userController.verifyResetToken);
router.post('/reset-password/:token', userController.resetPassword);


module.exports = router;
