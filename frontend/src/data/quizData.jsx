// src/data/quizData.js
const quizData = {
  questions: [
    {
      id: 1,
      question: "What is the capital of France?",
      answers: ["London", "Berlin", "Paris", "Madrid"],
      correct: 2,
      category: "Geography"
    },
    {
      id: 2,
      question: "Which planet is known as the Red Planet?",
      answers: ["Venus", "Mars", "Jupiter", "Saturn"],
      correct: 1,
      category: "Astronomy"
    },
    {
      id: 3,
      question: "What is the chemical symbol for Gold?",
      answers: ["Go", "Gd", "Au", "Ag"],
      correct: 2,
      category: "Chemistry"
    },
    {
      id: 4,
      question: "Who painted the Mona Lisa?",
      answers: ["Van Gogh", "Da Vinci", "Picasso", "Rembrandt"],
      correct: 1,
      category: "Art"
    },
    {
      id: 5,
      question: "What is the largest mammal in the world?",
      answers: ["Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
      correct: 1,
      category: "Biology"
    }
  ],
  categories: [
    { name: "Science", color: "#3B82F6", icon: "🔬" },
    { name: "History", color: "#10B981", icon: "🏛️" },
    { name: "Technology", color: "#8B5CF6", icon: "💻" },
    { name: "Art", color: "#F59E0B", icon: "🎨" },
    { name: "Geography", color: "#EF4444", icon: "🌍" }
  ],
  leaderboard: [
    { name: "YOU", score: 450, avatar: "👑" },
    { name: "AI Assistant", score: 400, avatar: "🤖" },
    { name: "Quiz Master", score: 380, avatar: "🎯" },
    { name: "Fast Learner", score: 350, avatar: "⚡" },
    { name: "Knowledge Seeker", score: 320, avatar: "🔍" }
  ]
};

export default quizData;