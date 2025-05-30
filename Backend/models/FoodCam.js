const mongoose = require('mongoose');

const FoodCamSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  imageUrl: { type: String, required: true },
  recognizedFood: { type: String },
  caloriesEstimate: { type: Number },
  nutritionInfo: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FoodCam', FoodCamSchema);
