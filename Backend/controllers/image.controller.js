const { GoogleGenerativeAI } = require("@google/generative-ai");
const ImageAnalysis = require("../models/ImageAnalysis");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

exports.uploadImage = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!req.file) return res.status(400).json({ error: "Image is required" });
        if (!userId) return res.status(400).json({ error: "userId is required" });

        const imageBuffer = req.file.buffer;
        const imageBase64 = imageBuffer.toString("base64");

        const prompt = "What is this food? Give the food name only also give me the calories per 100g with carbs, fiber, protein, also high or low sugar level in JSON format";

        const result = await model.generateContent([
            { inlineData: { mimeType: req.file.mimetype, data: imageBase64 } },
            prompt,
        ]);

        const rawText = result.response.text();

        //  Extract JSON block from markdown response
        const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/i);
        let structuredResult;

        if (jsonMatch && jsonMatch[1]) {
            try {
                structuredResult = JSON.parse(jsonMatch[1]);
            } catch (err) {
                console.warn(" Failed to parse JSON, saving raw text instead");
                structuredResult = { raw: rawText };
            }
        } else {
            structuredResult = { raw: rawText };
        }

        const newAnalysis = new ImageAnalysis({
            userId,
            imageBase64,
            analysisResult: structuredResult,
        });

        await newAnalysis.save();

        res.status(200).json({
            message: "Image analyzed and saved",
            data: newAnalysis,
        });

    } catch (err) {
        console.error("Gemini error:", err.message);
        res.status(500).json({ error: "Image analysis failed" });
    }
};
