// import dotenv from 'dotenv';
// import express from 'express';
// import cors from 'cors';
// import axios from 'axios';

// dotenv.config();  // Load environment variables from .env file
// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors({
//     origin: 'http://localhost:5173',  // Allow only your frontend server
// }));

// app.use(express.json());  // Parse JSON requests

// // DeepSeek API Configuration
// const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";  // Correct API endpoint
// const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;  // Store API key securely

// // Global variable to store generated questions
// let storedQuestions = [];

// // Endpoint for registration data and question generation
// app.post('/api/register', async (req, res) => {
//     const userData = req.body;

//     // Basic validation
//     if (!userData.name || !userData.age) {
//         console.error("Invalid registration data:", userData);
//         return res.status(400).json({ message: "Name and age are required." });
//     }

//     try {
//         const questions = await generateQuestions(userData);
//         storedQuestions = questions;  // Store the questions globally
//         res.json({ message: "User registered successfully!", questions });
//     } catch (error) {
//         console.error("Error generating questions:", error.response?.data || error.message);
//         res.status(500).json({ message: "An error occurred while generating questions." });
//     }
// });

// // Function to generate questions using DeepSeek API
// const generateQuestions = async (data) => {
//     const prompt = `
// You are a career advisor helping students and professionals evaluate their skills, knowledge, and career readiness. Based on the following user profile, generate multiple-choice questions (MCQs) that will help evaluate the user's skills, interests, and career decisions. For each question, provide four options (A, B, C, D), with one correct answer and three distractors.

// User profile:
// - Name: ${data.name}
// - Age: ${data.age}
// - Education Level: ${data.educationLevel}
// - Career Stage: ${data.careerStage}
// - Field of Study: ${data.fieldOfStudy}
// - Technical Skills: ${data.technicalSkills}
// - Goals: ${data.goals}

// Please generate thoughtful MCQs that can help assess the user's skills and career decision-making abilities.
//     `;

//     try {
//         const response = await axios.post(
//             DEEPSEEK_API_URL,
//             {
//                 model: "deepseek-chat",
//                 messages: [
//                     { role: "system", content: "You are a helpful career advisor AI." },
//                     { role: "user", content: prompt }
//                 ],
//                 temperature: 0.7,
//                 max_tokens: 4096,
//                 top_p: 1,
//             },
//             {
//                 headers: {
//                     "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
//                     "Content-Type": "application/json"
//                 }
//             }
//         );

//         // Extract the AI response
//         const questions = response.data.choices?.[0]?.message?.content || '';
//         if (!questions || questions.trim() === '') {
//             throw new Error('No valid questions generated.');
//         }

//         // Split and clean the generated questions
//         const cleanedQuestions = questions.split('\n').filter(q => q.trim() !== '');
//         if (cleanedQuestions.length === 0) {
//             throw new Error('Generated questions are empty.');
//         }

//         return cleanedQuestions;
//     } catch (error) {
//         console.error("Error while calling DeepSeek API:", error.response?.data || error.message);
//         throw new Error("Failed to generate questions.");
//     }
// };

// // Health check endpoint
// app.get('/api/health', (req, res) => {
//     try {
//         res.status(200).json({ status: 'API is healthy and running.' });
//     } catch (error) {
//         res.status(500).json({ status: 'API is down', error: error.message });
//     }
// });

// // New endpoint to fetch stored questions
// app.get('/api/questions', (req, res) => {
//     if (storedQuestions.length === 0) {
//         return res.status(404).json({ message: "No questions available." });
//     }
//     res.status(200).json({ questions: storedQuestions });
// });

// // Start the server
// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });



import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import axios from 'axios';

dotenv.config();  // Load environment variables from .env file
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: 'http://localhost:5173',  // Allow only your frontend server
}));

app.use(express.json());  // Parse JSON requests

// DeepSeek API Configuration
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";  // Update with correct endpoint
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;  // Ensure this is in your .env file

// Global variable to store generated questions
let storedQuestions = [];

// Endpoint for user registration and question generation
app.post('/api/register', async (req, res) => {
    const userData = req.body;

    // Basic validation
    if (!userData.name || !userData.age) {
        console.error("Invalid registration data:", userData);
        return res.status(400).json({ message: "Name and age are required." });
    }

    try {
        const questions = await generateQuestions(userData);
        storedQuestions = questions;  // Store the questions globally
        res.json({ message: "User registered successfully!", questions });
    } catch (error) {
        console.error("Error generating questions:", error.response?.data || error.message);
        res.status(500).json({ message: "An error occurred while generating questions." });
    }
});

// Function to generate questions using DeepSeek API
const generateQuestions = async (data) => {
    const prompt = `
You are a career advisor AI. Based on the following user profile, generate multiple-choice questions (MCQs) in **valid JSON format**. Each MCQ should have:
- "question": The MCQ question.
- "options": An array of objects [{ "label": "A", "text": "Answer 1" }, { "label": "B", "text": "Answer 2" }, ...].
- "correct_answer": The correct option (A, B, C, or D).
- "explanation": A brief explanation for the correct answer.

User profile:
- Name: ${data.name}
- Age: ${data.age}
- Education Level: ${data.educationLevel}
- Career Stage: ${data.careerStage}
- Field of Study: ${data.fieldOfStudy}
- Technical Skills: ${data.technicalSkills}
- Goals: ${data.goals}

Return **ONLY a valid JSON array** of MCQs without extra text, Markdown formatting, or explanations outside of the "explanation" field.
    `;

    try {
        const response = await axios.post(
            DEEPSEEK_API_URL,
            {
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "You are a helpful career advisor AI." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 4096,
                top_p: 1,
            },
            {
                headers: {
                    "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        // Extract AI response text
        let rawContent = response.data.choices?.[0]?.message?.content;
        if (!rawContent || rawContent.trim() === '') {
            throw new Error('No valid questions generated.');
        }

        // Remove Markdown formatting (DeepSeek may return ```json ... ```)
        rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();

        // Parse the cleaned JSON response
        let questions;
        try {
            questions = JSON.parse(rawContent);
        } catch (parseError) {
            console.error("Error parsing DeepSeek AI response:", parseError);
            console.error("Raw response content:", rawContent); // Log raw content for debugging
            throw new Error("Failed to parse AI-generated JSON.");
        }

        // Ensure it's an array of questions
        if (!Array.isArray(questions)) {
            throw new Error("AI response is not a valid JSON array.");
        }

        // Convert options from object to array
        const formattedQuestions = questions.map(q => ({
            question: q.question,
            options: Object.keys(q.options).map(key => ({
                label: key,
                text: q.options[key]
            })),
            correct_answer: q.correct_answer,
            explanation: q.explanation
        }));

        return formattedQuestions;
    } catch (error) {
        console.error("Error while calling DeepSeek API:", error.response?.data || error.message);
        throw new Error("Failed to generate questions.");
    }
};



// Health check endpoint
app.get('/api/health', (req, res) => {
    try {
        res.status(200).json({ status: 'API is healthy and running.' });
    } catch (error) {
        res.status(500).json({ status: 'API is down', error: error.message });
    }
});

// New endpoint to fetch stored questions
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
