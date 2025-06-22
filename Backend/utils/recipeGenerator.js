const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateRecipeFromLLM = async (menuText) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

  const prompt = `
Generate a full recipe (ingredients + instructions) for this meal:
${menuText}

Output format (JSON):
{
  "title": "Recipe Title",
  "ingredients": ["item 1", "item 2", ...],
  "steps": ["step 1", "step 2", ...]
}
`;


  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Try parsing the response into JSON (if Gemini returns JSON block)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      return { message: "Recipe generated but not in JSON format", raw: responseText };
    }
  } catch (error) {
    console.error("Gemini error:", error.message);
    return { error: "Recipe generation failed using Gemini." };
  }
};

