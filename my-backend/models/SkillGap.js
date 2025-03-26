import mongoose from "mongoose";

const SkillGapSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the User
    industrySkills: [{ type: String }], // Industry-required skills
    missingSkills: [{ type: String }], // Skills the user lacks
    weakSkills: [{ type: String }], // Skills the user is weak in
    createdAt: { type: Date, default: Date.now }, // Timestamp for tracking
    updatedAt: { type: Date, default: Date.now } // Last updated timestamp
});

// Middleware to update `updatedAt` field before saving
SkillGapSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

const SkillGap = mongoose.model("SkillGap", SkillGapSchema);
export default SkillGap;
