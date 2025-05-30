const mongoose = require('mongoose');

const ChatbotLogsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  question: { type: String, required: true },
  answer: { type: String },
  context: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatbotLogs', ChatbotLogsSchema);
