const express = require('express');
const router = express.Router();
const ChatbotLogs = require('../models/ChatbotLogs'); // Adjust path as needed

// POST /api/chatlogs - Save a new chat interaction
router.post('/', async (req, res) => {
  try {
    const { userId, userMessage, botReply, sessionId, context } = req.body;

    const newChat = await ChatbotLogs.create({
      userId,
      sessionId,
      context,
      messages: [
        { role: 'user', content: userMessage },
        { role: 'assistant', content: botReply }
      ]
    });

    res.status(201).json(newChat);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save chat log', details: err.message });
  }
});

// GET /api/chatlogs/user/:userId/messages
router.get('/user/:userId/messages', async (req, res) => {
  try {
    const { userId } = req.params;

    // Flatten all messages into one sorted array
    const logs = await ChatbotLogs.find({ userId });

    const allMessages = logs.flatMap(log =>
      log.messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      }))
    );

    // Sort by timestamp
    allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json(allMessages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user messages' });
  }
});



// GET /api/chatlogs - Get all chat logs (admin use)
router.get('/', async (req, res) => {
  try {
    const allLogs = await ChatbotLogs.find().sort({ createdAt: -1 }).limit(100);
    res.json(allLogs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all chat logs' });
  }
});

module.exports = router;
