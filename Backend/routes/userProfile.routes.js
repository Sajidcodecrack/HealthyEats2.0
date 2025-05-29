const express = require('express');
const router = express.Router();
const userProfileController = require('../controllers/userProfile.controller');
const auth = require('../middleware/auth'); // optional, for protected routes

// Create (onboarding)
router.post('/', auth, userProfileController.createUserProfile);

// Get user profile
router.get('/:userId', auth, userProfileController.getUserProfile);

// Update user profile
router.put('/:userId', auth, userProfileController.updateUserProfile);

// (Optional) Delete user profile
router.delete('/:userId', auth, userProfileController.deleteUserProfile);

module.exports = router;
