// src/pages/PlayQuiz.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { socketService } from "../services";
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import LoadingSpinner from "../components/LoadingSpinner";
import QuizTimer from "../components/QuizTimer";

const PlayQuiz = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Game State
  const [gameState, setGameState] = useState('connecting'); // connecting, unused_lobby(handled by waiting), waiting, question, answer, finished
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [score, setScore] = useState(0);
  const [rank, setRank] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [pointsEarned, setPointsEarned] = useState(0);

  useEffect(() => {
    // 1. Initialize Connection
    const connectToSession = async () => {
      try {
        const token = localStorage.getItem('quizito_token');
        const username = user?.username || localStorage.getItem('username') || `Guest_${Math.floor(Math.random() * 1000)}`;

        // Ensure socket is connected
        const socket = socketService.connect(token);

        // Join the session
        socketService.joinSession(roomCode, username);

        setGameState('waiting');
      } catch (err) {
        console.error("Failed to connect:", err);
        toast.error("Connection failed");
      }
    };

    connectToSession();

    // 2. Setup Event Listeners
    const handleQuizStarted = (data) => {
      console.log('Quiz Started:', data);
      setGameState('question');
      setCurrentQuestion(data.question);
      setCurrentQuestionIndex(data.questionIndex);
      setTotalQuestions(data.totalQuestions);
      setTimeRemaining(data.timeRemaining || 30);
      setSelectedOption(null);
      setCorrectAnswer(null);
    };

    const handleNextQuestion = (data) => {
      console.log('Next Question:', data);
      setGameState('question');
      setCurrentQuestion(data.question);
      setCurrentQuestionIndex(data.questionIndex);
      setTimeRemaining(data.timeRemaining || 30);
      setSelectedOption(null);
      setCorrectAnswer(null);
    };

    const handleQuestionCompleted = (data) => {
      console.log('Question Completed:', data);
      setGameState('answer');
      setCorrectAnswer(data.correctAnswer);
      if (data.explanation) {
        // Optional: show explanation
      }
    };

    const handleQuizCompleted = (data) => {
      console.log('Quiz Completed:', data);
      setGameState('finished');
      setLeaderboard(data.finalResults?.leaderboard || []);
      // Save results for results page
      localStorage.setItem('quizResults', JSON.stringify(data.finalResults));

      setTimeout(() => {
        navigate(`/results/${data.finalResults?.sessionId}`);
      }, 5000);
    };

    const handleLeaderboardUpdate = (data) => {
      // Find my rank
      const myEntry = data.leaderboard?.find(p => p.username === (user?.username || localStorage.getItem('username')));
      if (myEntry) {
        setScore(myEntry.score);
        setRank(data.leaderboard.indexOf(myEntry) + 1);
      }
      setLeaderboard(data.leaderboard || []);
    };

    // Register listeners
    socketService.onQuizStarted(handleQuizStarted);
    socketService.onNextQuestion(handleNextQuestion);
    socketService.onQuestionCompleted(handleQuestionCompleted);
    socketService.onQuizCompleted(handleQuizCompleted);
    socketService.onLeaderboardUpdate(handleLeaderboardUpdate);
    socketService.onTimerUpdate((data) => setTimeRemaining(data.timeRemaining));
    socketService.onQuestionTimeUp(() => {
      if (gameState === 'question') {
        setGameState('answer');
        toast('Time is up!', { icon: '⏰' });
      }
    });
    socketService.onSessionEndedByHost(() => {
      toast.error("Host ended the session");
      navigate('/');
    });

    return () => {
      socketService.removeAllListeners();
    };

  }, [roomCode, user, navigate]);

  const handleOptionSelect = (index) => {
    if (gameState !== 'question' || selectedOption !== null) return;

    setSelectedOption(index);
    const timeTaken = Math.max(0, 30 - timeRemaining); // Estimate, backend verifies

    socketService.submitAnswer({
      roomCode,
      questionId: currentQuestion._id,
      selectedOption: index,
      timeTaken
    });
  };

  if (gameState === 'connecting') {
    return <LoadingSpinner text="Joining session..." fullScreen={true} color="purple" />;
  }

  // waiting view
  if (gameState === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex flex-col items-center justify-center text-white p-4">
        <div className="text-center animate-bounce mb-8">
          <div className="text-6xl mb-4">⏳</div>
        </div>
        <h1 className="text-4xl font-bold mb-4">You're In!</h1>
        <p className="text-xl opacity-80 mb-8">Waiting for host to start...</p>
        <div className="bg-white/10 px-6 py-4 rounded-xl border border-white/20">
          <p className="font-mono text-cyan-300 text-xl">{roomCode}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Top Bar */}
      <div className="max-w-3xl mx-auto flex justify-between items-center mb-8 bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm">
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 uppercase font-bold">Score</span>
          <span className="text-2xl font-bold text-yellow-400">{score}</span>
          {rank > 0 && <span className="text-xs text-green-400">Rank #{rank}</span>}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-400 uppercase font-bold">Question</span>
          <span className="text-xl font-bold">{currentQuestionIndex + 1} <span className="text-sm text-gray-500">/ {totalQuestions}</span></span>
        </div>
      </div>

      {/* Game Area */}
      <div className="max-w-3xl mx-auto">
        {gameState === 'question' || gameState === 'answer' ? (
          <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
            {/* Timer Bar */}
            <div className="h-2 bg-gray-700 w-full">
              <div
                className={`h-full transition-all duration-1000 ${timeRemaining < 10 ? 'bg-red-500' : 'bg-cyan-500'}`}
                style={{ width: `${(timeRemaining / (currentQuestion?.timeLimit || 30)) * 100}%` }}
              ></div>
            </div>

            <div className="p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-tight">
                {currentQuestion?.question || currentQuestion?.text}
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {currentQuestion?.options?.map((opt, idx) => {
                  // Handle both object and string options if needed, but HostSession ensures array
                  const text = typeof opt === 'object' ? opt.text : opt;
                  let statusClass = "bg-gray-700 hover:bg-gray-600 border-gray-600";

                  if (gameState === 'answer') {
                    // Reveal
                    if (opt.isCorrect || (correctAnswer === text)) {
                      statusClass = "bg-green-600 border-green-500";
                    } else if (selectedOption === idx) {
                      statusClass = "bg-red-600 border-red-500";
                    } else {
                      statusClass = "bg-gray-700 opacity-50";
                    }
                  } else if (selectedOption === idx) {
                    statusClass = "bg-cyan-600 border-cyan-400 ring-2 ring-cyan-400";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      disabled={gameState !== 'question' || selectedOption !== null}
                      className={`p-4 md:p-6 rounded-xl border-2 text-left transition-all transform ${statusClass} ${gameState === 'question' && selectedOption === null ? 'hover:scale-[1.02]' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm">
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="font-semibold text-lg">{text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {gameState === 'answer' && (
              <div className="bg-gray-900/50 p-4 text-center border-t border-gray-700">
                <p className="text-gray-400 italic">Waiting for next question...</p>
              </div>
            )}
          </div>
        ) : gameState === 'finished' ? (
          <div className="text-center py-12">
            <h2 className="text-4xl font-bold mb-4">Quiz Finished!</h2>
            <p className="text-xl text-gray-400">Redirecting to results...</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default PlayQuiz;
