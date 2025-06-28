function calculateBMI(heightFeet, heightInches, weightKg) {
  const totalInches = heightFeet * 12 + heightInches;
  const heightInMeters = totalInches * 0.0254;
  const bmi = weightKg / (heightInMeters * heightInMeters);
  return parseFloat(bmi.toFixed(2));
}

function suggestCalorieIntake(bmi) {
  if (bmi < 18.5) return 2500;
  if (bmi < 24.9) return 2200;
  if (bmi < 29.9) return 2000;
  return 1800;
}

module.exports = { calculateBMI, suggestCalorieIntake };
