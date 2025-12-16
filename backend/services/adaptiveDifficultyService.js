// backend/services/adaptiveDifficultyService.js
const UserPerformance = require('../models/UserPerformance');

class AdaptiveDifficultyService {
    /**
     * Get or create user performance profile
     */
    async getUserPerformance(userId) {
        let performance = await UserPerformance.findOne({ userId });

        if (!performance) {
            performance = await UserPerformance.create({ userId });
        }

        return performance;
    }

    /**
     * Select next question based on user performance
     */
    async selectAdaptiveQuestion(userId, availableQuestions) {
        const performance = await this.getUserPerformance(userId);
        const targetDifficulty = performance.currentDifficultyLevel;

        // Score each question based on how well it matches target difficulty
        const scoredQuestions = availableQuestions.map(q => {
            const questionDifficulty = this.getQuestionDifficulty(q);
            const difficultyMatch = 1 - Math.abs(questionDifficulty - targetDifficulty);

            // Avoid recently answered questions
            const recentlyAnswered = performance.recentPerformance.some(
                p => p.questionId && p.questionId.toString() === q._id.toString()
            );
            const recencyPenalty = recentlyAnswered ? -0.5 : 0;

            return {
                question: q,
                score: difficultyMatch + recencyPenalty
            };
        });

        // Sort by score and return best match
        scoredQuestions.sort((a, b) => b.score - a.score);
        return scoredQuestions[0]?.question || availableQuestions[0];
    }

    /**
     * Get question difficulty (0-1 scale)
     */
    getQuestionDifficulty(question) {
        const difficultyMap = {
            'easy': 0.25,
            'medium': 0.5,
            'hard': 0.75
        };

        return difficultyMap[question.difficulty] || 0.5;
    }

    /**
     * Record answer and update performance
     */
    async recordAnswer(userId, answerData) {
        const performance = await this.getUserPerformance(userId);
        performance.recordAnswer(answerData);
        await performance.save();

        return {
            newDifficultyLevel: performance.currentDifficultyLevel,
            accuracy: performance.averageAccuracy
        };
    }

    /**
     * Get performance insights
     */
    async getPerformanceInsights(userId) {
        const performance = await this.getUserPerformance(userId);

        return {
            accuracy: Math.round(performance.averageAccuracy),
            totalQuestions: performance.totalQuestionsAnswered,
            difficultyLevel: performance.currentDifficultyLevel,
            recentTrend: this.calculateTrend(performance.recentPerformance)
        };
    }

    /**
     * Calculate performance trend
     */
    calculateTrend(recentPerformance) {
        if (recentPerformance.length < 5) return 'stable';

        const firstHalf = recentPerformance.slice(0, Math.floor(recentPerformance.length / 2));
        const secondHalf = recentPerformance.slice(Math.floor(recentPerformance.length / 2));

        const firstAccuracy = firstHalf.filter(p => p.isCorrect).length / firstHalf.length;
        const secondAccuracy = secondHalf.filter(p => p.isCorrect).length / secondHalf.length;

        if (secondAccuracy > firstAccuracy + 0.1) return 'improving';
        if (secondAccuracy < firstAccuracy - 0.1) return 'declining';
        return 'stable';
    }
}

module.exports = new AdaptiveDifficultyService();
