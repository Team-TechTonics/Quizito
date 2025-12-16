// src/pages/Challenges.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Swords,
    Trophy,
    Clock,
    Target,
    TrendingUp,
    Check,
    X,
    Play,
    Loader
} from 'lucide-react';
import { socialService } from '../services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const Challenges = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('active'); // active, completed, history
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        setLoading(true);
        try {
            const data = await socialService.getChallenges();
            setChallenges(data || []);
        } catch (error) {
            console.error('Failed to fetch challenges:', error);
            toast.error('Failed to load challenges');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptChallenge = async (challengeId) => {
        try {
            await socialService.acceptChallenge(challengeId);
            toast.success('Challenge accepted! Starting quiz...');
            // Navigate to play the quiz
            // Assuming challenges have a roomCode or quizId to play
            // For now, reload to update status or navigate if we had the logic
            fetchChallenges();
        } catch (error) {
            console.error('Failed to accept challenge:', error);
            toast.error('Failed to accept challenge');
        }
    };

    const handleDeclineChallenge = async (challengeId) => {
        try {
            await socialService.declineChallenge(challengeId);
            toast.success('Challenge declined');
            fetchChallenges();
        } catch (error) {
            console.error('Failed to decline challenge:', error);
            toast.error('Failed to decline challenge');
        }
    };

    const activeChallenges = challenges.filter(c => c.status === 'pending' || c.status === 'active');
    const completedChallenges = challenges.filter(c => c.status === 'completed');

    // Stats calculation based on real data
    const totalChallenges = challenges.length;
    const wins = completedChallenges.filter(c => c.winner === user?.id || c.winner === 'you').length; // 'you' for back-compat if API returns that
    const winRate = totalChallenges > 0 ? Math.round((wins / completedChallenges.length) * 100) || 0 : 0;
    // Streak logic would need explicit API support or complex calculation, mocking 0 for now if not in stats
    const streak = user?.stats?.streak || 0;

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'bg-green-100 text-green-700';
            case 'medium': return 'bg-amber-100 text-amber-700';
            case 'hard': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
                <Loader className="animate-spin text-purple-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-8 px-4">
            <div className="container mx-auto max-w-6xl">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
                        <Swords className="mr-3 text-purple-600" size={40} />
                        Challenges
                    </h1>
                    <p className="text-gray-600">Compete head-to-head with your friends</p>
                </motion.div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Challenges</p>
                                <p className="text-3xl font-bold text-indigo-600">{totalChallenges}</p>
                            </div>
                            <Swords className="text-indigo-600" size={32} />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Wins</p>
                                <p className="text-3xl font-bold text-green-600">{wins}</p>
                            </div>
                            <Trophy className="text-green-600" size={32} />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Win Rate</p>
                                <p className="text-3xl font-bold text-purple-600">{winRate}%</p>
                            </div>
                            <Target className="text-purple-600" size={32} />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Win Streak</p>
                                <p className="text-3xl font-bold text-orange-600">{streak}</p>
                            </div>
                            <TrendingUp className="text-orange-600" size={32} />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-2 mb-8">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'active'
                            ? 'bg-purple-500 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Active ({activeChallenges.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'completed'
                            ? 'bg-purple-500 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Completed
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'history'
                            ? 'bg-purple-500 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        History
                    </button>
                </div>

                {/* Active Challenges */}
                {activeTab === 'active' && (
                    <div className="space-y-6">
                        {activeChallenges.map(challenge => (
                            <motion.div
                                key={challenge.id || challenge._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-2xl p-8 text-white mb-8"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-3xl font-bold mb-2">Challenge from {challenge.challenger?.username || 'Opponent'}</h2>
                                        <p className="text-purple-100">You've been challenged to a quiz duel!</p>
                                    </div>
                                    <Swords size={48} className="text-purple-200" />
                                </div>

                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
                                    <h3 className="text-xl font-bold mb-4">{challenge.quiz?.title || 'Quiz Challenge'}</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-purple-200 text-sm mb-1">Difficulty</p>
                                            <p className="font-semibold capitalize">{challenge.quiz?.difficulty || 'Medium'}</p>
                                        </div>
                                        <div>
                                            <p className="text-purple-200 text-sm mb-1">Wager</p>
                                            <p className="font-semibold">{challenge.wager} XP</p>
                                        </div>
                                        <div>
                                            <p className="text-purple-200 text-sm mb-1">Expires In</p>
                                            <p className="font-semibold flex items-center">
                                                <Clock size={16} className="mr-1" />
                                                24h
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-purple-200 text-sm mb-1">Created</p>
                                            <p className="font-semibold">{new Date(challenge.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => handleAcceptChallenge(challenge.id || challenge._id)}
                                        className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-white text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-colors"
                                    >
                                        <Play size={20} />
                                        <span>Accept Challenge</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeclineChallenge(challenge.id || challenge._id)}
                                        className="flex items-center justify-center space-x-2 px-6 py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                                    >
                                        <X size={20} />
                                        <span>Decline</span>
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {activeChallenges.length === 0 && (
                            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                                <Swords size={64} className="mx-auto mb-4 text-gray-300" />
                                <h3 className="text-xl font-bold text-gray-800 mb-2">No Active Challenges</h3>
                                <p className="text-gray-600">Challenge a friend to start competing!</p>
                                <Link to="/friends" className="inline-block mt-4 px-6 py-2 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors">
                                    Find Friends to Challenge
                                </Link>
                            </div>
                        )}
                    </div>
                )}


                {/* Completed Challenges */}
                {activeTab === 'completed' && (
                    <div className="space-y-4">
                        {completedChallenges.map((challenge, index) => (
                            <motion.div
                                key={challenge.id || challenge._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-2xl shadow-lg p-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-1">{challenge.quiz?.title}</h3>
                                        <p className="text-sm text-gray-600">
                                            {new Date(challenge.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${getDifficultyColor(challenge.quiz?.difficulty)}`}>
                                        {challenge.quiz?.difficulty?.toUpperCase() || 'MEDIUM'}
                                    </span>
                                </div>

                                {/* VS Display */}
                                <div className="grid grid-cols-3 gap-4 items-center mb-4">
                                    {/* You */}
                                    <div className={`text-center p-4 rounded-xl ${challenge.winner === user?.id ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50'}`}>
                                        <p className="text-sm text-gray-600 mb-2">You</p>
                                        {/* Assuming scores are available in the challenge object properly */}
                                        <p className="text-3xl font-bold text-gray-800">{challenge.results?.find(r => r.userId === user?.id)?.score || 0}%</p>
                                        {challenge.winner === user?.id && (
                                            <div className="mt-2 text-center w-full flex justify-center">
                                                <Trophy className="inline text-yellow-500" size={24} />
                                            </div>
                                        )}
                                    </div>

                                    {/* VS */}
                                    <div className="text-center">
                                        <Swords className="mx-auto text-gray-400" size={32} />
                                        <p className="text-sm font-bold text-gray-600 mt-2">VS</p>
                                    </div>

                                    {/* Opponent */}
                                    <div className={`text-center p-4 rounded-xl ${challenge.winner && challenge.winner !== user?.id ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50'}`}>
                                        <p className="text-sm text-gray-600 mb-2">{challenge.opponent?.username || 'Opponent'}</p>
                                        <p className="text-3xl font-bold text-gray-800">{challenge.results?.find(r => r.userId !== user?.id)?.score || 0}%</p>
                                        {challenge.winner && challenge.winner !== user?.id && (
                                            <div className="mt-2 text-center w-full flex justify-center">
                                                <Trophy className="inline text-yellow-500" size={24} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Result */}
                                <div className={`text-center p-4 rounded-xl ${challenge.winner === user?.id ? 'bg-green-100' : 'bg-red-100'}`}>
                                    {challenge.winner === user?.id ? (
                                        <p className="font-bold text-green-700">
                                            🎉 You Won! +{challenge.wager} XP
                                        </p>
                                    ) : (
                                        <p className="font-bold text-red-700">
                                            You Lost -{challenge.wager} XP
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                        {completedChallenges.length === 0 && (
                            <div className="text-center py-12 text-gray-500 bg-white rounded-2xl shadow-lg">
                                <p>No completed challenges yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* History */}
                {activeTab === 'history' && (
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Challenge History</h2>
                        <div className="space-y-3">
                            {completedChallenges.length > 0 ? (
                                [...completedChallenges].reverse().map((challenge, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${challenge.winner === user?.id ? 'bg-green-100' : 'bg-red-100'}`}>
                                                {challenge.winner === user?.id ? (
                                                    <Check className="text-green-600" size={24} />
                                                ) : (
                                                    <X className="text-red-600" size={24} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">vs {challenge.opponent?.username}</p>
                                                <p className="text-sm text-gray-600">{challenge.quiz?.title}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-800">
                                                {challenge.results?.find(r => r.userId === user?.id)?.score || 0}% - {challenge.results?.find(r => r.userId !== user?.id)?.score || 0}%
                                            </p>
                                            <p className="text-sm text-gray-600">{new Date(challenge.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">No challenge history available.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Challenges;
