const { Schema: SchemaFDT, model: modelFDT } = require('mongoose');

const FoodDiseaseTagSchema = new SchemaFDT({
  food: { type: SchemaFDT.Types.ObjectId, ref: 'Food', required: true },
  condition: { type: SchemaFDT.Types.ObjectId, ref: 'MedicalCondition', required: true },
}, { timestamps: true });

module.exports = modelFDT('FoodDiseaseTag', FoodDiseaseTagSchema);