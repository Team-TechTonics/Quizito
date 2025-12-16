// src/utils/achievements.js
export const ACHIEVEMENT_CATEGORIES = {
    LEARNING: { id: 'learning', name: 'Learning Milestones', icon: '📚', color: 'blue' },
    ACCURACY: { id: 'accuracy', name: 'Accuracy Masters', icon: '🎯', color: 'green' },
    STREAK: { id: 'streak', name: 'Streak Warriors', icon: '🔥', color: 'orange' },
    SPEED: { id: 'speed', name: 'Speed Demons', icon: '⚡', color: 'yellow' },
    CHAMPION: { id: 'champion', name: 'Quiz Champions', icon: '🏆', color: 'purple' },
    SUBJECT: { id: 'subject', name: 'Subject Experts', icon: '👑', color: 'indigo' }
};

export const ACHIEVEMENTS = {
    // Learning Milestones
    FIRST_QUIZ: {
        id: 'first_quiz',
        name: 'First Steps',
        description: 'Complete your first quiz',
        icon: '🎯',
        category: 'learning',
        rarity: 'common',
        xpReward: 50,
        requirement: 1,
        type: 'one-time'
    },
    BOOKWORM: {
        id: 'bookworm',
        name: 'Bookworm',
        description: 'Complete 10 quizzes',
        icon: '📖',
        category: 'learning',
        rarity: 'common',
        xpReward: 100,
        requirement: 10,
        type: 'progressive'
    },
    SCHOLAR: {
        id: 'scholar',
        name: 'Scholar',
        description: 'Complete 50 quizzes',
        icon: '🎓',
        category: 'learning',
        rarity: 'rare',
        xpReward: 250,
        requirement: 50,
        type: 'progressive'
    },
    PROFESSOR: {
        id: 'professor',
        name: 'Professor',
        description: 'Complete 100 quizzes',
        icon: '👨‍🎓',
        category: 'learning',
        rarity: 'epic',
        xpReward: 500,
        requirement: 100,
        type: 'progressive'
    },

    // Accuracy Masters
    SHARP_SHOOTER: {
        id: 'sharp_shooter',
        name: 'Sharp Shooter',
        description: 'Maintain 90% average accuracy',
        icon: '🎯',
        category: 'accuracy',
        rarity: 'rare',
        xpReward: 200,
        requirement: 90,
        type: 'one-time'
    },
    PERFECTIONIST: {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Get 100% on any quiz',
        icon: '💯',
        category: 'accuracy',
        rarity: 'rare',
        xpReward: 150,
        requirement: 1,
        type: 'one-time'
    },
    SNIPER: {
        id: 'sniper',
        name: 'Sniper',
        description: 'Get 100% on 5 quizzes',
        icon: '🏹',
        category: 'accuracy',
        rarity: 'epic',
        xpReward: 300,
        requirement: 5,
        type: 'progressive'
    },

    // Streak Warriors
    ON_FIRE: {
        id: 'on_fire',
        name: 'On Fire',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        category: 'streak',
        rarity: 'common',
        xpReward: 100,
        requirement: 7,
        type: 'one-time'
    },
    LIGHTNING: {
        id: 'lightning',
        name: 'Lightning',
        description: 'Maintain a 14-day streak',
        icon: '⚡',
        category: 'streak',
        rarity: 'rare',
        xpReward: 200,
        requirement: 14,
        type: 'one-time'
    },
    SUPERNOVA: {
        id: 'supernova',
        name: 'Supernova',
        description: 'Maintain a 30-day streak',
        icon: '🌟',
        category: 'streak',
        rarity: 'epic',
        xpReward: 400,
        requirement: 30,
        type: 'one-time'
    },
    LEGEND: {
        id: 'legend',
        name: 'Legend',
        description: 'Maintain a 100-day streak',
        icon: '👑',
        category: 'streak',
        rarity: 'legendary',
        xpReward: 1000,
        requirement: 100,
        type: 'one-time'
    },

    // Speed Demons
    QUICK_DRAW: {
        id: 'quick_draw',
        name: 'Quick Draw',
        description: 'Complete a quiz in under 5 minutes',
        icon: '⚡',
        category: 'speed',
        rarity: 'common',
        xpReward: 75,
        requirement: 1,
        type: 'one-time'
    },
    SPEED_DEMON: {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete 10 quizzes under time limit',
        icon: '🚀',
        category: 'speed',
        rarity: 'rare',
        xpReward: 200,
        requirement: 10,
        type: 'progressive'
    },
    TIME_MASTER: {
        id: 'time_master',
        name: 'Time Master',
        description: 'Finish 25 quizzes with time to spare',
        icon: '⏱️',
        category: 'speed',
        rarity: 'epic',
        xpReward: 350,
        requirement: 25,
        type: 'progressive'
    },

    // Quiz Champions
    QUIZ_MASTER: {
        id: 'quiz_master',
        name: 'Quiz Master',
        description: 'Complete 25 quizzes',
        icon: '👑',
        category: 'champion',
        rarity: 'rare',
        xpReward: 200,
        requirement: 25,
        type: 'progressive'
    },
    CHAMPION: {
        id: 'champion',
        name: 'Champion',
        description: 'Rank in top 10 on leaderboard',
        icon: '🏆',
        category: 'champion',
        rarity: 'epic',
        xpReward: 500,
        requirement: 10,
        type: 'one-time'
    },
    GRAND_MASTER: {
        id: 'grand_master',
        name: 'Grand Master',
        description: 'Reach level 50',
        icon: '👑',
        category: 'champion',
        rarity: 'legendary',
        xpReward: 1000,
        requirement: 50,
        type: 'one-time'
    },

    // Subject Experts
    MATH_WIZARD: {
        id: 'math_wizard',
        name: 'Math Wizard',
        description: 'Score 95%+ on 5 math quizzes',
        icon: '🧮',
        category: 'subject',
        rarity: 'rare',
        xpReward: 200,
        requirement: 5,
        type: 'progressive'
    },
    SCIENCE_GURU: {
        id: 'science_guru',
        name: 'Science Guru',
        description: 'Score 95%+ on 5 science quizzes',
        icon: '🔬',
        category: 'subject',
        rarity: 'rare',
        xpReward: 200,
        requirement: 5,
        type: 'progressive'
    },
    HISTORY_BUFF: {
        id: 'history_buff',
        name: 'History Buff',
        description: 'Score 95%+ on 5 history quizzes',
        icon: '📜',
        category: 'subject',
        rarity: 'rare',
        xpReward: 200,
        requirement: 5,
        type: 'progressive'
    },
    GEOGRAPHY_EXPERT: {
        id: 'geography_expert',
        name: 'Geography Expert',
        description: 'Score 95%+ on 5 geography quizzes',
        icon: '🌍',
        category: 'subject',
        rarity: 'rare',
        xpReward: 200,
        requirement: 5,
        type: 'progressive'
    }
};

export const RARITY_COLORS = {
    common: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
    rare: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    epic: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
    legendary: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' }
};

// Helper functions
export function calculateLevel(totalXP) {
    return Math.floor(Math.sqrt(totalXP / 50));
}

export function xpForNextLevel(currentLevel) {
    return (currentLevel + 1) ** 2 * 50;
}

export function xpForCurrentLevel(currentLevel) {
    return currentLevel ** 2 * 50;
}

export function calculateQuizXP(quiz, performance) {
    let xp = 0;

    // Base points (10 per correct answer)
    xp += (performance.correctAnswers || 0) * 10;

    // Perfect bonus
    if (performance.score === 100) xp += 50;

    // Speed bonus (if faster than average)
    if (performance.avgTime && quiz.avgTime && performance.avgTime < quiz.avgTime) {
        xp += 20;
    }

    // Streak bonus
    if (performance.streak && performance.streak > 0) {
        xp += performance.streak * 5;
    }

    return xp;
}
