const { Schema: SchemaCL, model: modelCL } = require('mongoose');

const ChatLogSchema = new SchemaCL({
  user: { type: SchemaCL.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true }, 
  message: { type: String, required: true },
}, { timestamps: true });

module.exports = modelCL('ChatLog', ChatLogSchema);