import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { FaLightbulb, FaCheckCircle, FaTimesCircle, FaArrowLeft } from "react-icons/fa";
import "./SkillGapPage.css";

// ✅ Custom Typing Effect (Stops After Full Sentence)
const TypingEffect = ({ text, speed = 50 }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + text[index]);
                setIndex(index + 1);
            }, speed);
            return () => clearTimeout(timeout);
        }
    }, [index, text, speed]);

    return <span>{displayedText}</span>;
};

function SkillGapPage() {
    const location = useLocation();
    const userId = location.state?.userId || localStorage.getItem("userId");

    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSkillGapAnalysis = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/skill-gap-analysis/${userId}`);
                setAnalysis(response.data);
            } catch (err) {
                console.error("Error fetching skill gap analysis:", err);
                setError("Failed to load skill gap analysis. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchSkillGapAnalysis();
    }, [userId]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="loading-text">Analyzing your skill gaps... Please wait</p>
            </div>
        );
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="skill-gap-container">
            <h2 className="skill-gap-title">📊 Skill Gap Analysis</h2>

            {analysis && (
                <div className="skill-gap-results">
                    {/* ✅ Industry Skills */}
                    <div className="skill-section">
                        <h3 className="skill-title">
                            <FaLightbulb className="icon" /> Latest Industry Skills
                        </h3>
                        <TypingEffect text={analysis.industrySkills.join(", ")} speed={50} />
                    </div>

                    {/* ✅ Missing Skills */}
                    <div className="skill-section">
                        <h3 className="skill-title">
                            <FaTimesCircle className="icon red" /> Missing Skills
                        </h3>
                        {analysis.missingSkills.length > 0 ? (
                            <TypingEffect text={analysis.missingSkills.join(", ")} speed={50} />
                        ) : (
                            <p className="no-gap">🎉 No missing skills found! Great job!</p>
                        )}
                    </div>

                    {/* ✅ Weak Skills */}
                    <div className="skill-section">
                        <h3 className="skill-title">
                            <FaCheckCircle className="icon yellow" /> Weak Skills (Based on Assessment)
                        </h3>
                        {analysis.weakSkills.length > 0 ? (
                            <TypingEffect text={analysis.weakSkills.join(", ")} speed={50} />
                        ) : (
                            <p className="no-gap">🎯 No weak skills detected! Well done!</p>
                        )}
                    </div>
                </div>
            )}

            {/* 🔹 Back to Dashboard Button */}
            <button className="btn-back" onClick={() => window.location.href = "/"}>
                <FaArrowLeft /> Back to Dashboard
            </button>
        </div>
    );
}

export default SkillGapPage;
