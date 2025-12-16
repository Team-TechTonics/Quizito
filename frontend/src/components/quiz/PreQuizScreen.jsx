// src/components/quiz/PreQuizScreen.jsx
import { useState, useEffect } from 'react';
import { Clock, BookOpen, BarChart3, Award, Play, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const PreQuizScreen = ({ quiz, onStart }) => {
    const [countdown, setCountdown] = useState(null);
    const [isReady, setIsReady] = useState(false);

    const {
        title,
        description,
        questions = [],
        difficulty,
        duration,
        category
    } = quiz;

    const getDifficultyColor = (diff) => {
        switch (diff?.toLowerCase()) {
            case 'easy': return 'text-green-600 bg-green-100';
            case 'medium': return 'text-amber-600 bg-amber-100';
            case 'hard': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const handleStartClick = () => {
        setIsReady(true);
        setCountdown(3);
    };

    useEffect(() => {
        if (countdown === null) return;

        if (countdown === 0) {
            onStart();
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(countdown - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, onStart]);

    if (countdown !== null) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-center"
                >
                    <motion.div
                        key={countdown}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="text-white text-9xl font-bold mb-4"
                    >
                        {countdown === 0 ? 'GO!' : countdown}
                    </motion.div>
                    <p className="text-white text-2xl">Get ready...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-8 text-white">
                    <div className="text-center">
                        <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-semibold mb-4">
                            {category || 'Quiz'}
                        </span>
                        <h1 className="text-4xl font-bold mb-3">{title}</h1>
                        {description && (
                            <p className="text-white/90 text-lg max-w-2xl mx-auto">{description}</p>
                        )}
                    </div>
                </div>

                {/* Quiz Info */}
                <div className="p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                        <div className="text-center p-6 bg-blue-50 rounded-2xl">
                            <BookOpen className="mx-auto mb-3 text-blue-600" size={32} />
                            <p className="text-3xl font-bold text-blue-600">{questions.length}</p>
                            <p className="text-sm text-gray-600 mt-1">Questions</p>
                        </div>
                        <div className="text-center p-6 bg-green-50 rounded-2xl">
                            <Clock className="mx-auto mb-3 text-green-600" size={32} />
                            <p className="text-3xl font-bold text-green-600">{duration || 15}</p>
                            <p className="text-sm text-gray-600 mt-1">Minutes</p>
                        </div>
                        <div className="text-center p-6 bg-amber-50 rounded-2xl">
                            <BarChart3 className="mx-auto mb-3 text-amber-600" size={32} />
                            <p className={`text-lg font-bold px-3 py-1 rounded-full inline-block ${getDifficultyColor(difficulty)}`}>
                                {difficulty || 'Medium'}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">Difficulty</p>
                        </div>
                        <div className="text-center p-6 bg-purple-50 rounded-2xl">
                            <Award className="mx-auto mb-3 text-purple-600" size={32} />
                            <p className="text-3xl font-bold text-purple-600">{questions.length * 10}</p>
                            <p className="text-sm text-gray-600 mt-1">Max Points</p>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                        <div className="flex items-start space-x-3 mb-4">
                            <Info className="text-indigo-600 flex-shrink-0 mt-1" size={24} />
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-3">Instructions</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li className="flex items-start">
                                        <span className="text-indigo-600 mr-2">•</span>
                                        <span>Answer all questions to the best of your ability</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-indigo-600 mr-2">•</span>
                                        <span>You can navigate between questions using the sidebar</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-indigo-600 mr-2">•</span>
                                        <span>Bookmark difficult questions to review later</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-indigo-600 mr-2">•</span>
                                        <span>Hints are available but will reduce your score</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-indigo-600 mr-2">•</span>
                                        <span>Submit your quiz when you're done to see results</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Start Button */}
                    <div className="text-center">
                        <button
                            onClick={handleStartClick}
                            className="group bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-12 py-4 rounded-2xl font-bold text-xl hover:shadow-2xl transition-all flex items-center space-x-3 mx-auto"
                        >
                            <Play size={24} />
                            <span>Start Quiz</span>
                            <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                                →
                            </motion.div>
                        </button>
                        <p className="text-sm text-gray-500 mt-4">
                            Click to begin • Good luck! 🍀
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PreQuizScreen;
