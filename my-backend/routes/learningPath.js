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

        // 🔹 Check if learning path exists in DB
        let existingPath = await LearningPath.findOne({ userId });
        if (existingPath) {
            console.log(`✅ Returning stored Learning Path for User ${userId}. Beginner topics: ${existingPath.beginner.length}, Intermediate: ${existingPath.intermediate.length}, Advanced: ${existingPath.advanced.length}`);
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
You are an **AI-powered career roadmap generator**. Your job is to create a **fully structured and step-by-step learning plan** based on the user's career goal and skill gap analysis.

### **User's Goal:** ${user.goals}

### **User's Weak Skills:** ${JSON.stringify(skillGap.weakSkills.length > 0 ? skillGap.weakSkills : "None")}
### **User's Missing Skills:** ${JSON.stringify(skillGap.missingSkills.length > 0 ? skillGap.missingSkills : "None")}
### **Industry Skills:** ${JSON.stringify(skillGap.industrySkills.length > 0 ? skillGap.industrySkills : "None")}

If weak/missing skills are **empty**, generate a **complete roadmap from scratch** covering all necessary topics.  

### **Instructions:**
1️⃣ **Break the roadmap into three levels:** **Beginner → Intermediate → Advanced**  
2️⃣ **For each level, generate a structured learning plan:**
   - **Skills required for this level**
   - **Topics to master within each skill**
   - **Subtopics under each topic**
   - **Hands-on projects for every subtopic**
   - **Frameworks, libraries & tools to use**
   - **Technologies relevant to the skill**
   - **Courses & learning resources**
   - **Step-by-step learning sequence** (What to learn first, second, third…)
   - **Top YouTube channels** for this skill in **English, Hindi, and Tamil**.

3️⃣ **Personalization Rules:**
- If a skill is in **Missing Skills**, **prioritize it early in the roadmap**.
- If a skill is in **Weak Skills**, **provide reinforcement exercises & hands-on practice**.
- If a skill is in **Industry Skills** but missing, **ensure it is covered in detail**.

---

### **Output Format (JSON Structure)**:
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
              "hands_on": "Build a simple webpage using HTML tags"
            },
            {
              "name": "CSS Styling & Flexbox",
              "hands_on": "Style the webpage using CSS & Flexbox"
            }
          ]
        }
      ],
      "frameworks": ["React.js"],
      "libraries": ["Bootstrap", "Tailwind CSS"],
      "technologies": ["Web APIs"],
      "courses": ["Udemy: Web Development Bootcamp"],
      "learning_sequence": ["Learn HTML first", "Then move to CSS", "After that, JavaScript"],
      "youtube_channels": {
        "english": ["Traversy Media", "The Net Ninja", "Academind"],
        "hindi": ["CodeWithHarry", "Geeky Shows", "Great Learning"],
        "tamil": ["Tamil Tech", "5 Minutes Engineering", "Kaniyam Academy"]
      }
    }
  ],
  "intermediate": [...],
  "advanced": [...]
}
\`\`\`
Ensure JSON is **correctly formatted** and **not empty**.
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
                max_tokens: 6000
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
        // 🔹 Save learning path to DB (Storing beginner, intermediate, and advanced separately)
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
