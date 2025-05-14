const { Schema: SchemaDP, model: modelDP } = require('mongoose');

const DiseasePredictionSchema = new SchemaDP({
  user: { type: SchemaDP.Types.ObjectId, ref: 'User', required: true },
  condition: { type: SchemaDP.Types.ObjectId, ref: 'MedicalCondition', required: true },
  predictedAt: { type: Date, default: Date.now }, //chances of a dieases not actual prediction
  riskScore: Number,  //from the predicationAT
  notes: String,      //What can be done to prevent the disease 
}, { timestamps: true });

module.exports = modelDP('DiseasePrediction', DiseasePredictionSchema);