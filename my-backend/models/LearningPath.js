import mongoose from "mongoose";

// 🔹 Schema for Subtopics (Each topic can have multiple subtopics)
const SubtopicSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Name of the subtopic
    hands_on: { type: String, required: true } // Hands-on project for this subtopic
});

// 🔹 Schema for Topics (Each skill has multiple topics)
const TopicSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Topic name
    subtopics: { type: [SubtopicSchema], default: [] } // List of subtopics
});

// 🔹 Schema for Skills (Main learning entity)
const SkillSchema = new mongoose.Schema({
    skill: { type: String, required: true }, // Skill name (e.g., Frontend Development)
    topics: { type: [TopicSchema], default: [] }, // Topics under this skill
    frameworks: { type: [String], default: [] }, // Frameworks & libraries used (e.g., React.js)
    technologies: { type: [String], default: [] }, // Technologies used (e.g., Web APIs)
    courses: { type: [String], default: [] }, // Learning resources (Udemy, Coursera, etc.)
    learning_sequence: { type: [String], default: [] }, // Step-by-step learning order
    youtube_channels: {
        english: { type: [String], default: [] }, // English YouTube channels
        hindi: { type: [String], default: [] }, // Hindi YouTube channels
        tamil: { type: [String], default: [] } // Tamil YouTube channels
    }
});

// 🔹 Schema for Learning Path (User's roadmap)
const LearningPathSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User reference
    beginner: { type: [SkillSchema], default: [] }, // Beginner-level skills
    intermediate: { type: [SkillSchema], default: [] }, // Intermediate-level skills
    advanced: { type: [SkillSchema], default: [] }, // Advanced-level skills
    createdAt: { type: Date, default: Date.now } // Timestamp of creation
});

// 🔹 Create Model
const LearningPath = mongoose.model("LearningPath", LearningPathSchema);

// 🔹 Export Model
export default LearningPath;
