const { Schema: SchemaF, model: modelF } = require('mongoose');

const FoodSchema = new SchemaF({
  name: { type: String, required: true },
  caloriesPer100g: Number,
  type: String,
  localName: String,
  category: String,
  protein: Number,
  carbs: Number,
  fat: Number,
  pricePer100g: Number,
}, { timestamps: true });

module.exports = modelF('Food', FoodSchema);
