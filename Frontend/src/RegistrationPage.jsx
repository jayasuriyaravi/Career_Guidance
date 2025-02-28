import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaTimes } from "react-icons/fa";
import "./RegistrationPage.css";

function RegistrationPage() {
    const [formData, setFormData] = useState({
        name: "",
        age: "",
        educationLevel: "",
        careerStage: "",
        fieldOfStudy: "",
        technicalSkills: [],
        goals: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [skillInput, setSkillInput] = useState("");

    const navigate = useNavigate();

    // Education level options
    const educationLevels = [
        "High School Diploma", "Associate Degree", "Bachelor's Degree",
        "Master's Degree", "PhD", "Diploma", "Certificate Course", "Self-Taught"
    ];

    // Career stage options
    const careerStages = [
        "Student", "Entry-Level Professional", "Mid-Level Professional",
        "Senior Professional", "Career Switcher", "Freelancer", "Entrepreneur"
    ];

    // IT-related fields of study
    const fieldsOfStudy = [
        "Computer Science", "Information Technology", "Software Engineering",
        "Cybersecurity", "Data Science", "Artificial Intelligence", "Machine Learning",
        "Cloud Computing", "Blockchain", "Networking", "Game Development",
        "Web Development", "Mobile App Development", "UI/UX Design"
    ];

    // IT career goals
    const careerGoals = [
        "Software Developer", "Data Scientist", "AI/ML Engineer",
        "Cloud Engineer", "Cybersecurity Specialist", "Blockchain Developer",
        "Game Developer", "Full-Stack Developer", "DevOps Engineer",
        "UI/UX Designer", "Mobile App Developer", "Network Engineer",
        "IT Consultant", "Database Administrator"
    ];

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle adding skills
    const handleAddSkill = (e) => {
        e.preventDefault();
        if (skillInput.trim() !== "" && !formData.technicalSkills.includes(skillInput.trim())) {
            setFormData({ ...formData, technicalSkills: [...formData.technicalSkills, skillInput.trim()] });
            setSkillInput("");
        }
    };

    // Handle removing a skill
    const handleRemoveSkill = (skillToRemove) => {
        setFormData({
            ...formData,
            technicalSkills: formData.technicalSkills.filter(skill => skill !== skillToRemove)
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Simple validation
        if (!formData.name || !formData.age) {
            setError("Name and age are required fields.");
            setLoading(false);
            return;
        }

        try {
            await axios.post("http://localhost:5000/api/register", formData);
            navigate("/questions");
        } catch (err) {
            console.error("Error during registration:", err);
            setError("Failed to register. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="registration-container">
            <h2 className="form-title">Register</h2>
            {error && <p className="error-message">{error}</p>}

            <form className="registration-form" onSubmit={handleSubmit}>
                {/* Name */}
                <label>Name:</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />

                {/* Age */}
                <label>Age:</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} required />

                {/* Education Level */}
                <label>Education Level:</label>
                <select name="educationLevel" value={formData.educationLevel} onChange={handleChange}>
                    <option value="">Select Education Level</option>
                    {educationLevels.map(level => <option key={level} value={level}>{level}</option>)}
                </select>

                {/* Career Stage */}
                <label>Career Stage:</label>
                <select name="careerStage" value={formData.careerStage} onChange={handleChange}>
                    <option value="">Select Career Stage</option>
                    {careerStages.map(stage => <option key={stage} value={stage}>{stage}</option>)}
                </select>

                {/* Field of Study */}
                <label>Field of Study:</label>
                <select name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleChange}>
                    <option value="">Select Field of Study</option>
                    {fieldsOfStudy.map(field => <option key={field} value={field}>{field}</option>)}
                </select>

                {/* Technical Skills (Multi-select) */}
                <label>Technical Skills:</label>
                <div className="skill-input-container">
                    <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        placeholder="Type a skill and press Add"
                    />
                    <button className="add-skill-btn" onClick={handleAddSkill}>Add</button>
                </div>

                <div className="skill-list">
                    {formData.technicalSkills.map(skill => (
                        <span key={skill} className="skill-tag">
                            {skill} <FaTimes className="remove-skill" onClick={() => handleRemoveSkill(skill)} />
                        </span>
                    ))}
                </div>

                {/* Career Goal */}
                <label>Career Goal:</label>
                <select name="goals" value={formData.goals} onChange={handleChange}>
                    <option value="">Select Your Career Goal</option>
                    {careerGoals.map(goal => <option key={goal} value={goal}>{goal}</option>)}
                </select>

                <button type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>
        </div>
    );
}

export default RegistrationPage;
