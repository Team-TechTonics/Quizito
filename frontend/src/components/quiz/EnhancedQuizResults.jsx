// src/components/quiz/EnhancedQuizResults.jsx
import { motion } from 'framer-motion';
import {
    Trophy,
    Clock,
    Target,
    TrendingUp,
    Award,
    Star,
    ArrowRight,
    RotateCcw,
    Share2,
    Download
} from 'lucide-react';
import { Link } from 'react-router-dom';

const EnhancedQuizResults = ({
    quiz,
    score,
    totalQuestions,
    correctAnswers,
    timeSpent,
    pointsEarned,
    answers,
    onReview,
    onRetake
}) => {
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    const getPerformanceLevel = (percent) => {
        if (percent >= 90) return { label: 'Excellent!', color: 'text-green-600', emoji: '🎉' };
        if (percent >= 75) return { label: 'Great Job!', color: 'text-blue-600', emoji: '👏' };
        if (percent >= 60) return { label: 'Good Effort!', color: 'text-amber-600', emoji: '👍' };
        return { label: 'Keep Practicing!', color: 'text-red-600', emoji: '💪' };
    };

    const performance = getPerformanceLevel(percentage);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Mock data for strengths/weaknesses
    const strengths = ['Mathematics', 'Logic'];
    const weaknesses = ['History', 'Geography'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
            <div className="container mx-auto max-w-4xl">

                {/* Celebration Animation */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                    className="text-center mb-8"
                >
                    <div className="text-8xl mb-4">{performance.emoji}</div>
                    <h1 className="text-5xl font-bold text-gray-800 mb-2">Quiz Complete!</h1>
                    <p className={`text-3xl font-bold ${performance.color}`}>{performance.label}</p>
                </motion.div>

                {/* Score Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-6 text-white">
                        <h2 className="text-2xl font-bold">{quiz.title}</h2>
                    </div>

                    {/* Main Score */}
                    <div className="p-8 text-center">
                        <div className="mb-8">
                            <div className="text-7xl font-bold text-indigo-600 mb-2">{percentage}%</div>
                            <div className="flex items-center justify-center space-x-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={32}
                                        className={i < Math.floor(percentage / 20) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                            <div className="p-6 bg-green-50 rounded-2xl">
                                <Target className="mx-auto mb-3 text-green-600" size={32} />
                                <p className="text-3xl font-bold text-green-600">{correctAnswers}/{totalQuestions}</p>
                                <p className="text-sm text-gray-600 mt-1">Correct</p>
                            </div>
                            <div className="p-6 bg-blue-50 rounded-2xl">
                                <Clock className="mx-auto mb-3 text-blue-600" size={32} />
                                <p className="text-3xl font-bold text-blue-600">{formatTime(timeSpent)}</p>
                                <p className="text-sm text-gray-600 mt-1">Time</p>
                            </div>
                            <div className="p-6 bg-amber-50 rounded-2xl">
                                <TrendingUp className="mx-auto mb-3 text-amber-600" size={32} />
                                <p className="text-3xl font-bold text-amber-600">{percentage}%</p>
                                <p className="text-sm text-gray-600 mt-1">Accuracy</p>
                            </div>
                            <div className="p-6 bg-purple-50 rounded-2xl">
                                <Award className="mx-auto mb-3 text-purple-600" size={32} />
                                <p className="text-3xl font-bold text-purple-600">{pointsEarned}</p>
                                <p className="text-sm text-gray-600 mt-1">Points</p>
                            </div>
                        </div>

                        {/* Performance Breakdown */}
                        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Performance Analysis</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold text-green-600 mb-2 flex items-center">
                                        <Trophy size={18} className="mr-2" />
                                        Strengths
                                    </h4>
                                    <ul className="space-y-1">
                                        {strengths.map((strength, i) => (
                                            <li key={i} className="text-gray-700 flex items-center">
                                                <span className="text-green-500 mr-2">✓</span>
                                                {strength}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-amber-600 mb-2 flex items-center">
                                        <TrendingUp size={18} className="mr-2" />
                                        Areas to Improve
                                    </h4>
                                    <ul className="space-y-1">
                                        {weaknesses.map((weakness, i) => (
                                            <li key={i} className="text-gray-700 flex items-center">
                                                <span className="text-amber-500 mr-2">→</span>
                                                {weakness}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid md:grid-cols-3 gap-4">
                            <button
                                onClick={onReview}
                                className="flex items-center justify-center space-x-2 px-6 py-4 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors font-semibold"
                            >
                                <Target size={20} />
                                <span>Review Answers</span>
                            </button>
                            <button
                                onClick={onRetake}
                                className="flex items-center justify-center space-x-2 px-6 py-4 border-2 border-indigo-500 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors font-semibold"
                            >
                                <RotateCcw size={20} />
                                <span>Retake Quiz</span>
                            </button>
                            <button
                                className="flex items-center justify-center space-x-2 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                            >
                                <Share2 size={20} />
                                <span>Share</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Next Steps */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                >
                    <h3 className="text-xl font-bold text-gray-800 mb-4">What's Next?</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Link
                            to="/explore"
                            className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                        >
                            <div>
                                <p className="font-semibold text-gray-800">Explore More Quizzes</p>
                                <p className="text-sm text-gray-600">Find similar topics</p>
                            </div>
                            <ArrowRight className="text-gray-400" size={20} />
                        </Link>
                        <Link
                            to="/student/dashboard"
                            className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                        >
                            <div>
                                <p className="font-semibold text-gray-800">View Progress</p>
                                <p className="text-sm text-gray-600">Track your learning</p>
                            </div>
                            <ArrowRight className="text-gray-400" size={20} />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default EnhancedQuizResults;
