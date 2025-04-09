import { useLocation } from "react-router-dom";
import { VerticalTimeline, VerticalTimelineElement } from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { FaCode, FaCogs, FaTools, FaBook, FaProjectDiagram, FaChalkboardTeacher, FaYoutube, FaLaptopCode } from "react-icons/fa";

const SkillRoadmap = () => {
    const location = useLocation();
    const skillData = location.state?.skillData;

    if (!skillData) {
        return <p>No skill data available.</p>;
    }

    const renderList = (title, items) =>
        items.length > 0 ? (
            <div className="mt-3">
                <h4 className="font-semibold">{title}</h4>
                <ul className="list-disc pl-4">
                    {items.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </div>
        ) : null;

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-3xl font-bold text-center mb-6">📌 {skillData.skill} Roadmap</h2>
            <VerticalTimeline>
                {skillData.topics.map((topic, index) => (
                    <>
                        {/* 📖 Subtopics to Learn */}
                        <VerticalTimelineElement
                            key={`subtopics-${index}`}
                            contentStyle={{ background: "#4CAF50", color: "#fff" }}
                            contentArrowStyle={{ borderRight: "7px solid #4CAF50" }}
                            date={topic.name}
                            iconStyle={{ background: "#4CAF50", color: "#fff" }}
                            icon={<FaCode />}
                        >   
                            <h3 className="text-lg font-bold">{topic.name}</h3>
                            <h3 className="text-lg font-bold">📖 Subtopics to Learn</h3>
                            <ul className="list-disc pl-4">
                                {topic.subtopics.map((subtopic, subIndex) => (
                                    <li key={subIndex}>
                                        <strong>{subtopic.name}</strong>
                                    </li>
                                ))}
                            </ul>
                        </VerticalTimelineElement>

                        {/* 🛠️ Hands-on Exercises (Only if available) */}
                        {topic.subtopics.some(sub => sub.hands_on.length > 0) && (
                            <VerticalTimelineElement
                                key={`hands-on-${index}`}
                                contentStyle={{ background: "#FFC107", color: "#fff" }}
                                contentArrowStyle={{ borderRight: "7px solid #FFC107" }}
                                iconStyle={{ background: "#FFC107", color: "#fff" }}
                                icon={<FaTools />}
                            >
                                <h3 className="text-lg font-bold">🛠️ Hands-on Exercises</h3>
                                {topic.subtopics.map((subtopic, subIndex) =>
                                    subtopic.hands_on.length > 0 ? (
                                        <div key={subIndex} className="mt-2">
                                            <h4 className="font-semibold">{subtopic.name}</h4>
                                            <ul className="list-disc pl-4">
                                                {subtopic.hands_on.map((handsOn, i) => (
                                                    <li key={i}>
                                                        <strong>{handsOn.name}:</strong> {handsOn.description}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : null
                                )}
                            </VerticalTimelineElement>
                        )}
                    </>
                ))}

                {/* Frameworks & Libraries */}
                <VerticalTimelineElement
                    contentStyle={{ background: "#2196F3", color: "#fff" }}
                    contentArrowStyle={{ borderRight: "7px solid #2196F3" }}
                    iconStyle={{ background: "#2196F3", color: "#fff" }}
                    icon={<FaCogs />}
                >
                    <h3 className="text-lg font-bold">Frameworks & Libraries</h3>
                    {renderList("Popular Frameworks", skillData.frameworks)}
                </VerticalTimelineElement>

                {/* Technologies & Tools */}
                <VerticalTimelineElement
                    contentStyle={{ background: "#673AB7", color: "#fff" }}
                    contentArrowStyle={{ borderRight: "7px solid #673AB7" }}
                    iconStyle={{ background: "#673AB7", color: "#fff" }}
                    icon={<FaTools />}
                >
                    <h3 className="text-lg font-bold">Technologies & Tools</h3>
                    {renderList("Technologies", skillData.technologies)}
                    {renderList("Essential Tools", skillData.tools)}
                </VerticalTimelineElement>

                {/* Learning Resources */}
                <VerticalTimelineElement
                    contentStyle={{ background: "#FF9800", color: "#fff" }}
                    contentArrowStyle={{ borderRight: "7px solid #FF9800" }}
                    iconStyle={{ background: "#FF9800", color: "#fff" }}
                    icon={<FaBook />}
                >
                    <h3 className="text-lg font-bold">Learning Resources</h3>
                    {renderList("Online Courses", skillData.courses)}
                    {renderList("Recommended Books", skillData.books)}
                    {renderList("Official Documentation", skillData.documentation)}
                </VerticalTimelineElement>

                {/* Real-World Projects */}
                <VerticalTimelineElement
                    contentStyle={{ background: "#E91E63", color: "#fff" }}
                    contentArrowStyle={{ borderRight: "7px solid #E91E63" }}
                    iconStyle={{ background: "#E91E63", color: "#fff" }}
                    icon={<FaProjectDiagram />}
                >
                    <h3 className="text-lg font-bold">Real-World Projects</h3>
                    {renderList("Industry-Based Applications", skillData.real_world_projects)}
                </VerticalTimelineElement>

                {/* Interview Preparation */}
                <VerticalTimelineElement
                    contentStyle={{ background: "#009688", color: "#fff" }}
                    contentArrowStyle={{ borderRight: "7px solid #009688" }}
                    iconStyle={{ background: "#009688", color: "#fff" }}
                    icon={<FaChalkboardTeacher />}
                >
                    <h3 className="text-lg font-bold">Interview Preparation</h3>
                    {renderList("Important Interview Questions", skillData.interview_prep)}
                </VerticalTimelineElement>

                {/* YouTube Channels */}
                <VerticalTimelineElement
                    contentStyle={{ background: "#FF5722", color: "#fff" }}
                    contentArrowStyle={{ borderRight: "7px solid #FF5722" }}
                    iconStyle={{ background: "#FF5722", color: "#fff" }}
                    icon={<FaYoutube />}
                >
                    <h3 className="text-lg font-bold">YouTube Channels</h3>
                    {renderList("English Channels", skillData.youtube_channels?.english || [])}
                    {renderList("Hindi Channels", skillData.youtube_channels?.hindi || [])}
                    {renderList("Tamil Channels", skillData.youtube_channels?.tamil || [])}
                </VerticalTimelineElement>

                {/* Learning Sequence */}
                <VerticalTimelineElement
                    contentStyle={{ background: "#795548", color: "#fff" }}
                    contentArrowStyle={{ borderRight: "7px solid #795548" }}
                    iconStyle={{ background: "#795548", color: "#fff" }}
                    icon={<FaLaptopCode />}
                >
                    <h3 className="text-lg font-bold">Learning Sequence</h3>
                    {renderList("Step-by-Step Learning", skillData.learning_sequence)}
                </VerticalTimelineElement>
            </VerticalTimeline>
        </div>
    );
};

export default SkillRoadmap;
