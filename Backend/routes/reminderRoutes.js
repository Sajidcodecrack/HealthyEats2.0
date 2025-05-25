const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reminderController');

router.post('/', ctrl.createReminder);          // Create
router.get('/', ctrl.getReminders);             // Read 
router.put('/:id', ctrl.updateReminder);        // Update
router.delete('/:id', ctrl.deleteReminder);     // Delete

module.exports = router;
