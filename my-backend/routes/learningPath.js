import express from "express";
import axios from "axios";
import LearningPath from "../models/LearningPath.js";
import User from "../models/User.js";
import SkillGap from "../models/SkillGap.js";

const router = express.Router();

// 🟢 Generate Personalized Learning Path API
router.get("/api/learning-path/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(`🔍 Fetching Learning Path for UserID: ${userId}`);

        // 🔹 Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            console.log("❌ User not found!");
            return res.status(404).json({ message: "User not found." });
        }

        // 🔹 Ensure user goals exist
        const userGoals = user?.goals || "Not specified";
        console.log(`✅ userGoal is................ ${userGoals}`);

        // 🔹 Check if learning path exists in DB
        let existingPath = await LearningPath.findOne({ userId });
        if (existingPath) {
            console.log(`✅ Returning stored Learning Path for User ${userId}.`);
            return res.status(200).json(existingPath);
        }

        console.log("🛠️ No stored path found. Generating a new one...");

        // 🔹 Fetch Skill Gap Analysis Data
        const skillGap = await SkillGap.findOne({ userId });
        if (!skillGap) {
            return res.status(400).json({ message: "Skill Gap Analysis not found. Run Skill Gap Analysis first!" });
        }

        console.log("📊 Skill Gap Data:", skillGap);

        // 🔹 Request AI-generated Learning Path
        const prompt = `
You are an **AI-powered career roadmap generator**. Your job is to create a **fully structured, in-depth learning roadmap** with **detailed hands-on projects, frameworks, real-world applications, interview questions, documentation, and recommended books**.

## **📌 User Information**
- **User's Goal:** ${userGoals}  
- **Weak Skills:** ${JSON.stringify(skillGap.weakSkills.length > 0 ? skillGap.weakSkills : "None")}  
- **Missing Skills:** ${JSON.stringify(skillGap.missingSkills.length > 0 ? skillGap.missingSkills : "None")}  
- **Industry Skills Required:** ${JSON.stringify(skillGap.industrySkills.length > 0 ? skillGap.industrySkills : "None")}  

## **📜 Instructions for Learning Path**
1️⃣ **Break down the roadmap into:**
   - **Beginner Level**
   - **Intermediate Level**
   - **Advanced Level**

2️⃣ **For each level, return a structured roadmap including:**
   - ✅ **List of key concepts** (Full breakdown, no summaries)  
   - ✅ **All fundamental & advanced topics** (DO NOT SKIP any topics)  
   - ✅ **Subtopics under each topic** (DO NOT SKIP any subtopics)  
   - ✅ **Hands-on projects** (At least 2 per subtopic)  
   - ✅ **Frameworks, tools & libraries**  
   - ✅ **Step-by-step learning sequence**  
   - ✅ **Multiple courses & tutorials (Udemy, Coursera, freeCodeCamp, etc.)**  
   - ✅ **Top YouTube channels in English, Hindi, Tamil (At least 5 per language)**  
   - ✅ **Official documentation links**  
   - ✅ **Books for deep understanding**  
   - ✅ **Real-world projects for industry application**  
   - ✅ **Key interview questions for skill assessment**  

## **📂 JSON Output Format**
\`\`\`json
{
  "beginner": [
    {
      "skill": "Frontend Development",
      "topics": [
        {
          "name": "HTML & CSS Basics",
          "subtopics": [
            {
              "name": "HTML Elements & Structure",
              "hands_on": [
                {
                  "name": "Build a simple webpage",
                  "description": "Use basic HTML tags and semantic elements to create a homepage."
                },
                {
                  "name": "CSS Styling & Flexbox",
                  "description": "Style the webpage using Flexbox layout."
                }
              ]
            }
          ]
        }
      ],
      "frameworks": ["React.js"],
      "technologies": ["Web APIs"],
      "tools": ["Git", "Chrome DevTools"],
      "courses": [
        "Udemy: The Complete Web Developer Bootcamp",
        "freeCodeCamp: Responsive Web Design"
      ],
      "documentation": [
        "https://developer.mozilla.org/en-US/docs/Web/HTML",
        "https://developer.mozilla.org/en-US/docs/Web/CSS"
      ],
      "books": [
        "HTML & CSS: Design and Build Websites by Jon Duckett"
      ],
      "real_world_projects": [
        "Build a Portfolio Website",
        "Develop a Blog Website"
      ],
      "interview_prep": [
        "What is the difference between block and inline elements?",
        "How does CSS specificity work?"
      ],
      "learning_sequence": [
        "Learn HTML first",
        "Then move to CSS",
        "After that, JavaScript"
      ],
      "youtube_channels": {
        "english": ["Traversy Media", "The Net Ninja", "Academind", "Programming with Mosh", "freeCodeCamp"],
        "hindi": ["CodeWithHarry", "Geeky Shows", "Great Learning", "Apna College", "Thapa Technical"],
        "tamil": ["Tamil Tech", "Codebinx", "Kaniyam Academy", "Programming in Tamil", "5 Minutes Engineering"]
      }
    }
  ],
  "intermediate": [...],
  "advanced": [...]
}
\`\`\`
Ensure JSON is **fully detailed** with no missing concepts.  
`;

        const response = await axios.post(
            "https://api.deepseek.com/v1/chat/completions",
            {
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "You are a career roadmap AI." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 8000
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        let rawContent = response.data.choices[0].message.content;

        // ✅ Log the raw AI response to check if it's valid JSON
        console.log("📝 Raw AI Response:", rawContent);

        // 🔹 Extract JSON content from AI response
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("❌ AI response does not contain valid JSON:", rawContent);
            throw new Error("No valid JSON found in AI response.");
        }

        const learningPath = JSON.parse(jsonMatch[0]); // ✅ Extracted JSON only
        console.log("📝 Extracted Learning Path:", learningPath);

        // ✅ Ensure AI returned valid structured data
        if (!learningPath.beginner?.length && !learningPath.intermediate?.length && !learningPath.advanced?.length) {
            console.error("❌ AI-generated learning path is empty! Check AI response.");
            throw new Error("AI returned an empty learning path.");
        }

        // 🔹 Save learning path to DB
        const newLearningPath = new LearningPath({
            userId,
            beginner: learningPath.beginner || [],
            intermediate: learningPath.intermediate || [],
            advanced: learningPath.advanced || []
        });

        await newLearningPath.save();

        console.log(`✅ Learning Path stored successfully for User ${userId}`);
        res.status(200).json(newLearningPath);
    } catch (error) {
        console.error("❌ Error fetching learning path:", error);
        res.status(500).json({ message: "Failed to generate learning path." });
    }
});

export default router;
