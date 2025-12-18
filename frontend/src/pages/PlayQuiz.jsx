// src/pages/PlayQuiz.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { socketService } from "../services";
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useSoundSettings } from '../context/SoundContext';

// Components
import LoadingSpinner from "../components/LoadingSpinner";
import QuizTimer from "../components/QuizTimer";
import LobbyView from "../components/Game/LobbyView";
import ResponseFeedback from "../components/Game/ResponseFeedback";
import PowerUpBar from "../components/Game/PowerUpBar";

const PlayQuiz = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Game State
  const [gameState, setGameState] = useState('connecting');
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
  const [streak, setStreak] = useState(0);
  const [powerUps, setPowerUps] = useState({ fiftyFifty: 2, timeFreeze: 1, doublePoints: 1 });
  const [showConfetti, setShowConfetti] = useState(false);
  const [sessionSettings, setSessionSettings] = useState(null);
  const [quizInfo, setQuizInfo] = useState(null);

  const { playSound, soundEnabled, toggleSound } = useSoundSettings();

  // Refs for stale closure
  const selectedOptionRef = useRef(null);
  useEffect(() => { selectedOptionRef.current = selectedOption; }, [selectedOption]);

  useEffect(() => {
    const connectToSession = async () => {
      try {
        const token = localStorage.getItem('quizito_token');
        const username = user?.username || localStorage.getItem('username') || `Guest_${Math.floor(Math.random() * 1000)}`;
        const socket = socketService.connect(token);

        socketService.joinSession(roomCode, username, (response) => {
          if (response.success && response.session) {
            setSessionSettings(response.session.settings);
            setQuizInfo(response.session.quiz);
            setGameState(response.session.status === 'active' ? 'question' : 'waiting'); // Handle late join
            if (response.session.status === 'active') {
              // Logic to sync current question handled by 'start-quiz' or 'next-question' events?
              // Usually we need to ask for "get-current-state" if joining late
              // But for now just set waiting/lobby if not handled
              // socketService.getCurrentState? (Not implemented yet).
              // I will stick to 'waiting' if not implemented, or assume events fire
            }
          } else {
            toast.error(response.message || "Failed to join");
            navigate('/');
          }
        });
      } catch (err) {
        console.error("Failed to connect:", err);
        toast.error("Connection failed");
      }
    };

    connectToSession();

    const handleQuizStarted = (data) => {
      setGameState('question');
      setCurrentQuestion(data.question);
      setCurrentQuestionIndex(data.questionIndex);
      setTotalQuestions(data.totalQuestions);
      setTimeRemaining(data.timeRemaining || 30);
      setSelectedOption(null);
      setCorrectAnswer(null);
    };

    const handleNextQuestion = (data) => {
      setGameState('question');
      setCurrentQuestion(data.question);
      setCurrentQuestionIndex(data.questionIndex);
      setTimeRemaining(data.timeRemaining || 30);
      setSelectedOption(null);
      setCorrectAnswer(null);
    };

    const handleQuestionCompleted = (data) => {
      setGameState('answer');
      setCorrectAnswer(data.correctAnswer);

      const isCorrect = selectedOptionRef.current === data.correctAnswer;
      if (isCorrect) {
        setPointsEarned(1000);
        setStreak(s => s + 1);
        playSound('correct');
      } else {
        setPointsEarned(0);
        setStreak(0);
        playSound('incorrect');
      }
    };

    const handleQuizCompleted = (data) => {
      setGameState('finished');
      setLeaderboard(data.finalResults?.leaderboard || []);
      localStorage.setItem('quizResults', JSON.stringify(data.finalResults));
      setShowConfetti(true);
      playSound('start'); // Celebration sound
      setTimeout(() => {
        navigate(`/results/${data.finalResults?.sessionId}`);
      }, 6000);
    };

    const handleLeaderboardUpdate = (data) => {
      const myEntry = data.leaderboard?.find(p => p.username === (user?.username || localStorage.getItem('username')));
      if (myEntry) {
        setScore(myEntry.score);
        setRank(data.leaderboard.indexOf(myEntry) + 1);
      }
      setLeaderboard(data.leaderboard || []);
    };

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
    const timeTaken = Math.max(0, 30 - timeRemaining);
    socketService.submitAnswer({
      roomCode,
      questionId: currentQuestion._id,
      selectedOption: index,
      timeTaken
    });
  };

  const handleUsePowerUp = (type) => {
    socketService.usePowerup(roomCode, type, (response) => {
      if (response.success) {
        toast.success("Powerup Activated!");
        const typeMap = { '50-50': 'fiftyFifty', 'time-freeze': 'timeFreeze', 'double-points': 'doublePoints' };
        const key = typeMap[type];
        if (key) {
          setPowerUps(prev => ({ ...prev, [key]: Math.max(0, prev[key] - 1) }));
        }
      } else {
        toast.error(response.message || "Failed to use powerup");
      }
    });
  };

  if (gameState === 'connecting') {
    return <LoadingSpinner text="Joining session..." fullScreen={true} color="purple" />;
  }

  if (gameState === 'waiting') {
    const player = { username: user?.username || localStorage.getItem('username'), avatar: '😎' };
    return <LobbyView roomCode={roomCode} player={player} settings={sessionSettings} quizInfo={quizInfo} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 relative overflow-hidden bg-[url('/bg-pattern.svg')]">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} />}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 opacity-90"></div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Top Bar */}
        <div className="max-w-3xl mx-auto flex justify-between items-center mb-8 bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm w-full">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 uppercase font-bold">Score</span>
            <span className="text-2xl font-bold text-yellow-400">{score}</span>
            {rank > 0 && <span className="text-xs text-green-400">Rank #{rank}</span>}
          </div>

          <button
            onClick={toggleSound}
            className={`p-2 rounded-full transition-colors ${soundEnabled ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-700 text-slate-400'}`}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-400 uppercase font-bold">Question</span>
            <span className="text-xl font-bold">{currentQuestionIndex + 1} <span className="text-sm text-gray-500">/ {totalQuestions}</span></span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto relative z-10 w-full">
          <AnimatePresence>
            {gameState === 'answer' && (
              <ResponseFeedback
                isCorrect={selectedOptionRef.current === correctAnswer}
                points={pointsEarned}
                streak={streak}
              />
            )}
          </AnimatePresence>

          {gameState === 'question' || gameState === 'answer' ? (
            <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50">
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
                    const text = typeof opt === 'object' ? opt.text : opt;
                    let statusClass = "bg-gray-700 hover:bg-gray-600 border-gray-600";

                    if (gameState === 'answer' && idx === correctAnswer) {
                      statusClass = "bg-green-600 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]";
                    } else if (gameState === 'answer' && selectedOption === idx && idx !== correctAnswer) {
                      statusClass = "bg-red-600 border-red-400";
                    } else if (selectedOption === idx) {
                      statusClass += " ring-2 ring-white bg-indigo-600 border-indigo-400";
                    }

                    return (
                      <motion.button
                        key={idx}
                        whileHover={gameState === 'question' && !selectedOption ? { scale: 1.02, translateY: -2 } : {}}
                        whileTap={gameState === 'question' && !selectedOption ? { scale: 0.98 } : {}}
                        onClick={() => handleOptionSelect(idx)}
                        disabled={gameState !== 'question' || selectedOption !== null}
                        className={`p-6 rounded-xl border-2 text-left transition-all relative overflow-hidden group ${statusClass}`}
                      >
                        <div className="relative z-10 flex items-center justify-between">
                          <span className="text-lg md:text-xl font-bold">{text}</span>
                          {selectedOption === idx && <span className="text-2xl">Selected</span>}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <PowerUpBar
                  powerUps={powerUps}
                  onUse={handleUsePowerUp}
                  disabled={gameState !== 'question' || selectedOption !== null}
                />
              </div>
            </div>
          ) : gameState === 'finished' ? (
            <div className="text-center py-12 bg-gray-800/80 rounded-2xl backdrop-blur-md">
              <h2 className="text-4xl font-bold mb-4">Quiz Finished!</h2>
              <p className="text-xl text-gray-400">Redirecting to results...</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PlayQuiz;
