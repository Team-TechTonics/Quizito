import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, CheckCircle, XCircle, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReviewCenter = () => {
    const navigate = useNavigate();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showExplanation, setShowExplanation] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);

    // Mock missed questions data - usually fetched from backend
    const missedQuestions = [
        {
            id: 1,
            question: "What is the time complexity of QuickSort in the worst case?",
            options: ["O(n log n)", "O(n)", "O(n^2)", "O(1)"],
            correctAnswer: 2,
            userAnswer: 0, // Mocking what the user got wrong previously
            explanation: "QuickSort degrades to O(n^2) when the pivot selection is poor (e.g., already sorted array)."
        },
        {
            id: 2,
            question: "Which hook is used for side effects in React?",
            options: ["useState", "useEffect", "useContext", "useReducer"],
            correctAnswer: 1,
            userAnswer: 3,
            explanation: "useEffect is designed specifically for handling side effects like data fetching or subscriptions."
        },
        {
            id: 3,
            question: "What is the output of 3 + '3' in JavaScript?",
            options: ["6", "'33'", "Nan", "Error"],
            correctAnswer: 1,
            userAnswer: 0,
            explanation: "JavaScript performs string concatenation when one operand is a string."
        }
    ];

    const currentQ = missedQuestions[currentQuestionIndex];

    const handleNext = () => {
        setShowExplanation(false);
        setSelectedOption(null);
        if (currentQuestionIndex < missedQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setCompleted(true);
        }
    };

    const handleSelect = (idx) => {
        setSelectedOption(idx);
        setShowExplanation(true);
    };

    if (completed) {
        return (
            <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Review Complete!</h2>
                    <p className="text-gray-600 mb-8">You've reviewed your mistakes. Great job reinforcing your knowledge!</p>
                    <button
                        onClick={() => navigate('/student/dashboard')}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <RefreshCw className="text-indigo-600" />
                            Review Center
                        </h1>
                        <p className="text-gray-500 text-sm">Reviewing {currentQuestionIndex + 1} of {missedQuestions.length} missed questions</p>
                    </div>
                    <div className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                        {Math.round(((currentQuestionIndex) / missedQuestions.length) * 100)}% Progress
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="p-8">
                        <span className="inline-block px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full mb-4">
                            Missed Previously
                        </span>
                        <h2 className="text-xl font-bold text-gray-800 mb-6 leading-relaxed">
                            {currentQ.question}
                        </h2>

                        <div className="space-y-3">
                            {currentQ.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => !showExplanation && handleSelect(idx)}
                                    disabled={showExplanation}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${showExplanation
                                        ? idx === currentQ.correctAnswer
                                            ? 'border-green-500 bg-green-50 text-green-800'
                                            : idx === selectedOption
                                                ? 'border-red-500 bg-red-50 text-red-800'
                                                : 'border-gray-100 opacity-50'
                                        : 'border-gray-100 hover:border-indigo-200 hover:bg-indigo-50'
                                        }`}
                                >
                                    <span className="font-medium">{opt}</span>
                                    {showExplanation && idx === currentQ.correctAnswer && <CheckCircle className="text-green-600" />}
                                    {showExplanation && idx === selectedOption && idx !== currentQ.correctAnswer && <XCircle className="text-red-500" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Explanation Footer */}
                    <AnimatePresence>
                        {showExplanation && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="bg-gray-50 border-t border-gray-100 p-6"
                            >
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                                            💡 Explanation
                                        </h4>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {currentQ.explanation}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleNext}
                                        className="self-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200"
                                    >
                                        Next <ArrowRight />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ReviewCenter;
