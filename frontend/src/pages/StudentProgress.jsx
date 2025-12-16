// src/pages/StudentProgress.jsx
import { useState, useEffect } from 'react';
import {
    TrendingUp,
    Award,
    Clock,
    Target,
    BookOpen,
    Flame,
    Trophy,
    Star,
    Calendar,

    Loader,
    Target as TargetIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

import { progressService } from '../services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Fallback data structure to ensure UI doesn't crash if API returns partial data
const defaultData = {
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    streak: 0,
    totalQuizzes: 0,
    averageScore: 0,
    studyStats: {
        totalTime: 0,
        longestStreak: 0,
        avgDuration: 0
    },
    scoreHistory: [],
    subjectRadar: [],
    timeByCategory: [],
    performanceBySubject: {},
    strengths: [],
    weaknesses: [],
    achievements: []
};

// Mock Data for Radar Chart - Knowledge Gap
const performanceData = [
    { subject: 'Math', A: 120, fullMark: 150 },
    { subject: 'Science', A: 98, fullMark: 150 },
    { subject: 'English', A: 86, fullMark: 150 },
    { subject: 'History', A: 99, fullMark: 150 },
    { subject: 'Physics', A: 85, fullMark: 150 },
    { subject: 'Geography', A: 65, fullMark: 150 },
];

const StudentProgress = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                // Determine userId - if user object has id or _id
                const userId = user.id || user._id;
                const progressData = await progressService.getStudentProgress(userId);
                setData({ ...defaultData, ...progressData });
            } catch (error) {
                console.error('Failed to fetch progress:', error);

                // If API fails, we might want to show empty state or fallback to mock for demo
                // For now, let's show default empty state but notify user
                toast.error('Failed to load progress data');
                setData(defaultData);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <Loader className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    if (!data) return null;

    const progressPercentage = data.xpToNextLevel > 0
        ? Math.min((data.xp / data.xpToNextLevel) * 100, 100)
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
            <div className="container mx-auto max-w-7xl">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Learning Journey</h1>
                    <p className="text-gray-600">Track your progress and celebrate your achievements</p>
                </motion.div>

                {/* Knowledge Gap Radar Chart Container */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 md:col-span-1">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <TargetIcon className="text-indigo-600" size={20} />
                            Knowledge Profile
                        </h2>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Me"
                                        dataKey="A"
                                        stroke="#4f46e5"
                                        strokeWidth={2}
                                        fill="#6366f1"
                                        fillOpacity={0.3}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-center text-xs text-gray-500 mt-2">Personalized knowledge gap analysis.</p>
                    </div>

                    {/* Overview Cards */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl shadow-lg p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-gray-600 text-sm">Level</p>
                                    <p className="text-3xl font-bold text-indigo-600">{data.level}</p>
                                </div>
                                <div className="p-3 bg-indigo-100 rounded-xl">
                                    <Trophy className="text-indigo-600" size={24} />
                                </div>
                            </div>
                            <div className="mb-2">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Progress</span>
                                    <span className="font-semibold">{data.xp}/{data.xpToNextLevel} XP</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl shadow-lg p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-gray-600 text-sm">Streak</p>
                                    <p className="text-3xl font-bold text-orange-600">{data.streak} Days</p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-xl">
                                    <Flame className="text-orange-600" size={24} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">
                                Longest: {data.studyStats?.longestStreak || 0} days
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-2xl shadow-lg p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-gray-600 text-sm">Quizzes</p>
                                    <p className="text-3xl font-bold text-green-600">{data.totalQuizzes}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-xl">
                                    <BookOpen className="text-green-600" size={24} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">
                                Avg Score: {data.averageScore}%
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-2xl shadow-lg p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-gray-600 text-sm">Study Time</p>
                                    <p className="text-3xl font-bold text-blue-600">{Math.floor((data.studyStats?.totalTime || 0) / 60)}h</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <Clock className="text-blue-600" size={24} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">
                                Avg: {data.studyStats?.avgDuration || 0} min/quiz
                            </p>
                        </motion.div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Score Trend */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-2xl shadow-lg p-6"
                    >
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <TrendingUp className="mr-2 text-indigo-600" size={24} />
                            Score Trend
                        </h2>
                        {data.scoreHistory && data.scoreHistory.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={data.scoreHistory}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        dot={{ fill: '#6366f1', r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-400">
                                Not enough data for trend analysis
                            </div>
                        )}
                    </motion.div>

                    {/* Subject Performance Radar */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white rounded-2xl shadow-lg p-6"
                    >
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <Target className="mr-2 text-purple-600" size={24} />
                            Subject Performance
                        </h2>
                        {data.subjectRadar && data.subjectRadar.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <RadarChart data={data.subjectRadar}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" />
                                    <PolarRadiusAxis domain={[0, 100]} />
                                    <Radar
                                        name="Score"
                                        dataKey="score"
                                        stroke="#8b5cf6"
                                        fill="#8b5cf6"
                                        fillOpacity={0.6}
                                    />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-400">
                                Not enough data for subject analysis
                            </div>
                        )}
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Time by Category */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="bg-white rounded-2xl shadow-lg p-6"
                    >
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Time by Category</h2>
                        {data.timeByCategory && data.timeByCategory.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={data.timeByCategory}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {data.timeByCategory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[250px] flex items-center justify-center text-gray-400">
                                No category data available
                            </div>
                        )}
                    </motion.div>

                    {/* Subject Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6"
                    >
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Subject Breakdown</h2>
                        <div className="space-y-4">
                            {data.performanceBySubject && Object.keys(data.performanceBySubject).length > 0 ? (
                                Object.entries(data.performanceBySubject).map(([subject, stats]) => (
                                    <div key={subject}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-gray-700">{subject}</span>
                                            <span className="text-sm text-gray-600">
                                                {stats.score}% ({stats.quizzes} quizzes)
                                            </span>
                                        </div>
                                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${stats.score >= 90 ? 'bg-green-500' :
                                                    stats.score >= 75 ? 'bg-blue-500' :
                                                        stats.score >= 60 ? 'bg-amber-500' :
                                                            'bg-red-500'
                                                    }`}
                                                style={{ width: `${stats.score}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-400 text-center py-8">
                                    Complete quizzes to see subject breakdown
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Strengths & Weaknesses */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 }}
                        className="bg-white rounded-2xl shadow-lg p-6"
                    >
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Strengths & Weaknesses</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-green-600 mb-3 flex items-center">
                                    <Star className="mr-2" size={20} />
                                    Your Strengths
                                </h3>
                                <div className="space-y-2">
                                    {data.strengths && data.strengths.length > 0 ? (
                                        data.strengths.map((strength, index) => (
                                            <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                                                <span className="text-green-600 mr-2">✓</span>
                                                <span className="text-gray-700">{strength}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">Keep learning to identify strengths!</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-amber-600 mb-3 flex items-center">
                                    <TrendingUp className="mr-2" size={20} />
                                    Areas to Improve
                                </h3>
                                <div className="space-y-2">
                                    {data.weaknesses && data.weaknesses.length > 0 ? (
                                        data.weaknesses.map((weakness, index) => (
                                            <div key={index} className="flex items-center p-3 bg-amber-50 rounded-lg">
                                                <span className="text-amber-600 mr-2">→</span>
                                                <span className="text-gray-700">{weakness}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">Complete more quizzes to identify areas for improvement.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Recent Achievements */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.0 }}
                        className="bg-white rounded-2xl shadow-lg p-6"
                    >
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <Award className="mr-2 text-yellow-600" size={24} />
                            Recent Achievements
                        </h2>
                        <div className="space-y-3">
                            {data.achievements && data.achievements.length > 0 ? (
                                data.achievements.map((achievement) => (
                                    <div key={achievement.id} className="flex items-start p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
                                        <div className="text-3xl mr-3">{achievement.icon}</div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-800">{achievement.name}</h4>
                                            <p className="text-sm text-gray-600">{achievement.description}</p>
                                            <p className="text-xs text-gray-500 mt-1 flex items-center">
                                                <Calendar size={12} className="mr-1" />
                                                {achievement.date}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">No achievements yet. Start quizzing!</p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default StudentProgress;
