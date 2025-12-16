// src/utils/socialMockData.js
export const mockSocialData = {
    friends: [
        {
            userId: 's1',
            username: 'Alice Johnson',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
            level: 25,
            status: 'online',
            lastSeen: new Date().toISOString(),
            mutualFriends: 5,
            friendSince: '2024-01-01',
            stats: {
                quizzes: 150,
                avgScore: 92,
                rank: 15
            }
        },
        {
            userId: 's2',
            username: 'Bob Smith',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
            level: 23,
            status: 'offline',
            lastSeen: '2024-01-15T08:30:00Z',
            mutualFriends: 3,
            friendSince: '2024-01-05',
            stats: {
                quizzes: 120,
                avgScore: 88,
                rank: 25
            }
        },
        {
            userId: 's3',
            username: 'Carol White',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol',
            level: 22,
            status: 'away',
            lastSeen: '2024-01-15T10:00:00Z',
            mutualFriends: 7,
            friendSince: '2024-01-10',
            stats: {
                quizzes: 100,
                avgScore: 85,
                rank: 30
            }
        }
    ],

    friendRequests: {
        incoming: [
            {
                id: 'req1',
                from: {
                    userId: 's4',
                    username: 'David Brown',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
                    level: 20
                },
                message: "Hey! Let's be friends!",
                createdAt: '2024-01-15T09:00:00Z'
            },
            {
                id: 'req2',
                from: {
                    userId: 's5',
                    username: 'Emma Davis',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
                    level: 19
                },
                message: "I saw you on the leaderboard!",
                createdAt: '2024-01-15T08:00:00Z'
            }
        ],
        outgoing: [
            {
                id: 'req3',
                to: {
                    userId: 's6',
                    username: 'Frank Wilson',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=frank',
                    level: 21
                },
                createdAt: '2024-01-14T10:00:00Z'
            }
        ]
    },

    challenges: [
        {
            id: 'challenge1',
            challenger: {
                userId: 'you',
                username: 'You',
                score: 85,
                time: 750,
                completed: true
            },
            opponent: {
                userId: 's1',
                username: 'Alice Johnson',
                score: 92,
                time: 645,
                completed: true
            },
            quiz: {
                id: 'quiz1',
                title: 'Mathematics Quiz',
                difficulty: 'medium'
            },
            wager: 100,
            status: 'completed',
            winner: 's1',
            createdAt: '2024-01-15T10:00:00Z'
        },
        {
            id: 'challenge2',
            challenger: {
                userId: 's2',
                username: 'Bob Smith',
                score: null,
                time: null,
                completed: false
            },
            opponent: {
                userId: 'you',
                username: 'You',
                score: null,
                time: null,
                completed: false
            },
            quiz: {
                id: 'quiz2',
                title: 'Science Quiz',
                difficulty: 'hard'
            },
            wager: 50,
            status: 'pending',
            winner: null,
            createdAt: '2024-01-15T11:00:00Z',
            expiresAt: '2024-01-16T11:00:00Z'
        }
    ],

    activityFeed: [
        {
            id: 'activity1',
            type: 'quiz_completed',
            user: {
                userId: 's1',
                username: 'Alice Johnson',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'
            },
            data: {
                quizTitle: 'Math Quiz',
                score: 95,
                difficulty: 'hard'
            },
            timestamp: '2024-01-15T10:30:00Z',
            likes: 12,
            comments: 3,
            isLiked: false
        },
        {
            id: 'activity2',
            type: 'achievement',
            user: {
                userId: 's2',
                username: 'Bob Smith',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'
            },
            data: {
                achievementName: 'Perfect Score',
                achievementIcon: '💯'
            },
            timestamp: '2024-01-15T09:00:00Z',
            likes: 8,
            comments: 2,
            isLiked: true
        },
        {
            id: 'activity3',
            type: 'level_up',
            user: {
                userId: 's3',
                username: 'Carol White',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol'
            },
            data: {
                newLevel: 22,
                xpEarned: 500
            },
            timestamp: '2024-01-15T08:00:00Z',
            likes: 15,
            comments: 5,
            isLiked: false
        },
        {
            id: 'activity4',
            type: 'challenge',
            user: {
                userId: 's1',
                username: 'Alice Johnson',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'
            },
            data: {
                opponent: 'You',
                result: 'won',
                quizTitle: 'Mathematics Quiz'
            },
            timestamp: '2024-01-15T07:00:00Z',
            likes: 6,
            comments: 1,
            isLiked: false
        }
    ]
};
