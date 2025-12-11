// backend/scripts/seedQuizzes.js
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
require('dotenv').config();

const quizzes = [
    // GENERAL KNOWLEDGE
    {
        title: "World Capitals Challenge",
        description: "Test your knowledge of world capitals across all continents",
        category: "General Knowledge",
        difficulty: "medium",
        timeLimit: 300,
        isPublic: true,
        questions: [
            {
                question: "What is the capital of Australia?",
                type: "multiple-choice",
                options: [
                    { text: "Sydney", isCorrect: false },
                    { text: "Canberra", isCorrect: true },
                    { text: "Melbourne", isCorrect: false },
                    { text: "Brisbane", isCorrect: false }
                ],
                points: 10,
                timeLimit: 30,
                difficulty: "easy",
                explanation: "Canberra is the capital of Australia, chosen as a compromise between Sydney and Melbourne."
            },
            {
                question: "Which city is the capital of Canada?",
                type: "multiple-choice",
                options: [
                    { text: "Toronto", isCorrect: false },
                    { text: "Vancouver", isCorrect: false },
                    { text: "Ottawa", isCorrect: true },
                    { text: "Montreal", isCorrect: false }
                ],
                points: 10,
                timeLimit: 30,
                difficulty: "easy"
            },
            {
                question: "What is the capital of Brazil?",
                type: "multiple-choice",
                options: [
                    { text: "Rio de Janeiro", isCorrect: false },
                    { text: "São Paulo", isCorrect: false },
                    { text: "Brasília", isCorrect: true },
                    { text: "Salvador", isCorrect: false }
                ],
                points: 10,
                timeLimit: 30,
                difficulty: "medium"
            },
            {
                question: "Which city serves as the capital of Switzerland?",
                type: "multiple-choice",
                options: [
                    { text: "Zurich", isCorrect: false },
                    { text: "Geneva", isCorrect: false },
                    { text: "Bern", isCorrect: true },
                    { text: "Basel", isCorrect: false }
                ],
                points: 10,
                timeLimit: 30,
                difficulty: "medium"
            },
            {
                question: "What is the capital of New Zealand?",
                type: "multiple-choice",
                options: [
                    { text: "Auckland", isCorrect: false },
                    { text: "Wellington", isCorrect: true },
                    { text: "Christchurch", isCorrect: false },
                    { text: "Hamilton", isCorrect: false }
                ],
                points: 10,
                timeLimit: 30,
                difficulty: "easy"
            },
            {
                question: "Which city is the capital of South Africa?",
                type: "multiple-choice",
                options: [
                    { text: "Johannesburg", isCorrect: false },
                    { text: "Cape Town (legislative)", isCorrect: true },
                    { text: "Durban", isCorrect: false },
                    { text: "Port Elizabeth", isCorrect: false }
                ],
                points: 15,
                timeLimit: 30,
                difficulty: "hard",
                explanation: "South Africa has three capitals: Pretoria (executive), Cape Town (legislative), and Bloemfontein (judicial)."
            },
            {
                question: "What is the capital of Thailand?",
                type: "multiple-choice",
                options: [
                    { text: "Phuket", isCorrect: false },
                    { text: "Chiang Mai", isCorrect: false },
                    { text: "Bangkok", isCorrect: true },
                    { text: "Pattaya", isCorrect: false }
                ],
                points: 10,
                timeLimit: 30,
                difficulty: "easy"
            },
            {
                question: "Which city is the capital of Turkey?",
                type: "multiple-choice",
                options: [
                    { text: "Istanbul", isCorrect: false },
                    { text: "Ankara", isCorrect: true },
                    { text: "Izmir", isCorrect: false },
                    { text: "Antalya", isCorrect: false }
                ],
                points: 10,
                timeLimit: 30,
                difficulty: "medium"
            },
            {
                question: "What is the capital of Egypt?",
                type: "multiple-choice",
                options: [
                    { text: "Alexandria", isCorrect: false },
                    { text: "Cairo", isCorrect: true },
                    { text: "Giza", isCorrect: false },
                    { text: "Luxor", isCorrect: false }
                ],
                points: 10,
                timeLimit: 30,
                difficulty: "easy"
            },
            {
                question: "Which city is the capital of Norway?",
                type: "multiple-choice",
                options: [
                    { text: "Bergen", isCorrect: false },
                    { text: "Trondheim", isCorrect: false },
                    { text: "Oslo", isCorrect: true },
                    { text: "Stavanger", isCorrect: false }
                ],
                points: 10,
                timeLimit: 30,
                difficulty: "easy"
            }
        ]
    },

    // SCIENCE & TECHNOLOGY
    {
        title: "JavaScript Fundamentals",
        description: "Test your knowledge of JavaScript basics and ES6+ features",
        category: "Programming",
        difficulty: "medium",
        timeLimit: 600,
        isPublic: true,
        questions: [
            {
                question: "What is the output of: typeof null?",
                type: "multiple-choice",
                options: [
                    { text: "null", isCorrect: false },
                    { text: "undefined", isCorrect: false },
                    { text: "object", isCorrect: true },
                    { text: "number", isCorrect: false }
                ],
                points: 10,
                timeLimit: 30,
                difficulty: "medium",
                explanation: "typeof null returns 'object' due to a historical bug in JavaScript that has been kept for backwards compatibility."
            },
            {
                question: "Which method is used to add elements to the end of an array?",
                type: "multiple-choice",
                options: [
                    { text: "unshift()", isCorrect: false },
                    { text: "push()", isCorrect: true },
                    { text: "pop()", isCorrect: false },
                    { text: "shift()", isCorrect: false }
                ],
                points: 10,
                timeLimit: 30,
                difficulty: "easy"
            },
            {
                question: "What does the '===' operator check for?",
                type: "multiple-choice",
                options: [
                    { text: "Value only", isCorrect: false },
                    { text: "Type only", isCorrect: false },
                    { text: "Both value and type", isCorrect: true },
                    { text: "Reference only", isCorrect: false }
                ],
                points: 10,
                timeLimit: 30,
                difficulty: "easy"
            },
            {
                question: "Which keyword is used to declare a block-scoped variable?",
                type: "multiple-choice",
                options: [
                    { text: "var", isCorrect: false },
                    { text: "let", isCorrect: true },
                    { text: "const", isCorrect: false },
                    { text: "function", isCorrect: false }
                ],
                points: 10,
                timeLimit: 30,
                difficulty: "easy"
            },
            {
                question: "What is a closure in JavaScript?",
                type: "multiple-choice",
                options: [
                    { text: "A function that has access to its outer function's variables", isCorrect: true },
                    { text: "A way to close a program", isCorrect: false },
                    { text: "A method to end a loop", isCorrect: false },
                    { text: "A type of object", isCorrect: false }
                ],
                points: 15,
                timeLimit: 30,
                difficulty: "medium"
            },
            {
                question: "Which method creates a new array with results of calling a function for every array element?",
                type: "multiple-choice",
                options: [
                    { text: "forEach()", isCorrect: false },
                    { text: "filter()", isCorrect: false },
                    { text: "map()", isCorrect: true },
                    { text: "reduce()", isCorrect: false }
                ],
                points: 10,
                timeLimit: 30,
                difficulty: "easy"
            },
            {
                question: "What is the purpose of 'async/await'?",
                type: "multiple-choice",
                options: [
                    { text: "To handle synchronous code", isCorrect: false },
                    { text: "To handle asynchronous operations more elegantly", isCorrect: true },
                    { text: "To create loops", isCorrect: false },
                    { text: "To define classes", isCorrect: false }
                ],
                points: 15,
                timeLimit: 30,
                difficulty: "medium"
            },
            {
                question: "What does 'NaN' stand for?",
                type: "multiple-choice",
                options: [
                    { text: "Not a Null", isCorrect: false },
                    { text: "Not a Number", isCorrect: true },
                    { text: "Null and Negative", isCorrect: false },
                    { text: "Number and Null", isCorrect: false }
                ],
                points: 10,
                timeLimit: 30,
                difficulty: "easy"
            },
            {
                question: "Which statement is used to stop a loop?",
                type: "multiple-choice",
                options: [
                    { text: "stop", isCorrect: false },
                    { text: "exit", isCorrect: false },
                    { text: "break", isCorrect: true },
                    { text: "return", isCorrect: false }
                ],
                points: 10,
                timeLimit: 30,
                difficulty: "easy"
            },
            {
                question: "What is the spread operator in JavaScript?",
                type: "multiple-choice",
                options: [
                    { text: "...", isCorrect: true },
                    { text: "***", isCorrect: false },
                    { text: "+++", isCorrect: false },
                    { text: "---", isCorrect: false }
                ],
                points: 10,
                timeLimit: 30,
                difficulty: "easy"
            }
        ]
    },

    // Add more quizzes...
    {
        title: "Solar System Basics",
        description: "Explore our cosmic neighborhood with questions about planets, moons, and space",
        category: "Science",
        difficulty: "easy",
        timeLimit: 300,
        isPublic: true,
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
                points: 10,
                timeLimit: 30,
                difficulty: "easy"
            },
            {
                question: "How many planets are in our solar system?",
                type: "multiple-choice",
                options: [
                    { text: "7", isCorrect: false },
                    { text: "8", isCorrect: true },
                    { text: "9", isCorrect: false },
                    { text: "10", isCorrect: false }
                ],
                points: 10,
                timeLimit: 30,
                difficulty: "easy"
            },
            {
                question: "Which planet is the largest in our solar system?",
                type: "multiple-choice",
                options: [
                    { text: "Saturn", isCorrect: false },
                    { text: "Neptune", isCorrect: false },
                    { text: "Jupiter", isCorrect: true },
                    { text: "Uranus", isCorrect: false }
                ],
                points: 10,
                timeLimit: 30,
                difficulty: "easy"
            },
            {
                question: "What is the closest planet to the Sun?",
                type: "multiple-choice",
                options: [
                    { text: "Venus", isCorrect: false },
                    { text: "Mercury", isCorrect: true },
                    { text: "Earth", isCorrect: false },
                    { text: "Mars", isCorrect: false }
                ],
                points: 10,
                timeLimit: 30,
                difficulty: "easy"
            },
            {
                question: "Which planet has the most moons?",
                type: "multiple-choice",
                options: [
                    { text: "Jupiter", isCorrect: false },
                    { text: "Saturn", isCorrect: true },
                    { text: "Uranus", isCorrect: false },
                    { text: "Neptune", isCorrect: false }
                ],
                points: 15,
                timeLimit: 30,
                difficulty: "medium",
                explanation: "Saturn has over 80 confirmed moons, making it the planet with the most moons in our solar system."
            },
            {
                question: "What is the name of Earth's natural satellite?",
                type: "multiple-choice",
                options: [
                    { text: "Luna", isCorrect: false },
                    { text: "The Moon", isCorrect: true },
                    { text: "Titan", isCorrect: false },
                    { text: "Europa", isCorrect: false }
                ],
                points: 10,
                timeLimit: 30,
                difficulty: "easy"
            },
            {
                question: "Which planet is known for its prominent ring system?",
                type: "multiple-choice",
                options: [
                    { text: "Jupiter", isCorrect: false },
                    { text: "Uranus", isCorrect: false },
                    { text: "Saturn", isCorrect: true },
                    { text: "Neptune", isCorrect: false }
                ],
                points: 10,
                timeLimit: 30,
                difficulty: "easy"
            },
            {
                question: "What is the hottest planet in our solar system?",
                type: "multiple-choice",
                options: [
                    { text: "Mercury", isCorrect: false },
                    { text: "Venus", isCorrect: true },
                    { text: "Mars", isCorrect: false },
                    { text: "Jupiter", isCorrect: false }
                ],
                points: 15,
                timeLimit: 30,
                difficulty: "medium",
                explanation: "Venus is the hottest planet due to its thick atmosphere that traps heat in a runaway greenhouse effect."
            },
            {
                question: "How long does it take Earth to orbit the Sun?",
                type: "multiple-choice",
                options: [
                    { text: "24 hours", isCorrect: false },
                    { text: "30 days", isCorrect: false },
                    { text: "365 days", isCorrect: true },
                    { text: "12 months", isCorrect: false }
                ],
                points: 10,
                timeLimit: 30,
                difficulty: "easy"
            },
            {
                question: "Which planet rotates on its side?",
                type: "multiple-choice",
                options: [
                    { text: "Mars", isCorrect: false },
                    { text: "Saturn", isCorrect: false },
                    { text: "Uranus", isCorrect: true },
                    { text: "Neptune", isCorrect: false }
                ],
                points: 15,
                timeLimit: 30,
                difficulty: "hard"
            }
        ]
    }
];

async function seedQuizzes() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find or create a default user for quiz ownership
        let defaultUser = await User.findOne({ email: 'admin@quizito.com' });
        if (!defaultUser) {
            defaultUser = await User.create({
                username: 'QuizitoAdmin',
                email: 'admin@quizito.com',
                password: 'hashedpassword123', // This should be hashed in production
                role: 'admin'
            });
            console.log('✅ Created default admin user');
        }

        // Clear existing quizzes (optional)
        await Quiz.deleteMany({ createdBy: defaultUser._id });
        console.log('🗑️  Cleared existing seed quizzes');

        // Insert quizzes
        const createdQuizzes = await Promise.all(
            quizzes.map(quiz =>
                Quiz.create({
                    ...quiz,
                    createdBy: defaultUser._id
                })
            )
        );

        console.log(`✅ Successfully seeded ${createdQuizzes.length} quizzes!`);
        console.log('Quiz titles:');
        createdQuizzes.forEach(quiz => console.log(`  - ${quiz.title}`));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding quizzes:', error);
        process.exit(1);
    }
}

seedQuizzes();
