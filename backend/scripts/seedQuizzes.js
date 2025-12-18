const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const sampleQuizzes = [
    {
        title: "JavaScript Mastery",
        description: "Test your knowledge of advanced JavaScript concepts, closures, and async programming.",
        category: "Technology",
        difficulty: "hard",
        questions: [
            {
                question: "What is the output of typeof null?",
                type: "multiple-choice",
                options: [
                    { text: "object", isCorrect: true },
                    { text: "null", isCorrect: false },
                    { text: "undefined", isCorrect: false },
                    { text: "number", isCorrect: false }
                ],
                points: 100,
                timeLimit: 30
            },
            {
                question: "Which method creates a new array with all elements that pass the test implemented by the provided function?",
                type: "multiple-choice",
                options: [
                    { text: "map()", isCorrect: false },
                    { text: "filter()", isCorrect: true },
                    { text: "reduce()", isCorrect: false },
                    { text: "forEach()", isCorrect: false }
                ],
                points: 100,
                timeLimit: 30
            }
        ],
        tags: ["javascript", "programming", "web-dev"]
    },
    {
        title: "World Capitals Challenge",
        description: "Travel around the world and identify the capitals of various countries.",
        category: "Geography",
        difficulty: "medium",
        questions: [
            {
                question: "What is the capital of Australia?",
                type: "multiple-choice",
                options: [
                    { text: "Sydney", isCorrect: false },
                    { text: "Melbourne", isCorrect: false },
                    { text: "Canberra", isCorrect: true },
                    { text: "Perth", isCorrect: false }
                ],
                points: 100,
                timeLimit: 20
            },
            {
                question: "What is the capital of Brazil?",
                type: "multiple-choice",
                options: [
                    { text: "Rio de Janeiro", isCorrect: false },
                    { text: "Brasilia", isCorrect: true },
                    { text: "Sao Paulo", isCorrect: false },
                    { text: "Salvador", isCorrect: false }
                ],
                points: 100,
                timeLimit: 20
            }
        ],
        tags: ["geography", "travel", "world"]
    },
    {
        title: "The Solar System",
        description: "Explore our neighborhood in space. Planets, moons, and stars.",
        category: "Science",
        difficulty: "easy",
        questions: [
            {
                question: "Which planet is known as the Red Planet?",
                type: "multiple-choice",
                options: [
                    { text: "Venus", isCorrect: false },
                    { text: "Mars", isCorrect: true },
                    { text: "Jupiter", isCorrect: false },
                    { text: "Saturn", isCorrect: false }
                ],
                points: 100,
                timeLimit: 15
            },
            {
                question: "Which is the largest planet in our solar system?",
                type: "multiple-choice",
                options: [
                    { text: "Earth", isCorrect: false },
                    { text: "Jupiter", isCorrect: true },
                    { text: "Saturn", isCorrect: false },
                    { text: "Neptune", isCorrect: false }
                ],
                points: 100,
                timeLimit: 15
            }
        ],
        tags: ["science", "astronomy", "space"]
    },
    {
        title: "80s Music Trivia",
        description: "Relive the greatest decade of music. Pop, Rock, and New Wave.",
        category: "Music",
        difficulty: "medium",
        questions: [
            {
                question: "Who is known as the King of Pop?",
                type: "multiple-choice",
                options: [
                    { text: "Prince", isCorrect: false },
                    { text: "Michael Jackson", isCorrect: true },
                    { text: "Madonna", isCorrect: false },
                    { text: "David Bowie", isCorrect: false }
                ],
                points: 100,
                timeLimit: 20
            },
            {
                question: "Which band released 'Sweet Child O' Mine'?",
                type: "multiple-choice",
                options: [
                    { text: "Bon Jovi", isCorrect: false },
                    { text: "Guns N' Roses", isCorrect: true },
                    { text: "Metallica", isCorrect: false },
                    { text: "Aerosmith", isCorrect: false }
                ],
                points: 100,
                timeLimit: 20
            }
        ],
        tags: ["music", "80s", "pop-culture"]
    },
    {
        title: "Marvel Cinematic Universe",
        description: "Test your knowledge of the MCU movies and characters.",
        category: "Entertainment",
        difficulty: "medium",
        questions: [
            {
                question: "What is the name of Thor's hammer?",
                type: "multiple-choice",
                options: [
                    { text: "Mjolnir", isCorrect: true },
                    { text: "Stormbreaker", isCorrect: false },
                    { text: "Gungnir", isCorrect: false },
                    { text: "Aegis", isCorrect: false }
                ],
                points: 100,
                timeLimit: 20
            },
            {
                question: "Who is the Winter Soldier?",
                type: "multiple-choice",
                options: [
                    { text: "Steve Rogers", isCorrect: false },
                    { text: "Bucky Barnes", isCorrect: true },
                    { text: "Sam Wilson", isCorrect: false },
                    { text: "Clint Barton", isCorrect: false }
                ],
                points: 100,
                timeLimit: 20
            }
        ],
        tags: ["marvel", "movies", "superheroes"]
    },
    {
        title: "Ancient History",
        description: "Dive into the past. Rome, Greece, Egypt and more.",
        category: "History",
        difficulty: "hard",
        questions: [
            {
                question: "Who was the first Emperor of Rome?",
                type: "multiple-choice",
                options: [
                    { text: "Julius Caesar", isCorrect: false },
                    { text: "Augustus", isCorrect: true },
                    { text: "Nero", isCorrect: false },
                    { text: "Caligula", isCorrect: false }
                ],
                points: 100,
                timeLimit: 30
            },
            {
                question: "Which civilization built the Machu Picchu?",
                type: "multiple-choice",
                options: [
                    { text: "Aztec", isCorrect: false },
                    { text: "Inca", isCorrect: true },
                    { text: "Maya", isCorrect: false },
                    { text: "Olmec", isCorrect: false }
                ],
                points: 100,
                timeLimit: 30
            }
        ],
        tags: ["history", "ancient", "civilizations"]
    }
];

const seedDB = async () => {
    try {
        console.log('🌱 Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find a host user to assign quizzes to
        const adminUser = await User.findOne();
        if (!adminUser) {
            console.log('❌ No users found. Create a user first.');
            process.exit(1);
        }

        console.log(`👤 Assigning quizzes to user: ${adminUser.username}`);

        // Create quizzes objects
        const quizzesToInsert = sampleQuizzes.map(quiz => ({
            ...quiz,
            user: adminUser._id,
            creator: adminUser._id,
            createdBy: adminUser._id,
            status: 'published',
            popularity: Math.floor(Math.random() * 1000)
        }));

        // Delete old ones
        await Quiz.deleteMany({ title: { $in: sampleQuizzes.map(q => q.title) } });

        // Use loop to trigger pre-save hooks (slug generation)
        let count = 0;
        for (const quizData of quizzesToInsert) {
            const quiz = new Quiz(quizData);
            await quiz.save();
            count++;
            console.log(`- Created: ${quiz.title}`);
        }

        console.log(`✅ Successfully seeded ${count} quizzes!`);
        console.log('   Go to the Explore page to see them.');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
        if (err.errors) {
            Object.keys(err.errors).forEach(key => {
                console.error(`- ${key}: ${err.errors[key].message}`);
            });
        }
        process.exit(1);
    }
};

seedDB();
