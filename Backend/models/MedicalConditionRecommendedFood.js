const { Schema: SchemaMCRF, model: modelMCRF } = require('mongoose');

const MedCondRecFoodSchema = new SchemaMCRF({
  condition: { type: SchemaMCRF.Types.ObjectId, ref: 'MedicalCondition', required: true },
  food: { type: SchemaMCRF.Types.ObjectId, ref: 'Food', required: true },
}, { timestamps: true });

module.exports = modelMCRF('MedicalConditionRecommendedFood', MedCondRecFoodSchema);