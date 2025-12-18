// src/pages/EducatorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Users,
    BookOpen,
    Play,
    BarChart3,
    PlusCircle,
    TrendingUp,
    Clock,
    Award,
    ArrowRight,
    Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const EducatorDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalClasses: 0,
        totalStudents: 0,
        quizzesCreated: 0,
        activeSessions: 0,
        avgClassScore: 0
    });

    useEffect(() => {
        // TODO: Fetch educator stats from API
        setStats({
            totalClasses: user?.stats?.totalClasses || 0,
            totalStudents: user?.stats?.totalStudents || 0,
            quizzesCreated: user?.stats?.quizzesCreated || 0,
            activeSessions: user?.stats?.activeSessions || 0,
            avgClassScore: user?.stats?.avgClassScore || 0
        });
    }, [user]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
            <div className="container mx-auto px-4 py-8">

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl p-8 mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800 mb-2">
                                Welcome, Prof. {user?.username || user?.displayName}! 👨‍🏫
                            </h1>
                            <p className="text-gray-600">Manage your classes and track student progress</p>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Link
                                to="/create-quiz"
                                className="btn-primary flex items-center space-x-2"
                            >
                                <PlusCircle size={20} />
                                <span>Create Quiz</span>
                            </Link>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-purple-500 rounded-xl">
                                    <Users className="text-white" size={24} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-purple-700">{stats.totalStudents}</p>
                                    <p className="text-sm text-purple-600">Students</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-blue-500 rounded-xl">
                                    <BookOpen className="text-white" size={24} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-blue-700">{stats.quizzesCreated}</p>
                                    <p className="text-sm text-blue-600">Quizzes</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-green-500 rounded-xl">
                                    <Play className="text-white" size={24} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-700">{stats.activeSessions}</p>
                                    <p className="text-sm text-green-600">Active Sessions</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-amber-500 rounded-xl">
                                    <TrendingUp className="text-white" size={24} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-amber-700">{stats.avgClassScore}%</p>
                                    <p className="text-sm text-amber-600">Avg Score</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-indigo-500 rounded-xl">
                                    <Award className="text-white" size={24} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-indigo-700">{stats.totalClasses}</p>
                                    <p className="text-sm text-indigo-600">Classes</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-3xl shadow-xl p-6"
                        >
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Link
                                    to="/create-quiz"
                                    className="group bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white hover:shadow-2xl transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">Create Quiz</h3>
                                            <p className="text-purple-100">Build new quiz</p>
                                        </div>
                                        <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
                                    </div>
                                </Link>

                                <Link
                                    to="/host-session"
                                    className="group bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white hover:shadow-2xl transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">Host Session</h3>
                                            <p className="text-blue-100">Start live quiz</p>
                                        </div>
                                        <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
                                    </div>
                                </Link>

                                <Link
                                    to="/my-classes"
                                    className="group bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white hover:shadow-2xl transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">My Classes</h3>
                                            <p className="text-green-100">Manage students</p>
                                        </div>
                                        <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
                                    </div>
                                </Link>

                                <Link
                                    to="/analytics"
                                    className="group bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white hover:shadow-2xl transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">Analytics</h3>
                                            <p className="text-amber-100">View insights</p>
                                        </div>
                                        <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
                                    </div>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Recent Quiz Results */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-3xl shadow-xl p-6"
                        >
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Quiz Results</h2>
                            <div className="space-y-3">
                                <div className="text-center py-8 text-gray-500">
                                    <BookOpen className="mx-auto mb-3 text-gray-400" size={48} />
                                    <p>No recent quiz results</p>
                                    <Link to="/create-quiz" className="text-purple-600 hover:underline">
                                        Create your first quiz!
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">

                        {/* My Classes */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-3xl shadow-xl p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800">My Classes</h2>
                                <button className="text-purple-600 hover:text-purple-700">
                                    <PlusCircle size={20} />
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div className="text-center py-8 text-gray-500">
                                    <Users className="mx-auto mb-3 text-gray-400" size={48} />
                                    <p className="text-sm">No classes yet</p>
                                    <button className="text-purple-600 hover:underline text-sm mt-2">
                                        Create a class
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* AI Assistant */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl shadow-xl p-6 text-white"
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <Sparkles size={24} />
                                <h2 className="text-xl font-bold">AI Quiz Generator</h2>
                            </div>
                            <p className="text-indigo-100 text-sm mb-4">
                                Generate quizzes instantly from any topic using AI
                            </p>
                            <Link
                                to="/create-quiz"
                                className="block w-full bg-white text-indigo-600 text-center py-2 rounded-xl font-semibold hover:bg-indigo-50 transition-colors"
                            >
                                Try Now
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EducatorDashboard;
