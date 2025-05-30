const mongoose = require('mongoose');

const FitnessPlansSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  planDate: { type: Date, required: true },
  exercises: [
    {
      name: String,
      sets: Number,
      reps: Number,
      duration: Number
    }
  ],
  completed: { type: Boolean, default: false },
  duration: { type: Number }, // total planned duration in minutes
  caloriesBurned: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FitnessPlans', FitnessPlansSchema);
