const MealPlan = require('../models/MealPlan');
const { generateRecipeFromLLM } = require('../utils/recipeGenerator');

exports.generateRecipe = async (req, res) => {
  try {
    const { mealId, mealType } = req.body;

    const plan = await MealPlan.findById(mealId);
    if (!plan) return res.status(404).json({ message: 'Meal plan not found' });

    const selectedMeal = plan[mealType];
    if (!selectedMeal) return res.status(400).json({ message: `Meal type "${mealType}" not found` });

    const menuText = JSON.stringify(selectedMeal, null, 2);
    const recipe = await generateRecipeFromLLM(menuText);

    // ✅ Save under correct sub-document
    plan[mealType].recipe = recipe;
    await plan.save();

    res.json({
      message: `Recipe for ${mealType} saved successfully`,
      recipe
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
