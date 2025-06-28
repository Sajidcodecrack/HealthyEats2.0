const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const reminderController = require('../controllers/reminderController');

router.post('/set', auth, reminderController.setReminder);
router.get('/get', auth, reminderController.getReminders);
router.patch('/deactivate', auth, reminderController.deactivateReminder);

module.exports = router;
