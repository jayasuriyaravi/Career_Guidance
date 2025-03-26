import express from "express";
import axios from "axios";
import User from "../models/User.js";
import UserResponse from "../models/UserResponse.js"; // ✅ Import UserResponse
import SkillGap from "../models/SkillGap.js";

const router = express.Router();

// Skill Gap Analysis API
router.get('/skill-gap-analysis/:userId', async (req, res) => {
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

        let existingAnalysis = await SkillGap.findOne({ userId });

        if (existingAnalysis) {
            // ✅ Update existing analysis
            existingAnalysis.industrySkills = industrySkills;
            existingAnalysis.missingSkills = missingSkills;
            existingAnalysis.weakSkills = weakSkills;
            await existingAnalysis.save();
        } else {
            // ✅ Create new analysis entry
            const newAnalysis = new SkillGap({
                userId,
                industrySkills,
                missingSkills,
                weakSkills
            });
            await newAnalysis.save();
        }


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
export default router;
