const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  registeredAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  profileImage: { type: String, default: '' }
});

module.exports = mongoose.model('Users', UsersSchema);
