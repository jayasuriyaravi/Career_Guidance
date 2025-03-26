import UserResponse from "./models/UserResponse.js"; // Import the schema
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import mongoose from 'mongoose';
import User from "./models/User.js"; // Import the User Schema


dotenv.config();  // Load environment variables from .env file

const mongoURI = process.env.MONGODB_URI;  // Fetch MongoDB URI from .env

if (!mongoURI) {
    console.error("🚨 MongoDB URI is missing! Check your .env file.");
    process.exit(1);  // Stop server if no MongoDB URI
}

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("✅ Connected to MongoDB Successfully!");
}).catch((error) => {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);  // Stop server if unable to connect
});

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



app.post('/api/register', async (req, res) => {
    try {
        const { name, age, educationLevel, careerStage, fieldOfStudy, technicalSkills, goals } = req.body;

        // 🔹 Basic Validation
        if (!name || !age || !educationLevel || !careerStage || !fieldOfStudy || !technicalSkills || !goals) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // 🔹 Store user details in MongoDB FIRST
        const newUser = new User({
            name,
            age,
            educationLevel,
            careerStage,
            fieldOfStudy,
            technicalSkills,
            goals
        });

        const savedUser = await newUser.save();

        console.log(`✅ User registered: ${savedUser._id}`);

        // 🔹 Generate questions based on user profile
        const questions = await generateQuestions(savedUser);
        storedQuestions = questions;  // Store the questions globally

        res.status(201).json({
            message: "User registered successfully!",
            userId: savedUser._id,  // Return the user ID for tracking
            questions
        });

    } catch (error) {
        console.error("❌ Error during registration:", error);
        res.status(500).json({ message: "Failed to register user and generate questions." });
    }
});


// Function to generate questions using DeepSeek API
const generateQuestions = async (user) => {
    const prompt = `You are an AI-powered career assessment system. Your task is to generate **personalized multiple-choice questions (MCQs)** to evaluate a user's knowledge, skills, and readiness for their **career goal**. The difficulty level of questions must be **adapted** based on the user's profile.

### **Step 1: Categorize User Proficiency**
Analyze the user's education level, career stage, and technical skills to classify them into one of these categories:

📌 **Basic Level (Beginner)**
   - Users with **only school-level education or a diploma.**
   - Users with **no prior technical skills.**
   - Users who are **freshers or career switchers with little experience.**
   - Generate **introductory and fundamental questions** that test basic knowledge in their chosen field.

📌 **Intermediate Level (Moderate)**
   - Users with **undergraduate (Bachelor’s) education.**
   - Users with **some technical skills but no full-time work experience.**
   - Users in **entry-level jobs** or recent graduates.
   - Generate **questions that test both basic concepts and problem-solving skills.**

📌 **Advanced Level (Experienced)**
   - Users with **Master’s/PhD degrees or work experience (Mid-Level/Senior professionals).**
   - Users with **multiple relevant technical skills in their goal area.**
   - Generate **scenario-based, industry-specific, and critical-thinking questions.**

---

### **Step 2: User Profile Analysis**
- Name: ${user.name}
- Age: ${user.age}
- Education Level: ${user.educationLevel}
- Career Stage: ${user.careerStage}
- Field of Study: ${user.fieldOfStudy}
- Technical Skills: ${user.technicalSkills.join(", ")}
- Goals: ${user.goals}

**Determine the difficulty level based on this information before generating questions.**

---

### **Step 3: Generate MCQs**
💡 **Instructions for MCQ Generation:**  
- Generate **5 MCQs** in **valid JSON format** based on the user’s **career goal and proficiency level**.
- Ensure **questions are tailored to their skill level**.
- Each MCQ must have:
  - **"question"**: The MCQ question.
  - **"options"**: An array of choices [{ "label": "A", "text": "Answer 1" }, { "label": "B", "text": "Answer 2" }, ...].
  - **"correct_answer"**: The correct option (A, B, C, or D).
  - **"explanation"**: A brief explanation of the correct answer.

---

### **Step 4: Return JSON Output**
💡 **Return ONLY the JSON array of 5 MCQs** matching the user's goal and skill level.  
Ensure the questions are **relevant, realistic, and useful** for the user's career development.

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

// Endpoint to store user responses

app.post('/api/store-response', async (req, res) => {
    try {
        const { userId, responses, totalScore } = req.body;

        if (!userId || !responses || totalScore === undefined) {
            return res.status(400).json({ message: "Incomplete data received." });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const userResponse = new UserResponse({ userId, responses, totalScore });
        await userResponse.save();

        res.status(201).json({ message: "Responses stored successfully!", userResponse });

    } catch (error) {
        console.error("Error storing user responses:", error);
        res.status(500).json({ message: "Failed to store user responses." });
    }
});


// Skill Gap Analysis API
app.get('/api/skill-gap-analysis/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // 🟢 Fetch user details and responses
        const user = await User.findById(userId);
        const userResponses = await UserResponse.findOne({ userId });

        if (!user || !userResponses) {
            return res.status(404).json({ message: "User data or responses not found." });
        }

        // 🟢 Prepare incorrect answers for weak skill analysis
        const incorrectData = userResponses.responses
            .filter(response => !response.isCorrect) // Filter incorrect answers
            .map(response => ({
                question: response.question,
                correctAnswer: response.correctAnswer,
                userSelectedAnswer: response.userSelectedAnswer,
                explanation: response.explanation
            }));

        // 🟢 Run all three GenAI API calls **at the same time**
        const [industrySkills, missingSkills, weakSkills] = await Promise.all([
            fetchIndustrySkillsFromGenAI(user.goals),
            fetchMissingSkillsFromGenAI(user.technicalSkills, await fetchIndustrySkillsFromGenAI(user.goals)),
            fetchWeakSkillsFromGenAI(incorrectData)
        ]);

        // 🟢 Return Skill Gap Analysis
        res.status(200).json({
            message: "Skill gap analysis completed!",
            industrySkills,
            missingSkills,
            weakSkills
        });

    } catch (error) {
        console.error("❌ Error in skill gap analysis:", error);
        res.status(500).json({ message: "Failed to analyze skill gaps." });
    }
});



const fetchIndustrySkillsFromGenAI = async (careerGoal) => {
    const prompt = `
You are an AI system analyzing job market trends from LinkedIn, Indeed, and Glassdoor.  

### **Task:**
1. Identify **top 10 industry-required skills** for **${careerGoal}**.
2. Extract skills based on latest job postings, hiring trends, and industry demand.
3. Format output as valid JSON:

{
  "skills": ["Skill1", "Skill2", "Skill3", ..., "Skill10"]
}
    `;

    try {
        const response = await axios.post(
            "https://api.deepseek.com/v1/chat/completions",
            {
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "You are an expert in analyzing job trends from LinkedIn, Indeed, and Glassdoor." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 1024
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        let rawContent = response.data.choices[0].message.content;

        // 🔹 Extract JSON content from AI response
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON found in AI response.");
        }

        const jsonString = jsonMatch[0]; // Extracted JSON string  

        return JSON.parse(jsonString).skills || [];

    } catch (error) {
        console.error("❌ Error fetching industry skills from GenAI:", error.response?.data || error.message);
        return [];
    }
};

const fetchMissingSkillsFromGenAI = async (userSkills, industrySkills) => {
    const prompt = `
You are an AI-powered system that compares a user's **technical skills** against industry-required skills.
Identify which industry-required skills the user **does not have**.

### **User's Skills:** ${JSON.stringify(userSkills)}
### **Industry-Required Skills:** ${JSON.stringify(industrySkills)}

💡 **Return JSON Format:**
{
  "missingSkills": ["Skill1", "Skill2", "Skill3", ...]
}

Ensure accuracy by **considering synonyms & variations** (e.g., "ReactJS" vs. "React").
Ignore spelling mistakes and focus on **meaningful skill gaps**.
`;

    try {
        const response = await axios.post(
            "https://api.deepseek.com/v1/chat/completions",
            {
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "You are an AI expert in skill gap analysis." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 1024
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        // Extract missing skills from AI response
        let rawContent = response.data.choices[0].message.content;

        // 🔹 Extract JSON content from AI response
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON found in AI response.");
        }

        const jsonString = jsonMatch[0]; // Extracted JSON string

        return JSON.parse(jsonString).missingSkills || [];
    
    } catch (error) {
        console.error("❌ Error fetching missing skills from GenAI:", error.response?.data || error.message);
        return [];
    }
};


const fetchWeakSkillsFromGenAI = async (incorrectData) => {
    const prompt = `
You are an AI system specializing in analyzing assessment data to identify skill gaps. Your task is to analyze the following incorrect responses from a user’s assessment and determine the specific skills the user is weak in.

For each entry, consider:
- The question text.
- The correct answer.
- The user's selected answer.
- The provided explanation.

Return a valid JSON object in the following format:
{
  "weakSkills": ["Skill1", "Skill2", ...]
}

### **Incorrect Responses:**
${JSON.stringify(incorrectData, null, 2)}
    `;

    try {
        const response = await axios.post(
            "https://api.deepseek.com/v1/chat/completions",
            {
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "You are an expert career advisor analyzing assessment data." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 1024
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        // Parse and return the weakSkills array from DeepSeek AI's response

        let rawContent = response.data.choices[0].message.content;

        // 🔹 Extract JSON content from AI response
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON found in AI response.");
        }

        const jsonString = jsonMatch[0]; // Extracted JSON string

        return JSON.parse(jsonString).weakSkills || [];
    
    } catch (error) {
        console.error("❌ Error fetching weak skills from GenAI:", error.response?.data || error.message);
        return [];
    }
};



// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
