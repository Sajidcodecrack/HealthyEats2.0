const { Schema: SchemaMP, model: modelMP } = require('mongoose');

const MealPlanSchema = new SchemaMP({
  user: { type: SchemaMP.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  totalCalories: Number,
  budgetUsed: Number,
  generatedBy: String,
  dailyCalories: Number,
}, { timestamps: true });

module.exports = modelMP('MealPlan', MealPlanSchema);