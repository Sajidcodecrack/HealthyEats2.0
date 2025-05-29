const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Registration
router.post('/register', userController.register);

// Login
router.post('/login', userController.login);

// Get user by ID (protected, needs auth middleware)
router.get('/:id', userController.getUser);

module.exports = router;
