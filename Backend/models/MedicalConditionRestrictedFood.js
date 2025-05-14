const { Schema: SchemaMCRSF, model: modelMCRSF } = require('mongoose');

const MedCondResFoodSchema = new SchemaMCRSF({
  condition: { type: SchemaMCRSF.Types.ObjectId, ref: 'MedicalCondition', required: true },
  food: { type: SchemaMCRSF.Types.ObjectId, ref: 'Food', required: true },
}, { timestamps: true });

module.exports = modelMCRSF('MedicalConditionRestrictedFood', MedCondResFoodSchema);
