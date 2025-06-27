const FitnessPlan = require('../models/FitnessPlans');

// Create or update fitness plan
exports.createOrUpdatePlan = async (req, res) => {
  try {
    const { userId, plan, fitnessGoal, experienceLevel, equipment, healthConditions, age, gender } = req.body;
    
    // Validate required fields
    if (!userId || !plan) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Find existing plan and update or create new
    const updatedPlan = await FitnessPlan.findOneAndUpdate(
      { userId },
      {
        plan,
        fitnessGoal,
        experienceLevel,
        equipment,
        healthConditions,
        age,
        gender
      },
      { new: true, upsert: true }
    );
    
    res.status(200).json(updatedPlan);
  } catch (error) {
    console.error("Error saving fitness plan:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get latest fitness plan for user
exports.getPlanByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const plan = await FitnessPlan.findOne({ userId });
    
    if (!plan) {
      return res.status(404).json({ message: "No fitness plan found" });
    }
    
    res.status(200).json(plan);
  } catch (error) {
    console.error("Error fetching fitness plan:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};