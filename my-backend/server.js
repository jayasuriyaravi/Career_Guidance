import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai'; // Using OpenAI package

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(cors({
    origin: 'http://localhost:5173', // Replace with your frontend origin if needed
}));
app.use(express.json()); // Parse JSON requests

// Check if OPENAI_API_KEY is loaded
if (!process.env.OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY is missing in the environment variables.");
    process.exit(1);
}

// Initialize OpenAI client
const client = new OpenAI({
    baseURL: 'https://models.inference.ai.azure.com', // Replace with Azure OpenAI endpoint
    apiKey: process.env.OPENAI_API_KEY,
});

// Global variable to store generated questions
let storedQuestions = [];

// Registration endpoint
app.post('/api/register', async (req, res) => {
    const userData = req.body;

    // Basic validation
    if (!userData.name || !userData.age) {
        console.error("Invalid registration data:", userData);
        return res.status(400).json({ message: "Name and age are required." });
    }

    try {
        const questions = await generateQuestions(userData);
        storedQuestions = questions; // Store the questions globally
        res.json({ message: "User registered successfully!", questions });
    } catch (error) {
        console.error("Error generating questions:", error.message);
        res.status(500).json({ message: "An error occurred while generating questions." });
    }
});

// Function to generate questions using OpenAI API
const generateQuestions = async (data) => {
    const prompt = `
You are a career advisor helping students and professionals evaluate their skills, 
knowledge, and career readiness. Based on the following user profile, 
generate multiple-choice questions (MCQs) that will help evaluate the user's skills, interests, and career decisions.
For each question, provide four options (A, B, C, D), with one correct answer and three distractors.

User profile:
- Name: ${data.name}
- Age: ${data.age}
- Education Level: ${data.educationLevel || "not provided"}
- Career Stage: ${data.careerStage || "not provided"}
- Field of Study: ${data.fieldOfStudy || "not provided"}
- Technical Skills: ${data.technicalSkills || "not provided"}
- Goals: ${data.goals || "not provided"}

Please generate thoughtful MCQs that can help assess the user's skills and career decision-making abilities. Each question should have options (A, B, C, D), with one correct answer clearly indicated.
`;

    try {
        const response = await client.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful career advisor AI." },
                { role: "user", content: prompt },
            ],
            model: "gpt-4o", // Replace with the appropriate Azure OpenAI model
            temperature: 1,
            max_tokens: 4096,
            top_p: 1,
        });

        const questionsText = response.choices[0]?.message?.content || '';
        if (!questionsText || questionsText.trim() === '') {
            throw new Error('No valid questions generated.');
        }

        // Format the text into a structured JSON array
        const formattedQuestions = formatQuestions(questionsText);

        if (!formattedQuestions || formattedQuestions.length === 0) {
            throw new Error('Generated questions are empty.');
        }

        return formattedQuestions;
    } catch (error) {
        console.error("Error while calling Azure OpenAI API:", error.message);
        throw new Error("Failed to generate questions.");
    }
};

// Helper function to format the raw text into a structured format
const formatQuestions = (questionsText) => {
    // Split the questions and options by line
    const lines = questionsText.split('\n').map(line => line.trim()).filter(line => line !== '');

    const formattedQuestions = [];
    let currentQuestion = null;
    let currentOptions = [];

    lines.forEach((line) => {
        if (line.startsWith('**')) {
            // If we encounter a new question, push the previous question (if any) and reset
            if (currentQuestion) {
                formattedQuestions.push({
                    question: currentQuestion,
                    options: currentOptions
                });
            }
            // Start a new question
            currentQuestion = line.replace(/\*\*/g, '').trim(); // Remove the '**' marks
            currentOptions = []; // Reset options for the new question
        } else if (line.match(/^[A-D]\)/)) {
            // If it's an option, capture it
            currentOptions.push(line.trim());
        }
    });

    // Add the last question
    if (currentQuestion) {
        formattedQuestions.push({
            question: currentQuestion,
            options: currentOptions
        });
    }

    return formattedQuestions;
};



// Health check endpoint
app.get('/api/health', (req, res) => {
    try {
        res.status(200).json({ status: 'API is healthy and running.' });
    } catch (error) {
        res.status(500).json({ status: 'API is down', error: error.message });
    }
});

// Endpoint to fetch stored questions
app.get('/api/questions', (req, res) => {
    if (storedQuestions.length === 0) {
        return res.status(404).json({ message: "No questions available." });
    }
    res.status(200).json({ questions: storedQuestions });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
