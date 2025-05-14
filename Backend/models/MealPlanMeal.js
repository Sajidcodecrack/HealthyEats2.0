const { Schema: SchemaMPM, model: modelMPM } = require('mongoose');

const MealPlanMealSchema = new SchemaMPM({
  mealPlan: { type: SchemaMPM.Types.ObjectId, ref: 'MealPlan', required: true },
  meal: { type: SchemaMPM.Types.ObjectId, ref: 'Meal', required: true },
}, { timestamps: true });

module.exports = modelMPM('MealPlanMeal', MealPlanMealSchema);