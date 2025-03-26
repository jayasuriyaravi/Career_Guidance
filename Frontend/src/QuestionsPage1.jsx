import { useEffect, useState,navigate } from "react";
import { useLocation } from "react-router-dom";

import axios from "axios";
import { FaCheckCircle, FaTimesCircle, FaArrowLeft, FaArrowRight, FaClipboardList } from "react-icons/fa";
import "./QuestionsPage1.css";

function QuestionsPage() {
    const location = useLocation();

    // Retrieve userId and goal from state or localStorage
    const userId = location.state?.userId || localStorage.getItem("userId");
    const goal = location.state?.goal || localStorage.getItem("goal");

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/questions");
                console.log("API Response:", response.data);

                if (response.data && response.data.questions) {
                    const questionsData = parseQuestions(response.data.questions);
                    setQuestions(questionsData);
                } else {
                    setError("No questions data found.");
                }
            } catch (err) {
                console.error("Error fetching questions:", err);
                setError("Failed to load questions. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    // Parse the questions into the correct format
    const parseQuestions = (rawQuestions) => {
        return rawQuestions.map((item) => ({
            question: item.question,
            options: item.options.map(option => ({
                label: option.text.label,  // "A", "B", "C", "D"
                text: option.text.text     // The actual answer text
            })),
            correctAnswer: item.correct_answer, // "A", "B", "C", "D"
            explanation: item.explanation
        }));
    };

    const handleAnswerSelection = async (selectedOptionLabel) => {
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = selectedOptionLabel === currentQuestion.correctAnswer;

        setSelectedAnswers((prev) => ({
            ...prev,
            [currentQuestionIndex]: {
                selected: selectedOptionLabel,
                correct: currentQuestion.correctAnswer,
                isCorrect,
                explanation: currentQuestion.explanation
            }
        }));

        if (isCorrect) {
            setScore((prevScore) => prevScore + 1);
        }
    };


    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
        }
    };

    const handleSubmit = async () => {
        if (!userId) {
            alert("Error: User ID is missing. Please re-register.");
            return;
        }
        
        setShowScore(true);

        const formattedResponses = Object.keys(selectedAnswers).map(index => ({
            question: questions[index].question, // Fix: Get the actual question
            options: questions[index].options,  // Fix: Get options
            correctAnswer: questions[index].correctAnswer,
            userSelectedAnswer: selectedAnswers[index].selected,
            isCorrect: selectedAnswers[index].isCorrect,
            explanation: questions[index].explanation // Fix: Get explanation
        }));

        try {
            await axios.post("http://localhost:5000/api/store-response", {
                userId,
                goal,
                responses: formattedResponses,
                totalScore: score
            });
        } catch (error) {
            console.error("Error storing responses:", error);
        }
    };


    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="loading-text">Fetching questions... Please wait</p>
            </div>
        );
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="quiz-container">
            <h2 className="quiz-title">Skill Assessment</h2>

            {showScore ? (
                <div className="score-card">
                    <div className="score-header">
                        {score === questions.length ? (
                            <FaCheckCircle className="score-icon gold-trophy" />
                        ) : score >= questions.length / 2 ? (
                            <FaCheckCircle className="score-icon silver-trophy" />
                        ) : (
                            <FaTimesCircle className="score-icon fail-icon" />
                        )}
                        <h2>Assessment Completed!</h2>
                    </div>

                    <div className="score-details">
                        <p className="final-score">You Scored: <strong>{score} / {questions.length}</strong></p>
                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${(score / questions.length) * 100}%` }}></div>
                        </div>
                        <p className="score-message">
                            {score === questions.length ? "🏆 Excellent! You're a pro!" :
                                score >= questions.length / 2 ? "🔥 Great job! Keep improving!" :
                                    "💡 Don't worry! Keep learning and try again!"}
                        </p>
                    </div>

                    <button
                        className="btn-continue"
                        onClick={() => navigate("/skill-gap", { state: { userId, goal } })}
                    >
                        Continue to Skill Gap Analysis
                    </button>
                </div>
            ) : (
                questions.length > 0 && (
                    <div className="question-card">
                        <h4 className="question-text">{questions[currentQuestionIndex].question}</h4>

                        <ul className="options-list">
                            {questions[currentQuestionIndex].options.map((option, index) => {
                                const selected = selectedAnswers[currentQuestionIndex]?.selected === option.label;
                                const isCorrect = selectedAnswers[currentQuestionIndex]?.isCorrect;
                                const correctAnswer = selectedAnswers[currentQuestionIndex]?.correct;

                                return (
                                    <li key={index} className="option-item">
                                        <button
                                            className={`option-btn 
                                                ${selected ? (isCorrect ? "correct" : "incorrect") : ""} 
                                                ${!selected && correctAnswer === option.label ? "show-correct" : ""}
                                            `}
                                            onClick={() => handleAnswerSelection(option.label)}
                                            disabled={selectedAnswers[currentQuestionIndex]}
                                        >
                                            {option.label}. {option.text}
                                            {selected && isCorrect && <FaCheckCircle className="icon correct-icon" />}
                                            {selected && !isCorrect && <FaTimesCircle className="icon incorrect-icon" />}
                                            {!selected && correctAnswer === option.label && <FaCheckCircle className="icon correct-icon" />}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>

                        {selectedAnswers[currentQuestionIndex] && (
                            <div className="explanation-box">
                                <p><strong>Explanation:</strong> {selectedAnswers[currentQuestionIndex].explanation}</p>
                            </div>
                        )}

                        <div className="nav-buttons">
                            <button className="btn-nav" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                                <FaArrowLeft /> Previous
                            </button>
                            {currentQuestionIndex < questions.length - 1 ? (
                                <button className="btn-nav" onClick={handleNext}>
                                    Next <FaArrowRight />
                                </button>
                            ) : (
                                <button className="btn-submit" onClick={handleSubmit}>
                                    Submit
                                </button>
                            )}
                        </div>
                    </div>
                )
            )}
        </div>
    );
}

export default QuestionsPage;
