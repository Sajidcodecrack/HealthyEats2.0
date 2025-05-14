const { Schema: SchemaR, model: modelR } = require('mongoose');

const ReminderSchema = new SchemaR({
  user: { type: SchemaR.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  time: { type: Date, required: true },
  message: { type: String },
}, { timestamps: true });

module.exports = modelR('Reminder', ReminderSchema);
