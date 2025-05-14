const { Schema: SchemaM, model: modelM } = require('mongoose');

const MealSchema = new SchemaM({
  name: { type: String, required: true },
  description: String,
  totalCalories: Number,
  priceEstimate: Number,
}, { timestamps: true });

module.exports = modelM('Meal', MealSchema);