import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Explicitly define _id
    name: { type: String, required: true },
    age: { type: Number, required: true },
    educationLevel: { type: String, required: true },
    careerStage: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    technicalSkills: [{ type: String }], // Array of skills
    goals: { type: String, required: true }, // Career goal
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);
export default User;
