// src/components/social/ActivityFeed.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Trophy, TrendingUp, Target, Swords, Loader } from 'lucide-react';
import { socialService } from '../../services';
import toast from 'react-hot-toast';

const ActivityFeed = ({ limit = null }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const data = await socialService.getActivityFeed();
            setActivities(data || []);
        } catch (error) {
            console.error('Failed to fetch activity feed:', error);
            // toast.error('Failed to load activity feed'); // Silent fail for feed to not annoy user
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (activityId) => {
        try {
            // Optimistic update
            setActivities(prevActivities => prevActivities.map(activity =>
                activity.id === activityId
                    ? { ...activity, isLiked: !activity.isLiked, likes: activity.isLiked ? activity.likes - 1 : activity.likes + 1 }
                    : activity
            ));

            // Call API (assuming we had a like endpoint, for now simulate or add to service)
            // await socialService.likeActivity(activityId); 
        } catch (error) {
            console.error('Failed to like activity:', error);
            toast.error('Failed to like activity');
            // Revert on error would go here
        }
    };

    const displayActivities = limit ? activities.slice(0, limit) : activities;

    const getActivityIcon = (type) => {
        switch (type) {
            case 'quiz_completed': return <Target className="text-blue-600" size={24} />;
            case 'achievement': return <Trophy className="text-yellow-600" size={24} />;
            case 'level_up': return <TrendingUp className="text-green-600" size={24} />;
            case 'challenge': return <Swords className="text-purple-600" size={24} />;
            default: return <Target className="text-gray-600" size={24} />;
        }
    };

    const getActivityText = (activity) => {
        const { data } = activity;
        switch (activity.type) {
            case 'quiz_completed':
                return (
                    <>
                        completed <span className="font-semibold">{data.quizTitle}</span> with a score of{' '}
                        <span className="font-bold text-green-600">{data.score}%</span>
                    </>
                );
            case 'achievement':
                return (
                    <>
                        unlocked the achievement{' '}
                        <span className="font-semibold">{data.achievementIcon} {data.achievementName}</span>
                    </>
                );
            case 'level_up':
                return (
                    <>
                        leveled up to <span className="font-bold text-indigo-600">Level {data.newLevel}</span>!{' '}
                        <span className="text-sm text-gray-600">(+{data.xpEarned} XP)</span>
                    </>
                );
            case 'challenge':
                return (
                    <>
                        {data.result === 'won' ? 'defeated' : 'lost to'}{' '}
                        <span className="font-semibold">{data.opponent}</span> in{' '}
                        <span className="font-semibold">{data.quizTitle}</span>
                    </>
                );
            default:
                return 'had an activity';
        }
    };

    const getTimeAgo = (timestamp) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader className="animate-spin text-gray-400" size={24} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {displayActivities.map((activity, index) => (
                <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                    <div className="flex items-start space-x-4">
                        {/* Avatar */}
                        <img
                            src={activity.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.user?.username}`}
                            alt={activity.user?.username || 'User'}
                            className="w-12 h-12 rounded-full border-2 border-gray-200"
                        />

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    <p className="font-bold text-gray-800">{activity.user?.username || 'Unknown User'}</p>
                                    <span className="text-gray-400">·</span>
                                    <p className="text-sm text-gray-500">{getTimeAgo(activity.timestamp)}</p>
                                </div>
                                {getActivityIcon(activity.type)}
                            </div>

                            <p className="text-gray-700 mb-3">
                                {getActivityText(activity)}
                            </p>

                            {/* Actions */}
                            <div className="flex items-center space-x-6">
                                <button
                                    onClick={() => handleLike(activity.id)}
                                    className={`flex items-center space-x-2 transition-colors ${activity.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                                        }`}
                                >
                                    <Heart
                                        size={18}
                                        fill={activity.isLiked ? 'currentColor' : 'none'}
                                    />
                                    <span className="text-sm font-semibold">{activity.likes}</span>
                                </button>

                                <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                                    <MessageCircle size={18} />
                                    <span className="text-sm font-semibold">{activity.comments}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}

            {displayActivities.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                    <Target size={48} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Activity Yet</h3>
                    <p className="text-gray-600">Add friends to see their activity!</p>
                </div>
            )}
        </div>
    );
};

export default ActivityFeed;
