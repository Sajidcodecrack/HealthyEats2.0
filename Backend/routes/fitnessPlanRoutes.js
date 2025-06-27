const express = require('express');
const router = express.Router();
const fitnessPlanController = require('../controllers/fitnessPlan.controller');
const auth = require('../middleware/auth');

// Create or update fitness plan
router.post('/', auth, fitnessPlanController.createOrUpdatePlan);

// Get fitness plan for user
router.get('/user/:userId', auth, fitnessPlanController.getPlanByUser);

module.exports = router;