// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');

router.get('/profile', getProfile);      // GET /api/user/profile?userId=...
router.put('/profile', updateProfile);   // PUT /api/user/profile

module.exports = router;
