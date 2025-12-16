// src/services/recommendationService.js

/**
 * Service to analyze user performance and generate learning recommendations.
 */

// Mock data for available content - normally fetched from API
const ALL_TOPICS = [
    { id: 'math_001', title: 'Algebra Basics', category: 'Mathematics', difficulty: 'easy' },
    { id: 'math_002', title: 'Advanced Calculus', category: 'Mathematics', difficulty: 'hard' },
    { id: 'sci_001', title: 'Physics: Mechanics', category: 'Science', difficulty: 'medium' },
    { id: 'cs_001', title: 'Python Fundamentals', category: 'Computer Science', difficulty: 'easy' },
    { id: 'cs_002', title: 'Data Structures', category: 'Computer Science', difficulty: 'medium' }
];

export const recommendationService = {
    /**
     * Analyze user's quiz history to identify weak areas.
     * @param {Array} history - List of past quiz attempts
     * @returns {Array} List of recommendations
     */
    getRecommendations: (history = []) => {
        // 1. Identify weak topics (score < 70%)
        const weakAreas = history.filter(attempt => attempt.score < 70);

        // 2. Group by category
        const categoryCounts = {};
        weakAreas.forEach(item => {
            const category = item.quizCategory || 'General';
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });

        // 3. Find most frequent weak category
        const weakCategory = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])[0];

        // 4. Generate recommendations
        let recommended = [];

        if (weakCategory) {
            // Suggest easier content in weak category
            recommended = ALL_TOPICS.filter(t =>
                t.category === weakCategory && t.difficulty === 'easy'
            ).map(t => ({
                ...t,
                reason: `Because you struggled with ${weakCategory}`,
                type: 'Review'
            }));
        }

        // If no specific weakness found or history is empty, suggest trending/next steps
        if (recommended.length === 0) {
            // specific logic for "Next Steps" based on last successful quiz could go here
            // distinct from "weakness" logic
            recommended = [
                {
                    id: 'rec_001',
                    title: 'Intro to Algorithms',
                    category: 'Computer Science',
                    reason: 'Popular among students like you',
                    type: 'Trending',
                    difficulty: 'medium'
                },
                {
                    id: 'rec_002',
                    title: 'World History',
                    category: 'History',
                    reason: 'Expand your knowledge',
                    type: 'New',
                    difficulty: 'easy'
                }
            ];
        }

        return recommended.slice(0, 3); // Return top 3
    }
};
