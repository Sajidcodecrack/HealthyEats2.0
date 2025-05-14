const { Schema: SchemaFP, model: modelFP } = require('mongoose');

const FitnessPlanSchema = new SchemaFP({
  user: { type: SchemaFP.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  exercises: [{
    name: String,
    reps: Number,
    sets: Number,
    duration: Number, // in minutes
  }],
  totalDuration: Number,
  caloriesBurned: Number,
}, { timestamps: true });

module.exports = modelFP('FitnessPlan', FitnessPlanSchema);