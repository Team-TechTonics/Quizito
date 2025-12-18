// backend/services/analyticsService.js
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Session = require('../models/Session');

class AnalyticsService {
    /**
     * Get overall platform statistics
     */
    async getPlatformStats(timeRange = 'week') {
        const dateFilter = this.getDateFilter(timeRange);

        const [
            totalUsers,
            activeUsers,
            totalQuizzes,
            activeSessions,
            completedSessions
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ lastActive: { $gte: dateFilter } }),
            Quiz.countDocuments(),
            Session.countDocuments({ status: 'active' }),
            Session.countDocuments({
                status: 'completed',
                endedAt: { $gte: dateFilter }
            })
        ]);

        // Calculate average session time
        const sessions = await Session.find({
            status: 'completed',
            endedAt: { $gte: dateFilter }
        }).select('startedAt endedAt');

        const avgSessionTime = sessions.reduce((acc, session) => {
            const duration = (session.endedAt - session.startedAt) / 1000 / 60; // minutes
            return acc + duration;
        }, 0) / (sessions.length || 1);

        return {
            totalUsers,
            activeUsers,
            totalQuizzes,
            activeSessions,
            avgSessionTime: Math.round(avgSessionTime),
            completedSessions,
            userGrowth: await this.calculateGrowth('users', timeRange),
            quizGrowth: await this.calculateGrowth('quizzes', timeRange)
        };
    }

    /**
     * Get user activity data for charts
     */
    async getUserActivity(timeRange = 'week') {
        const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
        const labels = [];
        const quizzesCreated = [];
        const activeUsers = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

            const [quizCount, userCount] = await Promise.all([
                Quiz.countDocuments({
                    createdAt: { $gte: date, $lt: nextDate }
                }),
                User.countDocuments({
                    lastActive: { $gte: date, $lt: nextDate }
                })
            ]);

            quizzesCreated.push(quizCount);
            activeUsers.push(userCount);
        }

        return { labels, quizzesCreated, activeUsers };
    }

    /**
     * Get category distribution
     */
    async getCategoryDistribution() {
        const categories = await Quiz.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const total = categories.reduce((sum, cat) => sum + cat.count, 0);

        return categories.map(cat => ({
            label: cat._id || 'Uncategorized',
            value: cat.count,
            percentage: Math.round((cat.count / total) * 100)
        }));
    }

    /**
     * Get recent quizzes
     */
    async getRecentQuizzes(limit = 5) {
        const quizzes = await Quiz.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('createdBy', 'username')
            .lean();

        return Promise.all(quizzes.map(async (quiz) => {
            const participants = await Session.aggregate([
                { $match: { quizId: quiz._id } },
                { $unwind: '$participants' },
                { $group: { _id: null, count: { $sum: 1 } } }
            ]);

            return {
                id: quiz._id,
                title: quiz.title,
                participants: participants[0]?.count || 0,
                date: quiz.createdAt,
                status: quiz.isActive ? 'active' : 'completed',
                creator: quiz.createdBy?.username || 'Unknown'
            };
        }));
    }

    /**
     * Helper: Get date filter based on time range
     */
    getDateFilter(timeRange) {
        const now = new Date();
        switch (timeRange) {
            case 'day':
                return new Date(now.setDate(now.getDate() - 1));
            case 'week':
                return new Date(now.setDate(now.getDate() - 7));
            case 'month':
                return new Date(now.setMonth(now.getMonth() - 1));
            case 'year':
                return new Date(now.setFullYear(now.getFullYear() - 1));
            default:
                return new Date(0); // All time
        }
    }

    /**
     * Helper: Calculate growth percentage
     */
    async calculateGrowth(type, timeRange) {
        const Model = type === 'users' ? User : Quiz;
        const dateFilter = this.getDateFilter(timeRange);
        const previousDateFilter = new Date(dateFilter);
        const timeDiff = Date.now() - dateFilter.getTime();
        previousDateFilter.setTime(previousDateFilter.getTime() - timeDiff);

        const [current, previous] = await Promise.all([
            Model.countDocuments({ createdAt: { $gte: dateFilter } }),
            Model.countDocuments({
                createdAt: { $gte: previousDateFilter, $lt: dateFilter }
            })
        ]);

        if (previous === 0) return '+100%';
        const growth = ((current - previous) / previous) * 100;
        return `${growth > 0 ? '+' : ''}${Math.round(growth)}%`;
    }

    /**
     * Get detailed user analytics
     */
    async getUserAnalytics(userId) {
        // Import QuizResult here to avoid circular dependencies if any
        const QuizResult = require('../models/QuizResult');
        const User = require('../models/User');

        const [results, user] = await Promise.all([
            QuizResult.find({ userId }).sort({ completedAt: -1 }),
            User.findById(userId)
        ]);

        if (!results.length) {
            return {
                overview: {
                    totalQuizzesTaken: 0,
                    averageScore: 0,
                    currentStreak: user?.streak || 0,
                    rank: 0,
                    level: user?.level || 1,
                    experience: user?.xp || 0
                },
                recentPerformance: []
            };
        }

        const totalQuizzes = results.length;
        const totalScore = results.reduce((sum, r) => sum + (r.percentage || 0), 0);
        const averageScore = Math.round(totalScore / totalQuizzes);

        // Map recent activity
        const recentPerformance = results.slice(0, 5).map(r => ({
            quizTitle: r.quizId?.title || 'Unknown Quiz', // Populate if needed
            category: r.categoryBreakdown?.[0]?.category || 'General',
            date: r.completedAt,
            score: r.score,
            percentage: r.percentage
        }));

        return {
            overview: {
                totalQuizzesTaken: totalQuizzes,
                averageScore,
                currentStreak: user?.streak || 0,
                rank: 0, // Placeholder for global rank calculation
                level: user?.level || 1,
                experience: user?.xp || 0
            },
            recentPerformance
        };
    }
}

module.exports = new AnalyticsService();
