const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ReminderSchema = new Schema({
  user:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type:          { type: String, enum: ['medication', 'meal', 'water', 'exercise', 'custom'], required: true },
  title:         { type: String, required: true }, 
  description:   { type: String },
  time:          { type: Date, required: true },   
  repeat:        { type: String, enum: ['none', 'daily', 'weekly'], default: 'none' },
  completed:     { type: Boolean, default: false }
}, { timestamps: true });

module.exports = model('Reminder', ReminderSchema);
