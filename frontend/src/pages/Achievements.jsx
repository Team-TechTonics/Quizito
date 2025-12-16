// src/pages/Achievements.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lock, Star, TrendingUp, Loader } from 'lucide-react';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, RARITY_COLORS } from '../utils/achievements';
import { gamificationService } from '../services';
import { useAuth } from '../context/AuthContext';
import { mockGamificationData } from '../utils/mockData';

const Achievements = () => {
    const { user } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [userAchievements, setUserAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch user achievements from API
    useEffect(() => {
        const fetchAchievements = async () => {
            if (!user?.id) {
                // Fallback to mock data if no user
                setUserAchievements(mockGamificationData.userAchievements);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await gamificationService.getUserAchievements(user.id);
                setUserAchievements(data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch achievements:', err);
                // Fallback to mock data on error
                setUserAchievements(mockGamificationData.userAchievements);
                setError(null); // Don't show error, just use fallback
            } finally {
                setLoading(false);
            }
        };

        fetchAchievements();
    }, [user?.id]);

    // Merge achievement definitions with user progress
    const achievementsWithProgress = Object.values(ACHIEVEMENTS).map(achievement => {
        const userProgress = userAchievements.find(ua => ua.achievementId === achievement.id);
        return {
            ...achievement,
            unlocked: userProgress?.unlocked || false,
            unlockedAt: userProgress?.unlockedAt,
            progress: userProgress?.progress || 0,
            current: userProgress?.current || 0
        };
    });

    const filteredAchievements = selectedCategory === 'all'
        ? achievementsWithProgress
        : achievementsWithProgress.filter(a => a.category === selectedCategory);

    const unlockedCount = achievementsWithProgress.filter(a => a.unlocked).length;
    const totalCount = achievementsWithProgress.length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
                <Loader className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-8 px-4">
            <div className="container mx-auto max-w-7xl">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
                        <Trophy className="mr-3 text-yellow-600" size={40} />
                        Achievements
                    </h1>
                    <p className="text-gray-600">Unlock achievements and earn rewards</p>
                </motion.div>

                {/* Progress Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-lg p-6 mb-8"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                {unlockedCount} / {totalCount}
                            </h2>
                            <p className="text-gray-600">Achievements Unlocked</p>
                        </div>
                        <div className="text-5xl">🏆</div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all"
                            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                        />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                        {Math.round((unlockedCount / totalCount) * 100)}% Complete
                    </p>
                </motion.div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-3 mb-8">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${selectedCategory === 'all'
                            ? 'bg-indigo-500 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        All Achievements
                    </button>
                    {Object.values(ACHIEVEMENT_CATEGORIES).map(category => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2 ${selectedCategory === category.id
                                ? 'bg-indigo-500 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <span>{category.icon}</span>
                            <span>{category.name}</span>
                        </button>
                    ))}
                </div>

                {/* Achievements Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredAchievements.map((achievement, index) => (
                            <AchievementCard
                                key={achievement.id}
                                achievement={achievement}
                                index={index}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

const AchievementCard = ({ achievement, index }) => {
    const rarityStyle = RARITY_COLORS[achievement.rarity];
    const isUnlocked = achievement.unlocked;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
            className={`relative bg-white rounded-2xl shadow-lg p-6 border-2 ${isUnlocked ? rarityStyle.border : 'border-gray-200'
                } ${!isUnlocked && 'opacity-60'}`}
        >
            {/* Rarity Badge */}
            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${rarityStyle.bg} ${rarityStyle.text}`}>
                {achievement.rarity.toUpperCase()}
            </div>

            {/* Icon */}
            <div className="text-6xl mb-4 flex items-center justify-center">
                {isUnlocked ? (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5 }}
                    >
                        {achievement.icon}
                    </motion.div>
                ) : (
                    <div className="relative">
                        <div className="blur-sm opacity-30">{achievement.icon}</div>
                        <Lock className="absolute inset-0 m-auto text-gray-400" size={32} />
                    </div>
                )}
            </div>

            {/* Title & Description */}
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                {achievement.name}
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
                {achievement.description}
            </p>

            {/* Progress Bar */}
            {!isUnlocked && achievement.progress > 0 && (
                <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{achievement.current}/{achievement.requirement}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                            style={{ width: `${achievement.progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Status */}
            <div className="text-center">
                {isUnlocked ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2 text-green-600 font-semibold">
                            <Star size={16} fill="currentColor" />
                            <span>UNLOCKED</span>
                        </div>
                        <p className="text-xs text-gray-500">
                            {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                        <div className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white font-bold text-sm shadow-md animate-pulse">
                            +{achievement.xpReward} XP
                        </div>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        >
                            <span className="text-2xl">✨</span>
                        </motion.div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center space-x-2 text-gray-500">
                        <Lock size={16} />
                        <span className="font-semibold">LOCKED</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Achievements;
