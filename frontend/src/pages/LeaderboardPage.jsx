// src/pages/LeaderboardPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus, Flame, Award, Loader } from 'lucide-react';
import { mockGamificationData } from '../utils/mockData';
import { gamificationService } from '../services';

const LeaderboardPage = () => {
    const [timeFilter, setTimeFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('global');
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch leaderboard data
    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                const data = await gamificationService.getLeaderboard(typeFilter, timeFilter);
                setLeaderboardData(data);
            } catch (err) {
                console.error('Failed to fetch leaderboard:', err);
                // Fallback to mock data
                setLeaderboardData(mockGamificationData.leaderboard.global);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [typeFilter, timeFilter]);

    const getMedalColor = (rank) => {
        switch (rank) {
            case 1: return 'from-yellow-400 to-yellow-600';
            case 2: return 'from-gray-300 to-gray-500';
            case 3: return 'from-orange-400 to-orange-600';
            default: return 'from-gray-200 to-gray-400';
        }
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up': return <TrendingUp className="text-green-600" size={20} />;
            case 'down': return <TrendingDown className="text-red-600" size={20} />;
            default: return <Minus className="text-gray-400" size={20} />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
                <Loader className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8 px-4">
            <div className="container mx-auto max-w-5xl">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
                        <Trophy className="mr-3 text-yellow-600" size={40} />
                        Leaderboard
                    </h1>
                    <p className="text-gray-600">Compete with other learners and climb the ranks</p>
                </motion.div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Type Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Leaderboard Type
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {['global', 'friends', 'class', 'subject'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setTypeFilter(type)}
                                        className={`px-4 py-2 rounded-xl font-semibold transition-all ${typeFilter === type
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Time Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Time Period
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {['today', 'week', 'month', 'all'].map(time => (
                                    <button
                                        key={time}
                                        onClick={() => setTimeFilter(time)}
                                        className={`px-4 py-2 rounded-xl font-semibold transition-all ${timeFilter === time
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {time === 'all' ? 'All Time' : time.charAt(0).toUpperCase() + time.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top 3 Podium */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {/* 2nd Place */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col items-center transform hover:scale-105 transition-transform duration-300"
                    >
                        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-[0_0_15px_rgba(192,192,192,0.3)] p-6 w-full text-center mb-4 border border-gray-100">
                            <div className={`w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br ${getMedalColor(2)} flex items-center justify-center text-white text-2xl font-bold`}>
                                2
                            </div>
                            <img
                                src={leaderboardData[1]?.avatar}
                                alt={leaderboardData[1]?.username}
                                className="w-16 h-16 rounded-full mx-auto mb-3 border-4 border-gray-300"
                            />
                            <h3 className="font-bold text-gray-800 mb-1">{leaderboardData[1]?.username}</h3>
                            <p className="text-sm text-gray-600">Level {leaderboardData[1]?.level}</p>
                            <p className="text-lg font-bold text-indigo-600 mt-2">{leaderboardData[1]?.xp.toLocaleString()} XP</p>
                        </div>
                        <div className="w-full h-24 bg-gradient-to-br from-gray-300 to-gray-500 rounded-t-2xl flex items-center justify-center text-white font-bold text-xl">
                            🥈
                        </div>
                    </motion.div>

                    {/* 1st Place */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col items-center -mt-8 transform hover:scale-105 transition-transform duration-300 z-10"
                    >
                        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-[0_0_30px_rgba(250,204,21,0.4)] p-6 w-full text-center mb-4 border-4 border-yellow-400 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2">
                                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-yellow-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                            </div>
                            <div className={`w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-br ${getMedalColor(1)} flex items-center justify-center text-white text-3xl font-bold shadow-lg`}>
                                👑
                            </div>
                            <img
                                src={leaderboardData[0]?.avatar}
                                alt={leaderboardData[0]?.username}
                                className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-yellow-400"
                            />
                            <h3 className="font-bold text-gray-800 text-lg mb-1">{leaderboardData[0]?.username}</h3>
                            <p className="text-sm text-gray-600">Level {leaderboardData[0]?.level}</p>
                            <p className="text-xl font-bold text-yellow-600 mt-2">{leaderboardData[0]?.xp.toLocaleString()} XP</p>
                        </div>
                        <div className="w-full h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-t-2xl flex items-center justify-center text-white font-bold text-2xl">
                            🥇
                        </div>
                    </motion.div>

                    {/* 3rd Place */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col items-center transform hover:scale-105 transition-transform duration-300"
                    >
                        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-[0_0_15px_rgba(251,146,60,0.3)] p-6 w-full text-center mb-4 border border-gray-100">
                            <div className={`w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br ${getMedalColor(3)} flex items-center justify-center text-white text-2xl font-bold`}>
                                3
                            </div>
                            <img
                                src={leaderboardData[2]?.avatar}
                                alt={leaderboardData[2]?.username}
                                className="w-16 h-16 rounded-full mx-auto mb-3 border-4 border-orange-400"
                            />
                            <h3 className="font-bold text-gray-800 mb-1">{leaderboardData[2]?.username}</h3>
                            <p className="text-sm text-gray-600">Level {leaderboardData[2]?.level}</p>
                            <p className="text-lg font-bold text-indigo-600 mt-2">{leaderboardData[2]?.xp.toLocaleString()} XP</p>
                        </div>
                        <div className="w-full h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-t-2xl flex items-center justify-center text-white font-bold text-xl">
                            🥉
                        </div>
                    </motion.div>
                </div>

                {/* Rest of Leaderboard */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                        <h2 className="text-2xl font-bold">Top Players</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {leaderboardData.slice(3).map((player, index) => (
                            <motion.div
                                key={player.userId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: (index + 3) * 0.05 }}
                                className="p-6 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-400 rounded-full flex items-center justify-center text-gray-700 font-bold text-lg">
                                            #{player.rank}
                                        </div>
                                        <img
                                            src={player.avatar}
                                            alt={player.username}
                                            className="w-14 h-14 rounded-full border-2 border-gray-200"
                                        />
                                        <div>
                                            <h3 className="font-bold text-gray-800">{player.username}</h3>
                                            <div className="flex items-center space-x-3 text-sm text-gray-600">
                                                <span>Level {player.level}</span>
                                                <span>•</span>
                                                <span className="flex items-center">
                                                    <Flame size={14} className="text-orange-500 mr-1" />
                                                    {player.streak} days
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center">
                                                    <Award size={14} className="text-purple-500 mr-1" />
                                                    {player.badges} badges
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-indigo-600">
                                                {player.xp.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-500">XP</p>
                                        </div>
                                        {getTrendIcon(player.trend)}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPage;
