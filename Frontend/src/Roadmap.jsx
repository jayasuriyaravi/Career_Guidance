import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom"; // Add useNavigate
import { VerticalTimeline, VerticalTimelineElement } from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { FaBook, FaLaptopCode, FaRocket } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io"; // Change icon

const LearningPathRoadmap = () => {
    const location = useLocation();
    const navigate = useNavigate(); // For navigation
    const userId = location.state?.userId || localStorage.getItem("userId");

    const [learningPath, setLearningPath] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!userId) {
            setError("User ID is missing. Please log in again.");
            setLoading(false);
            return;
        }

        const fetchLearningPath = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/learning-path/${userId}`);
                setLearningPath(response.data);
            } catch (err) {
                setError("Failed to load learning path. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchLearningPath();
    }, [userId]);

    const handleSkillClick = (skill) => {
        navigate(`/roadmap/${skill.skill}`, { state: { skillData: skill } });
    };

    if (loading) return <p>Loading roadmap...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!learningPath) return <p>No learning path available.</p>;

    const renderTimelineElements = (level, icon, bgColor) =>
        learningPath[level]?.map((skill, index) => (
            <VerticalTimelineElement
                key={index}
                contentStyle={{ background: bgColor, color: "#fff" }}
                contentArrowStyle={{ borderRight: `7px solid ${bgColor}` }}
                date={level.toUpperCase()}
                iconStyle={{ background: bgColor, color: "#fff" }}
                icon={icon}
            >
                <div className="flex justify-between items-center cursor-pointer" onClick={() => handleSkillClick(skill)}>
                    <h3 className="text-lg font-bold">{skill.skill}</h3>
                    <IoIosArrowForward /> {/* Forward icon */}
                </div>
            </VerticalTimelineElement>
        ));

    return (
        <div>
            <h2 className="text-center text-2xl font-bold mb-6">📍 Personalized Learning Path Roadmap</h2>
            <VerticalTimeline>
                {renderTimelineElements("beginner", <FaBook />, "#1E90FF")}
                {renderTimelineElements("intermediate", <FaLaptopCode />, "#FF8C00")}
                {renderTimelineElements("advanced", <FaRocket />, "#DC143C")}
            </VerticalTimeline>
        </div>
    );
};

export default LearningPathRoadmap;
