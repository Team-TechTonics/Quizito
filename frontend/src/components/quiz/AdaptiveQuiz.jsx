import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, Activity, Check, X, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const AdaptiveQuiz = () => {
    const { topicId } = useParams();
    const navigate = useNavigate();

    // Adaptive State
    const [difficulty, setDifficulty] = useState('medium'); // easy, medium, hard
    const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
    const [consecutiveWrong, setConsecutiveWrong] = useState(0);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [feedback, setFeedback] = useState(null); // correct, incorrect

    // Mock Question Bank (In real app, fetch based on difficulty)
    const questionBank = {
        easy: [
            { id: 'e1', text: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correct: 1 },
            { id: 'e2', text: 'Output of print("Hello")?', options: ['Hello', 'Error', 'Print', 'None'], correct: 0 },
            { id: 'e3', text: 'Which is a boolean?', options: ['"True"', '1', 'True', 'None'], correct: 2 },
        ],
        medium: [
            { id: 'm1', text: 'What is 15 * 12?', options: ['170', '180', '190', '200'], correct: 1 },
            { id: 'm2', text: 'Time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n^2)', 'O(1)'], correct: 1 },
            { id: 'm3', text: 'Which is mutable in Python?', options: ['Tuple', 'String', 'List', 'Integer'], correct: 2 },
        ],
        hard: [
            { id: 'h1', text: 'Derivative of x^2?', options: ['x', '2x', '2', 'x^2'], correct: 1 },
            { id: 'h2', text: 'Worst case of QuickSort?', options: ['O(n log n)', 'O(n)', 'O(n^2)', 'O(log n)'], correct: 2 },
            { id: 'h3', text: 'What is a closure?', options: ['Function with retained scope', 'Class destructor', 'Loop termination', 'Database lock'], correct: 0 },
        ]
    };

    const [currentQuestion, setCurrentQuestion] = useState(questionBank.medium[0]);

    // Adjust difficulty based on performance
    useEffect(() => {
        if (consecutiveCorrect >= 2 && difficulty !== 'hard') {
            setDifficulty('hard');
            setConsecutiveCorrect(0);
            toast.success('Level Up! Difficulty Increased 🌶️', { icon: '🔥' });
        } else if (consecutiveWrong >= 2 && difficulty !== 'easy') {
            setDifficulty('easy');
            setConsecutiveWrong(0);
            toast('Let\'s try something easier.', { icon: '📉' });
        }
    }, [consecutiveCorrect, consecutiveWrong, difficulty]);

    // Load new question when index or difficulty changes (simplified)
    useEffect(() => {
        const questions = questionBank[difficulty];
        // Simple modulo to loop or pick random
        const q = questions[questionIndex % questions.length];
        setCurrentQuestion(q);
    }, [difficulty, questionIndex]);

    const handleAnswer = (optionIdx) => {
        const isCorrect = optionIdx === currentQuestion.correct;

        setFeedback(isCorrect ? 'correct' : 'incorrect');

        if (isCorrect) {
            setScore(s => s + (difficulty === 'hard' ? 30 : difficulty === 'medium' ? 20 : 10));
            setConsecutiveCorrect(c => c + 1);
            setConsecutiveWrong(0);
        } else {
            setConsecutiveCorrect(0);
            setConsecutiveWrong(w => w + 1);
        }

        setTimeout(() => {
            setFeedback(null);
            if (questionIndex >= 8) { // End after 9 questions for demo
                setShowResult(true);
            } else {
                setQuestionIndex(i => i + 1);
            }
        }, 1500);
    };

    if (showResult) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Session Complete!</h2>
                    <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 mb-6">
                        {score} XP
                    </div>
                    <p className="text-gray-600 mb-8">You successfully adapted to the challenge.</p>
                    <button
                        onClick={() => navigate('/student/dashboard')}
                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
            <div className="max-w-2xl w-full">

                {/* Top Stats Bar */}
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 flex justify-between items-center border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 ${difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                            <Activity />
                            {difficulty}
                        </div>
                        <span className="text-sm font-bold text-gray-500">Q{questionIndex + 1}</span>
                    </div>
                    <div className="text-xl font-black text-gray-800">
                        {score} <span className="text-xs text-gray-400 font-normal">XP</span>
                    </div>
                </div>

                {/* Question Card */}
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={questionIndex + difficulty}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 relative"
                    >
                        {/* Feedback Overlay */}
                        {feedback && (
                            <div className={`absolute inset-0 z-10 flex items-center justify-center bg-opacity-90 backdrop-blur-sm transition-colors ${feedback === 'correct' ? 'bg-green-50' : 'bg-red-50'
                                }`}>
                                <motion.div
                                    initial={{ scale: 0.5 }}
                                    animate={{ scale: 1 }}
                                    className={`flex flex-col items-center ${feedback === 'correct' ? 'text-green-600' : 'text-red-500'
                                        }`}
                                >
                                    {feedback === 'correct' ? <Check size={64} /> : <X size={64} />}
                                    <span className="text-2xl font-bold mt-2">
                                        {feedback === 'correct' ? 'Correct!' : 'Incorrect'}
                                    </span>
                                </motion.div>
                            </div>
                        )}

                        <div className="p-8 md:p-10">
                            <h2 className="text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
                                {currentQuestion?.text}
                            </h2>

                            <div className="grid gap-4">
                                {currentQuestion?.options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(idx)}
                                        disabled={!!feedback}
                                        className="group flex items-center p-4 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                                    >
                                        <span className="w-8 h-8 flex items-center justify-center bg-gray-100 group-hover:bg-blue-200 rounded-lg text-sm font-bold text-gray-600 group-hover:text-blue-700 mr-4 transition-colors">
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        <span className="font-semibold text-gray-700 group-hover:text-blue-900">
                                            {opt}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                <p className="text-center text-gray-400 text-sm mt-6">
                    Correct answers increase difficulty & rewards • Incorrect answers lower difficulty
                </p>
            </div>
        </div>
    );
};

export default AdaptiveQuiz;
