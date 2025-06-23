const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ChatbotLogsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  messages: [MessageSchema], 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatbotLogs', ChatbotLogsSchema);
