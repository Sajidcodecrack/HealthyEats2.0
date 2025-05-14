const { Schema: SchemaMF, model: modelMF } = require('mongoose');

const MealFoodSchema = new SchemaMF({
  meal: { type: SchemaMF.Types.ObjectId, ref: 'Meal', required: true },
  food: { type: SchemaMF.Types.ObjectId, ref: 'Food', required: true },
  quantity: Number, // in grams
}, { timestamps: true });

module.exports = modelMF('MealFood', MealFoodSchema);