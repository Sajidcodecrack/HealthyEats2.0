const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  target_muscle: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, required: true },
  type: { type: String, required: true },
  image_url: { type: String, required: true },
  video_url: { type: String, required: true },
  reps: { type: String, required: true }
});

const DayPlanSchema = new mongoose.Schema({
  day: { type: String, required: true },
  exercises: [ExerciseSchema]
});

const FitnessPlanSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Users', 
    required: true,
    index: true
  },
  plan: [DayPlanSchema],
  fitnessGoal: String,
  experienceLevel: String,
  equipment: [String],
  healthConditions: String,
  age: Number,
  gender: String
}, { timestamps: true });

module.exports = mongoose.model('FitnessPlan', FitnessPlanSchema);