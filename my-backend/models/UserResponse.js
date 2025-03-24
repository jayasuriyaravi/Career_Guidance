import mongoose from "mongoose";

const UserResponseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference User model
    responses: [
        {
            question: { type: String, required: true },
            options: [{ label: String, text: String }], // MCQ options
            correctAnswer: { type: String, required: true }, // Correct answer (A, B, C, D)
            userSelectedAnswer: { type: String, required: true }, // User’s selected answer
            isCorrect: { type: Boolean, required: true }, // Correct or not?
            explanation: { type: String, required: true } // Explanation for learning
        }
    ],
    totalScore: { type: Number, required: true }, // Total score after the test
    timestamp: { type: Date, default: Date.now } // Time of response submission
});

const UserResponse = mongoose.model("UserResponse", UserResponseSchema);
export default UserResponse;
