const mongoose = require("mongoose");

const ImageAnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  imageBase64: { type: String, required: true },
  analysisResult: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ImageAnalysis", ImageAnalysisSchema);
