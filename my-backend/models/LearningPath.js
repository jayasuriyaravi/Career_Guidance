import mongoose from "mongoose";

// 🔹 Schema for Hands-on Projects (Practical exercises)
const HandsOnSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Name of the project/task
    description: { type: String, required: true } // Description of what to build
});

// 🔹 Schema for Subtopics (Each topic contains multiple subtopics)
const SubtopicSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Name of the subtopic
    hands_on: { type: [HandsOnSchema], default: [] } // List of hands-on projects for this subtopic
});

// 🔹 Schema for Topics (Each skill has multiple topics)
const TopicSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Topic name
    subtopics: { type: [SubtopicSchema], default: [] } // List of subtopics under this topic
});

// 🔹 Schema for Skills (Main learning entity)
const SkillSchema = new mongoose.Schema({
    skill: { type: String, required: true }, // Skill name (e.g., Frontend Development, Python)
    topics: { type: [TopicSchema], default: [] }, // Topics under this skill
    frameworks: { type: [String], default: [] }, // Frameworks & libraries (e.g., React.js, TensorFlow)
    technologies: { type: [String], default: [] }, // Technologies used (e.g., Web APIs, REST, Docker)
    tools: { type: [String], default: [] }, // Essential tools (e.g., Git, Chrome DevTools)
    courses: { type: [String], default: [] }, // Online courses (Udemy, Coursera, freeCodeCamp, etc.)
    documentation: { type: [String], default: [] }, // Official documentation links
    books: { type: [String], default: [] }, // Recommended books for deeper learning
    real_world_projects: { type: [String], default: [] }, // Industry-based real-world applications
    interview_prep: { type: [String], default: [] }, // Important interview questions for skill assessment
    learning_sequence: { type: [String], default: [] }, // Step-by-step order of learning
    youtube_channels: {
        english: { type: [String], default: [] }, // YouTube channels in English
        hindi: { type: [String], default: [] }, // YouTube channels in Hindi
        tamil: { type: [String], default: [] } // YouTube channels in Tamil
    }
});

// 🔹 Schema for Learning Path (User's personalized roadmap)
const LearningPathSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User
    beginner: { type: [SkillSchema], default: [] }, // Beginner-level skills
    intermediate: { type: [SkillSchema], default: [] }, // Intermediate-level skills
    advanced: { type: [SkillSchema], default: [] }, // Advanced-level skills
    createdAt: { type: Date, default: Date.now } // Timestamp of when the roadmap was created
});

// 🔹 Create Model
const LearningPath = mongoose.model("LearningPath", LearningPathSchema);

// 🔹 Export Model
export default LearningPath;
