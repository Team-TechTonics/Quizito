import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Trophy,
  Crown,
  Medal,
  Star,
  TrendingUp,
  Filter,
  Download,
  Share2,
  Globe,
  Clock,
  Zap,
  Target,
  Award,
  Users,
  Calendar,
  CheckCircle,
  Lock,
  BarChart3
} from "lucide-react";


const Leaderboard = () => {
  const { sessionId } = useParams();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [stats, setStats] = useState({
    totalPlayers: 0,
    avgAccuracy: 0,
    avgResponseTime: 0,
    quizzesPlayed: 0
  });

  const timeFilters = ['All Time', 'This Week', 'Today'];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('quizito_token');

        // Try to fetch from the leaderboard endpoint
        const response = await fetch(
          `http://localhost:10000/api/leaderboard?timeFilter=${timeFilter}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }

        const data = await response.json();

        // Transform backend data to match UI format
        const formattedData = (data.leaderboard || []).map((user, index) => ({
          id: user._id || index,
          name: user.username,
          score: user.stats?.totalScore || user.score || 0,
          rank: index + 1,
          streak: user.stats?.streak || 0,
          accuracy: Math.round(user.stats?.accuracy || 0),
          avatar: user.username?.substring(0, 2).toUpperCase() || 'UN',
          country: user.location || 'Global',
          isCurrentUser: user.isCurrentUser || false
        }));

        setLeaderboardData(formattedData);

        // Update stats
        if (data.stats) {
          setStats({
            totalPlayers: data.stats.totalPlayers || 0,
            avgAccuracy: (data.stats.avgAccuracy || 0).toFixed(1),
            avgResponseTime: (data.stats.avgResponseTime || 0).toFixed(1),
            quizzesPlayed: data.stats.quizzesPlayed || 0
          });
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError(err.message);
        // Use empty leaderboard as fallback
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeFilter, sessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-purple-500/10 to-pink-500/10"></div>
        <div className="container mx-auto px-4 py-12 relative">
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-block mb-6"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                <Trophy className="text-white" size={48} />
              </div>
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Global Leaderboard
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Compete with players worldwide and climb to the top of the rankings
            </p>
            <div className="inline-flex items-center space-x-2 mt-4 px-4 py-2 bg-gray-800/50 rounded-full">
              <Globe className="text-indigo-400" size={20} />
              <span className="text-gray-300">Session: </span>
              <span className="font-mono font-bold text-white">#{sessionId || 'GLOBAL'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {/* Filters and Controls */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap gap-3">
              {timeFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${filter === timeFilter
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 flex items-center transition-all">
                <Filter className="mr-2" size={18} />
                Filter
              </button>
              <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 flex items-center transition-all">
                <Download className="mr-2" size={18} />
                Export
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg flex items-center transition-all">
                <Share2 className="mr-2" size={18} />
                Share
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{stats.totalPlayers}</div>
                  <div className="text-sm text-gray-400">Total Players</div>
                </div>
                <Users className="text-indigo-400" size={24} />
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{stats.avgAccuracy}%</div>
                  <div className="text-sm text-gray-400">Avg Accuracy</div>
                </div>
                <Target className="text-green-400" size={24} />
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{stats.avgResponseTime}s</div>
                  <div className="text-sm text-gray-400">Avg Response Time</div>
                </div>
                <Clock className="text-yellow-400" size={24} />
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{stats.quizzesPlayed}</div>
                  <div className="text-sm text-gray-400">Quizzes Played</div>
                </div>
                <Zap className="text-purple-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-400">Loading leaderboard...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-400">Error loading leaderboard: {error}</p>
          </div>
        )}

        {/* Leaderboard Content */}
        {!loading && leaderboardData.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Leaderboard */}
            <div className="lg:col-span-2">
              {/* Top 3 Podium */}
              {leaderboardData.length >= 3 && (
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {leaderboardData.slice(0, 3).map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ y: 50 }}
                      animate={{ y: 0 }}
                      transition={{ delay: index * 0.1, type: 'spring' }}
                      className={`relative ${player.rank === 1
                          ? 'order-2 -mt-8'
                          : player.rank === 2
                            ? 'order-1'
                            : 'order-3'
                        }`}
                    >
                      <div className={`bg-gradient-to-b ${player.rank === 1 ? 'from-yellow-500/20 to-yellow-600/20' :
                          player.rank === 2 ? 'from-gray-400/20 to-gray-600/20' :
                            'from-amber-700/20 to-amber-900/20'
                        } rounded-2xl p-6 text-center border ${player.rank === 1 ? 'border-yellow-500/50' : 'border-gray-600'
                        }`}>
                        {/* Rank Badge */}
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${player.rank === 1 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                              player.rank === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                                'bg-gradient-to-r from-amber-700 to-amber-900'
                            }`}>
                            {player.rank === 1 ? (
                              <Crown className="text-white" size={24} />
                            ) : (
                              <span className="text-white font-bold text-xl">{player.rank}</span>
                            )}
                          </div>
                        </div>

                        {/* Avatar */}
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center border-4 border-gray-800">
                          <span className="text-2xl font-bold text-white">{player.avatar}</span>
                        </div>

                        {/* Player Info */}
                        <h3 className="font-bold text-white text-xl mb-1">{player.name}</h3>
                        <div className="text-3xl font-bold text-white mb-2">
                          {player.score.toLocaleString()}
                        </div>
                        <div className="text-gray-300 mb-3">points</div>

                        {/* Stats */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-center space-x-2">
                            <Zap className="text-yellow-400" size={16} />
                            <span className="text-sm text-yellow-400">{player.streak} streak</span>
                          </div>
                          <div className="flex items-center justify-center space-x-2">
                            <Target className="text-green-400" size={16} />
                            <span className="text-sm text-green-400">{player.accuracy}% accuracy</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Leaderboard List */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 overflow-hidden">
                {leaderboardData.slice(3).map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index + 3) * 0.05 }}
                    className={`flex items-center p-6 border-b border-gray-700/50 last:border-b-0 ${player.isCurrentUser
                        ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10'
                        : 'hover:bg-gray-700/30'
                      } transition-all`}
                  >
                    {/* Rank */}
                    <div className="w-12 text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${player.rank <= 10
                          ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30'
                          : 'bg-gray-700'
                        }`}>
                        <span className={`font-bold ${player.rank <= 10 ? 'text-indigo-300' : 'text-gray-400'
                          }`}>
                          {player.rank}
                        </span>
                      </div>
                    </div>

                    {/* Avatar & Name */}
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${player.isCurrentUser
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                          : 'bg-gray-700'
                        }`}>
                        <span className={`font-bold ${player.isCurrentUser ? 'text-white' : 'text-gray-300'}`}>
                          {player.avatar}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <span className={`font-bold ${player.isCurrentUser ? 'text-white' : 'text-gray-300'}`}>
                            {player.name}
                          </span>
                          {player.isCurrentUser && (
                            <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-full">
                              You
                            </span>
                          )}
                          <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full flex items-center">
                            <Globe className="mr-1" size={10} />
                            {player.country}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                          <span className="flex items-center">
                            <Zap className="mr-1" size={12} />
                            {player.streak} streak
                          </span>
                          <span className="flex items-center">
                            <Target className="mr-1" size={12} />
                            {player.accuracy}% accuracy
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{player.score.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">points</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Top Categories */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <BarChart3 className="mr-2" size={20} />
                  Top Categories
                </h3>
                <div className="space-y-3">
                  {['Technology', 'Science', 'Sports', 'General'].map((cat, i) => (
                    <div key={cat} className="flex justify-between items-center">
                      <span className="text-gray-300">{cat}</span>
                      <span className="text-indigo-400 font-bold">#{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Your Stats */}
              <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-lg rounded-2xl border border-indigo-500/30 p-6">
                <h3 className="text-lg font-bold mb-4">Your Stats</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm">Current Rank</p>
                    <p className="text-2xl font-bold text-indigo-300">#--</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Points</p>
                    <p className="text-2xl font-bold text-indigo-300">--</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && leaderboardData.length === 0 && !error && (
          <div className="text-center py-12">
            <Trophy className="mx-auto mb-4 text-gray-600" size={48} />
            <p className="text-gray-400">No leaderboard data available yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
