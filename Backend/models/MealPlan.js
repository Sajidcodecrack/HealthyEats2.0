const mongoose = require('mongoose');
const { Schema } = mongoose;

const RecipeSchema = new Schema({
  title: { type: String },
  ingredients: { type: [String] },
  steps: { type: [String] }
}, { _id: false }); // Prevent nested _id creation

const MealSectionSchema = new Schema({
  Foods: { type: [String], required: true },
  Fruits: { type: [String], required: true },
  Drinks_Tea: { type: [String], required: true },
  Nutrition: { type: String, required: true },
  EstimatedCost: { type: String, required: true },
  recipe: { type: RecipeSchema, default: null } // ✅ Add this line
}, { _id: false });

const MealPlanSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
      unique: true,
      index: true,
    },
    Breakfast: { type: MealSectionSchema, required: true },
    Lunch: { type: MealSectionSchema, required: true },
    Snack: { type: MealSectionSchema, required: true },
    Dinner: { type: MealSectionSchema, required: true },
    TotalCalories: { type: String, required: true },
    TotalEstimatedCost: { type: String, required: true },
    WaterIntakeLiters: { type: String, required: true },
    Notes: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'mealplans' }
);

module.exports =
  mongoose.models.MealPlan || mongoose.model('MealPlan', MealPlanSchema);
