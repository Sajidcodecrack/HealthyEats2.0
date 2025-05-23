// routes/medicalConditionRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/medicalConditionController');

// Global CRUD (for all conditions)
router.post('/', ctrl.createCondition);          // Create new condition
router.get('/', ctrl.getAllConditions);          // Get all conditions
router.put('/:id', ctrl.updateCondition);        // Update condition by ID
router.delete('/:id', ctrl.deleteCondition);     // Delete condition by ID

// User-specific condition management
router.post('/add', ctrl.addConditionToUser);             // Add condition to user
router.post('/remove', ctrl.removeConditionFromUser);     // Remove condition from user
router.get('/user', ctrl.getUserConditions);              // Get user's conditions (by userId in query)

module.exports = router;
