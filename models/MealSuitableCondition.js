const { Schema: SchemaMSC, model: modelMSC } = require('mongoose');

const MealSuitableConditionSchema = new SchemaMSC({
  meal: { type: SchemaMSC.Types.ObjectId, ref: 'Meal', required: true },
  condition: { type: SchemaMSC.Types.ObjectId, ref: 'MedicalCondition', required: true },
}, { timestamps: true });

module.exports = modelMSC('MealSuitableCondition', MealSuitableConditionSchema);
