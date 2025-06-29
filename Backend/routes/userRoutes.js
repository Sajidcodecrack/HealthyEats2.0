const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Registration
router.post('/register', userController.register);
router.post('/verify-signup-otp', userController.verifySignupOtp);

// Login
router.post('/login', userController.login);

// Get user by ID (protected, needs auth middleware)
router.get('/:id', userController.getUser);

// Forgot & Reset Password
router.post('/forgot-password', userController.forgotPassword);
router.post('/verify-reset-token', userController.verifyResetToken);
router.post('/reset-password/:token', userController.resetPassword);


module.exports = router;
