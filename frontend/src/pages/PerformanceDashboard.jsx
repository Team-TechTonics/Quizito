// frontend/src/pages/PerformanceDashboard.jsx
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Target, Award, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

const PerformanceDashboard = () => {
    const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPerformance();
    }, []);

    const fetchPerformance = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/adaptive/performance');
            if (response.data.success) {
                setPerformance(response.data.performance);
            }
        } catch (error) {
            console.error('Failed to fetch performance:', error);
            toast.error('Failed to load performance data');
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyLabel = (level) => {
        if (level < 0.33) return 'Beginner';
        if (level < 0.66) return 'Intermediate';
        return 'Advanced';
    };

    const getDifficultyColor = (level) => {
        if (level < 0.33) return 'from-green-500 to-emerald-500';
        if (level < 0.66) return 'from-yellow-500 to-orange-500';
        return 'from-red-500 to-pink-500';
    };

    const getTrendIcon = (trend) => {
        if (trend === 'improving') return <TrendingUp className="text-green-500" />;
        if (trend === 'declining') return <TrendingDown className="text-red-500" />;
        return <Minus className="text-gray-500" />;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your performance...</p>
                </div>
            </div>
        );
    }

    if (!performance) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No performance data yet. Start taking quizzes!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">Your Performance</h1>
                    <p className="text-gray-600 mt-2">Track your progress and adaptive difficulty level</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Accuracy */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                                <Target className="text-white" size={24} />
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-gray-800">{performance.accuracy}%</div>
                                <div className="text-gray-600">Accuracy</div>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                                style={{ width: `${performance.accuracy}%` }}
                            ></div>
                        </div>
                    </motion.div>

                    {/* Total Questions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                                <Award className="text-white" size={24} />
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-gray-800">{performance.totalQuestions}</div>
                                <div className="text-gray-600">Questions Answered</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Trend */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                                <Zap className="text-white" size={24} />
                            </div>
                            <div className="text-right">
                                <div className="flex items-center justify-end space-x-2 mb-1">
                                    {getTrendIcon(performance.recentTrend)}
                                    <span className="text-2xl font-bold text-gray-800 capitalize">
                                        {performance.recentTrend}
                                    </span>
                                </div>
                                <div className="text-gray-600">Recent Trend</div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Difficulty Level */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Current Difficulty Level</h2>

                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-lg font-semibold text-gray-700">
                                {getDifficultyLabel(performance.difficultyLevel)}
                            </span>
                            <span className="text-sm text-gray-600">
                                Level {Math.round(performance.difficultyLevel * 100)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                                className={`bg-gradient-to-r ${getDifficultyColor(performance.difficultyLevel)} h-4 rounded-full transition-all duration-500`}
                                style={{ width: `${performance.difficultyLevel * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-green-50 rounded-xl">
                            <div className="text-sm text-gray-600 mb-1">Beginner</div>
                            <div className="text-xs text-gray-500">0-33%</div>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-xl">
                            <div className="text-sm text-gray-600 mb-1">Intermediate</div>
                            <div className="text-xs text-gray-500">34-66%</div>
                        </div>
                        <div className="p-4 bg-red-50 rounded-xl">
                            <div className="text-sm text-gray-600 mb-1">Advanced</div>
                            <div className="text-xs text-gray-500">67-100%</div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                        <p className="text-sm text-gray-700">
                            <strong>How it works:</strong> Your difficulty level adjusts automatically based on your performance.
                            Answer correctly to increase difficulty, or struggle to make questions easier.
                            This ensures you're always challenged at the right level!
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PerformanceDashboard;
