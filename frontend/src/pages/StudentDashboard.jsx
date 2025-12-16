// src/pages/StudentDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { classService } from '../services'; // Import Class Service
import { recommendationService } from '../services/recommendationService';
import {
    Brain,
    Zap,
    Trophy,
    TrendingUp,
    Clock,
    Target,
    Award,
    BookOpen,
    ArrowRight,
    Flame,
    Users,
    Swords,
    FileText,
    Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]); // Assignments State
    const [loadingAssignments, setLoadingAssignments] = useState(true);
    const [stats, setStats] = useState({
        totalQuizzes: 0,
        averageScore: 0,
        currentStreak: 0,
        rank: 0,
        level: 1,
        points: 0
    });
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        // TODO: Fetch student stats from API
        // For now, using mock data
        setStats({
            totalQuizzes: user?.stats?.totalQuizzes || 0,
            averageScore: user?.stats?.averageScore || 0,
            currentStreak: user?.stats?.currentStreak || 0,
            rank: user?.stats?.rank || 0,
            level: user?.stats?.level || 1,
            points: user?.stats?.experience || 0
        });

        fetchAssignments();
        fetchRecommendations();
    }, [user]);

    const fetchRecommendations = () => {
        // Mock history for now, in real app this would come from API or user context
        const history = user?.history || [];
        const recs = recommendationService.getRecommendations(history);
        setRecommendations(recs);
    };

    const fetchAssignments = async () => {
        try {
            const data = await classService.getStudentAssignments();
            setAssignments(data || []);
        } catch (error) {
            console.error("Failed to fetch assignments", error);
        } finally {
            setLoadingAssignments(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="container mx-auto px-4 py-8">

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl p-8 mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800 mb-2">
                                Welcome back, {user?.username || user?.displayName}! 👋
                            </h1>
                            <p className="text-gray-600">Ready to continue your learning journey?</p>
                        </div>

                        {/* Streak Counter */}
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-2 mb-2">
                                <Flame className="text-orange-500" size={32} />
                                <span className="text-4xl font-bold text-orange-500">{stats.currentStreak}</span>
                            </div>
                            <p className="text-sm text-gray-600">Day Streak</p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-blue-500 rounded-xl">
                                    <BookOpen className="text-white" size={24} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-blue-700">{stats.totalQuizzes}</p>
                                    <p className="text-sm text-blue-600">Quizzes Taken</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-green-500 rounded-xl">
                                    <TrendingUp className="text-white" size={24} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-700">{stats.averageScore}%</p>
                                    <p className="text-sm text-green-600">Avg Score</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-purple-500 rounded-xl">
                                    <Trophy className="text-white" size={24} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-purple-700">#{stats.rank || 'N/A'}</p>
                                    <p className="text-sm text-purple-600">Global Rank</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-amber-500 rounded-xl">
                                    <Zap className="text-white" size={24} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-amber-700">Level {stats.level}</p>
                                    <p className="text-sm text-amber-600">{stats.points} XP</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Upcoming Assignments - NEW SECTION */}
                        {assignments.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-3xl shadow-xl p-6 border-l-4 border-indigo-500"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                        <FileText className="mr-2 text-indigo-600" size={24} />
                                        Assignments Due Soon
                                    </h2>
                                    <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                                        {assignments.length} Pending
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {assignments.slice(0, 3).map((assignment, idx) => (
                                        <Link
                                            key={idx}
                                            to={`/play/${assignment.quiz?._id || assignment.quiz}`}
                                            className="block group"
                                        >
                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl group-hover:bg-indigo-50 transition-colors border border-gray-100 group-hover:border-indigo-200">
                                                <div className="flex items-center space-x-4">
                                                    <div className="p-3 bg-white rounded-lg shadow-sm text-indigo-600 group-hover:scale-110 transition-transform">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">{assignment.quiz?.title || 'Quiz Assignment'}</h4>
                                                        <p className="text-sm text-gray-500 flex items-center mt-1">
                                                            <Calendar size={14} className="mr-1" />
                                                            Due: {new Date(assignment.dueDate).toLocaleDateString()} {new Date(assignment.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            <span className="mx-2">•</span>
                                                            <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{assignment.className}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${new Date(assignment.dueDate) < new Date() ? 'bg-red-100 text-red-600' :
                                                        new Date(assignment.dueDate) < new Date(Date.now() + 86400000) ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                                                        }`}>
                                                        {new Date(assignment.dueDate) < new Date() ? 'Overdue' : new Date(assignment.dueDate) < new Date(Date.now() + 86400000) ? 'Due Tomorrow' : 'Upcoming'}
                                                    </span>
                                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                                        <ArrowRight size={16} />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                    {assignments.length > 3 && (
                                        <button className="w-full text-center text-indigo-600 font-medium py-2 hover:underline">
                                            View all {assignments.length} assignments
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-3xl shadow-xl p-6"
                        >
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Link
                                    to="/join-quiz"
                                    className="group bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 text-white hover:shadow-2xl transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">Join Quiz</h3>
                                            <p className="text-indigo-100">Enter a room code</p>
                                        </div>
                                        <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
                                    </div>
                                </Link>

                                <Link
                                    to="/explore"
                                    className="group bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white hover:shadow-2xl transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">Browse Quizzes</h3>
                                            <p className="text-blue-100">Explore topics</p>
                                        </div>
                                        <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
                                    </div>
                                </Link>

                                <Link
                                    to="/friends"
                                    className="group bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white hover:shadow-2xl transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">Friends</h3>
                                            <p className="text-pink-100">Connect & Compete</p>
                                        </div>
                                        <Users className="group-hover:scale-110 transition-transform" size={24} />
                                    </div>
                                </Link>

                                <Link
                                    to="/challenges"
                                    className="group bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl p-6 text-white hover:shadow-2xl transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">Challenges</h3>
                                            <p className="text-red-100">Battle friends</p>
                                        </div>
                                        <Swords className="group-hover:scale-110 transition-transform" size={24} />
                                    </div>
                                </Link>

                                <Link
                                    to="/leaderboard"
                                    className="group bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white hover:shadow-2xl transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">Leaderboard</h3>
                                            <p className="text-amber-100">See rankings</p>
                                        </div>
                                        <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
                                    </div>
                                </Link>

                                <Link
                                    to="/profile"
                                    className="group bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white hover:shadow-2xl transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">My Progress</h3>
                                            <p className="text-green-100">Track learning</p>
                                        </div>
                                        <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
                                    </div>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Recent Activity */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-3xl shadow-xl p-6"
                        >
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Brain className="text-blue-600" size={20} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">Mathematics Quiz</p>
                                            <p className="text-sm text-gray-600">Completed 2 hours ago</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-green-600">85%</p>
                                        <p className="text-xs text-gray-500">+50 XP</p>
                                    </div>
                                </div>

                                <div className="text-center py-8 text-gray-500">
                                    <p>No recent activity</p>
                                    <Link to="/explore" className="text-indigo-600 hover:underline">
                                        Start a quiz now!
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-3xl shadow-xl p-6"
                        >
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Recommended for You</h2>
                            <div className="space-y-3">
                                {recommendations.map((rec, idx) => (
                                    <div key={idx} className="p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => console.log('Navigate to:', rec.id)}>
                                        <h3 className="font-semibold text-gray-800 mb-1">{rec.title}</h3>
                                        <p className="text-sm text-gray-600 mb-2">{rec.category} • {rec.type}</p>
                                        <div className="flex items-center justify-between">
                                            <span className={`text-xs px-2 py-1 rounded-full ${rec.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                                rec.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {rec.difficulty.charAt(0).toUpperCase() + rec.difficulty.slice(1)}
                                            </span>
                                            <ArrowRight size={16} className="text-gray-400" />
                                        </div>
                                        {rec.reason && (
                                            <p className="text-xs text-indigo-500 mt-2 font-medium">💡 {rec.reason}</p>
                                        )}
                                    </div>
                                ))}
                                {recommendations.length === 0 && (
                                    <p className="text-gray-500 text-sm text-center">Complete more quizzes to get personal recommendations!</p>
                                )}
                            </div>
                        </motion.div>

                        {/* Achievements Preview */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-xl p-6 text-white"
                        >
                            <h2 className="text-xl font-bold mb-4">Latest Achievement</h2>
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                                    <Award size={40} />
                                </div>
                                <h3 className="font-bold text-lg mb-2">First Steps</h3>
                                <p className="text-purple-100 text-sm">Complete your first quiz</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default StudentDashboard;
