// src/utils/mockData.js
export const mockStudentProgress = {
    userId: "student123",
    level: 12,
    xp: 2450,
    xpToNextLevel: 3000,
    streak: 15,
    totalQuizzes: 47,
    averageScore: 89,

    performanceBySubject: {
        "Mathematics": { score: 85, quizzes: 12, totalQuestions: 120 },
        "Science": { score: 92, quizzes: 8, totalQuestions: 80 },
        "History": { score: 67, quizzes: 5, totalQuestions: 50 },
        "Geography": { score: 78, quizzes: 6, totalQuestions: 60 },
        "English": { score: 88, quizzes: 10, totalQuestions: 100 },
        "Computer Science": { score: 95, quizzes: 6, totalQuestions: 60 }
    },

    scoreHistory: [
        { date: "2024-01-01", score: 75 },
        { date: "2024-01-05", score: 80 },
        { date: "2024-01-10", score: 78 },
        { date: "2024-01-15", score: 85 },
        { date: "2024-01-20", score: 88 },
        { date: "2024-01-25", score: 90 },
        { date: "2024-01-30", score: 89 }
    ],

    subjectRadar: [
        { subject: "Math", score: 85 },
        { subject: "Science", score: 92 },
        { subject: "History", score: 67 },
        { subject: "Geography", score: 78 },
        { subject: "English", score: 88 },
        { subject: "CS", score: 95 }
    ],

    timeByCategory: [
        { name: "Mathematics", value: 180, color: "#8b5cf6" },
        { name: "Science", value: 120, color: "#3b82f6" },
        { name: "History", value: 75, color: "#f59e0b" },
        { name: "Geography", value: 90, color: "#10b981" },
        { name: "English", value: 150, color: "#ec4899" },
        { name: "Computer Science", value: 90, color: "#6366f1" }
    ],

    difficultyBreakdown: [
        { difficulty: "Easy", completed: 15, total: 20 },
        { difficulty: "Medium", completed: 22, total: 25 },
        { difficulty: "Hard", completed: 10, total: 15 }
    ],

    strengths: ["Science", "Computer Science", "English"],
    weaknesses: ["History", "Geography"],

    achievements: [
        {
            id: "1",
            name: "First Quiz",
            description: "Completed your first quiz",
            date: "2024-01-01",
            icon: "🎯"
        },
        {
            id: "2",
            name: "Perfect Score",
            description: "Got 100% on a quiz",
            date: "2024-01-10",
            icon: "💯"
        },
        {
            id: "3",
            name: "Week Warrior",
            description: "7 day streak",
            date: "2024-01-15",
            icon: "🔥"
        },
        {
            id: "4",
            name: "Quiz Master",
            description: "Completed 25 quizzes",
            date: "2024-01-20",
            icon: "👑"
        }
    ],

    studyStats: {
        totalTime: 705, // minutes (11.75 hours)
        avgDuration: 15,
        bestTimeOfDay: "Morning",
        consistency: 85,
        longestStreak: 21,
        currentStreak: 15
    },

    recentActivity: [
        {
            type: "quiz",
            title: "Advanced Calculus",
            score: 92,
            date: "2024-01-30",
            category: "Mathematics"
        },
        {
            type: "achievement",
            title: "Quiz Master",
            date: "2024-01-28"
        },
        {
            type: "quiz",
            title: "World War II",
            score: 78,
            date: "2024-01-27",
            category: "History"
        }
    ]
};

export const mockEducatorAnalytics = {
    classId: "class123",
    className: "Mathematics 101",
    students: 30,
    activeStudents: 28,
    averageScore: 82,
    improvement: 5,
    avgCompletion: 15,

    performanceHistory: [
        { date: "Week 1", avgScore: 75 },
        { date: "Week 2", avgScore: 78 },
        { date: "Week 3", avgScore: 80 },
        { date: "Week 4", avgScore: 82 }
    ],

    scoreDistribution: [
        { range: "0-20", count: 1 },
        { range: "21-40", count: 2 },
        { range: "41-60", count: 5 },
        { range: "61-80", count: 12 },
        { range: "81-100", count: 10 }
    ],

    studentList: [
        {
            id: "s1",
            name: "Alice Johnson",
            score: 95,
            quizzes: 12,
            lastActive: "2024-01-30",
            trend: "up"
        },
        {
            id: "s2",
            name: "Bob Smith",
            score: 88,
            quizzes: 11,
            lastActive: "2024-01-29",
            trend: "stable"
        },
        {
            id: "s3",
            name: "Carol White",
            score: 76,
            quizzes: 10,
            lastActive: "2024-01-28",
            trend: "down"
        }
    ],

    questionAnalysis: [
        {
            questionId: "q1",
            text: "What is the derivative of x²?",
            accuracy: 95,
            avgTime: 12,
            difficulty: "Easy"
        },
        {
            questionId: "q2",
            text: "Solve the integral of sin(x)",
            accuracy: 68,
            avgTime: 45,
            difficulty: "Medium"
        },
        {
            questionId: "q3",
            text: "Apply L'Hôpital's rule",
            accuracy: 42,
            avgTime: 90,
            difficulty: "Hard"
        }
    ],

    engagement: {
        participationRate: 93,
        avgCompletionTime: 15,
        dropOffRate: 7,
        peakHours: [9, 14, 18],
        weeklyActivity: [
            { day: "Mon", quizzes: 45 },
            { day: "Tue", quizzes: 52 },
            { day: "Wed", quizzes: 48 },
            { day: "Thu", quizzes: 55 },
            { day: "Fri", quizzes: 38 },
            { day: "Sat", quizzes: 20 },
            { day: "Sun", quizzes: 15 }
        ]
    }
};

// Gamification Data
export const mockGamificationData = {
    userAchievements: [
        {
            achievementId: 'first_quiz',
            unlocked: true,
            unlockedAt: '2024-01-01',
            progress: 100
        },
        {
            achievementId: 'perfectionist',
            unlocked: true,
            unlockedAt: '2024-01-10',
            progress: 100
        },
        {
            achievementId: 'on_fire',
            unlocked: true,
            unlockedAt: '2024-01-15',
            progress: 100
        },
        {
            achievementId: 'quiz_master',
            unlocked: true,
            unlockedAt: '2024-01-20',
            progress: 100
        },
        {
            achievementId: 'bookworm',
            unlocked: false,
            progress: 70,
            current: 7,
            requirement: 10
        },
        {
            achievementId: 'scholar',
            unlocked: false,
            progress: 94,
            current: 47,
            requirement: 50
        },
        {
            achievementId: 'lightning',
            unlocked: false,
            progress: 50,
            current: 7,
            requirement: 14
        }
    ],

    leaderboard: {
        global: [
            {
                rank: 1,
                userId: 's1',
                username: 'Alice Johnson',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
                level: 25,
                xp: 12450,
                streak: 45,
                badges: 23,
                trend: 'up'
            },
            {
                rank: 2,
                userId: 's2',
                username: 'Bob Smith',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
                level: 23,
                xp: 11200,
                streak: 30,
                badges: 20,
                trend: 'stable'
            },
            {
                rank: 3,
                userId: 's3',
                username: 'Carol White',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol',
                level: 22,
                xp: 10800,
                streak: 25,
                badges: 18,
                trend: 'up'
            },
            {
                rank: 4,
                userId: 's4',
                username: 'David Brown',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
                level: 20,
                xp: 9500,
                streak: 20,
                badges: 16,
                trend: 'down'
            },
            {
                rank: 5,
                userId: 's5',
                username: 'Emma Davis',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
                level: 19,
                xp: 8900,
                streak: 18,
                badges: 15,
                trend: 'up'
            }
        ]
    }
};
