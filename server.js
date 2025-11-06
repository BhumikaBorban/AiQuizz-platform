import express from 'express';
import cors from 'cors';
import 'dotenv/config'; // Load environment variables from .env
import { GoogleGenAI } from '@google/genai';

const app = express();
const port = 3000;

// Initialize Gemini Client securely using environment variable
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("FATAL: GEMINI_API_KEY is not set in .env file.");
    process.exit(1);
}
const ai = new GoogleGenAI({ apiKey });

// Middleware setup
app.use(cors()); // Allows your frontend (running on a different port/domain) to access this server
app.use(express.json()); // To parse JSON bodies

// --- Quiz Generation Endpoint ---
app.post('/generate-quiz', async (req, res) => {
    const { topic } = req.body; // Get the topic from the frontend request

    if (!topic) {
        return res.status(400).json({ error: "Missing 'topic' in request body." });
    }

    const prompt = `Generate a 5-question multiple-choice quiz about '${topic}'. Each question must have a 'q' for the question text, an 'options' array with 4 choices, and an 'answer' field with the exact correct option text. Return ONLY a single JSON object with a key 'quiz' containing the array.`;
    
    console.log(`Generating quiz for: ${topic}`);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        // The model returns the JSON object as a string in response.text
        const jsonText = response.text.trim().replace(/^```json|```$/g, '').trim();
        const quizData = JSON.parse(jsonText);
        
        // Send the generated quiz data back to the frontend
        res.json(quizData.quiz || quizData); 

    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ error: "Failed to generate quiz from AI." });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Gemini Quiz Backend running at http://localhost:${port}`);
});