// routes/authRoutes.js
const express = require('express');
const router = express.Router();
// ← NOT require('router')

const { register, login } = require('../controllers/authController');

router.post('/register', register);       // both register/login must be functions
router.post('/login', login);

module.exports = router;
