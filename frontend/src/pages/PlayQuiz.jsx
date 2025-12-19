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
import Chat from "../components/Chat";

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
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [score, setScore] = useState(0);
  const [rank, setRank] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [powerUps, setPowerUps] = useState({ fiftyFifty: 2, timeFreeze: 1, doublePoints: 1 });
  const [sessionSettings, setSessionSettings] = useState(null);
  const [quizInfo, setQuizInfo] = useState(null);
  const [currentExplanation, setCurrentExplanation] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);

  // Chat/Reaction Effects
  useEffect(() => {
    const onChat = (msg) => {
      setChatMessages(prev => [...prev, msg]);
      if (!isChatOpen) setUnreadMessages(prev => prev + 1);
    };
    const onReaction = (data) => {
      if (data.userId !== user?._id) {
        toast(data.reaction, {
          icon: data.username,
          position: 'bottom-right',
          style: { borderRadius: '20px', background: 'rgba(255,255,255,0.9)', fontSize: '24px' },
          duration: 2000
        });
      }
    };
    socketService.onChatMessage(onChat);
    socketService.onReaction(onReaction);

    return () => {
      // Cleanup handled by socketService.removeAllListeners() or specific off
      socketService.socket?.off('reaction-received');
      socketService.socket?.off('chat-message');
    };
  }, [isChatOpen, user]);

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
            if (response.participant?.powerups) {
              const pMap = {};
              response.participant.powerups.forEach(p => pMap[p.type] = p.count);
              setPowerUps(pMap);
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
      setHiddenOptions([]);
    };

    const handleNextQuestion = (data) => {
      setGameState('question');
      setCurrentQuestion(data.question);
      setCurrentQuestionIndex(data.questionIndex);
      setTimeRemaining(data.timeRemaining || 30);
      setSelectedOption(null);
      setCorrectAnswer(null);
      setHiddenOptions([]);
    };

    const handleQuestionCompleted = (data) => {
      setGameState('answer');
      // Use index for comparison since selectedOption is an index
      const correctIdx = data.correctIndex !== undefined ? data.correctIndex : data.correctAnswer;
      setCorrectAnswer(correctIdx);
      setCurrentExplanation(data.explanation);

      const isCorrect = selectedOptionRef.current === correctIdx;
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
    socketService.onQuizPaused(() => {
      toast("⏸️ Quiz Paused by Host", { duration: 5000, icon: '🛑' });
    });
    socketService.onQuizResumed(() => {
      toast("▶️ Quiz Resumed!", { duration: 3000, icon: '🚀' });
    });
    socketService.onQuestionTimeUp(() => {
      if (gameState === 'question') {
        setGameState('answer');
        toast('Time is up!', { icon: '⏰' });
      }
    });
    socketService.onSessionEndedByHost((data) => {
      toast("Session ended by host", { icon: '🏁' });
      if (data.sessionId) {
        navigate(`/results/${data.sessionId}`);
      } else {
        navigate('/');
      }
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
      questionIndex: currentQuestionIndex, // Send index for backend lookup
      answer: index, // Backend now accepts index (number)
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
        if (response.removedOptions) {
          setHiddenOptions(response.removedOptions);
        }
      } else {
        toast.error(response.message || "Failed to use powerup");
      }
    });
  };
  // Tips rotation
  const [tipIndex, setTipIndex] = useState(0);
  const TIPS = [
    "🔥 Speed matters! Faster answers get more points.",
    "🎯 Accuracy is key - wrong answers break your streak.",
    "💎 Use powerups wisely, they are limited!",
    "👀 Watch the timer, don't let it run out.",
    "🏆 Consecutive correct answers build a Streak Multiplier!",
    "🤫 Don't tell your friends the answers (or do, we can't stop you).",
    "⚡ The Double Points powerup is best used on high-value questions."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % TIPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);


  // Loading State
  if (gameState === 'connecting') {
    return <LoadingSpinner text="Joining session..." fullScreen={true} color="purple" />;
  }



  const handleSendMessage = (text) => {
    socketService.sendChatMessage({
      roomCode: roomCode,
      message: text,
      sender: user?.username || localStorage.getItem('username') || 'Guest'
    });
  };

  const sendReaction = (emoji) => {
    socketService.sendReaction(roomCode, emoji);
    // Show local feedback immediately
    toast(emoji, {
      position: 'bottom-right',
      style: { borderRadius: '50px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white' },
      duration: 1000
    });
  };

  const speakQuestion = () => {
    if (!currentQuestion) return;
    window.speechSynthesis.cancel(); // Stop any previous speech
    const text = `${currentQuestion.question}. ${currentQuestion.options.map((opt, i) => `Option ${i + 1}: ${typeof opt === 'string' ? opt : opt.text}`).join('. ')}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };


  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 relative overflow-hidden bg-[url('/bg-pattern.svg')]">
      {/* ... existing standard UI ... */}
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} />}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 opacity-90"></div>

      {/* CHAT TOGGLE BUTTON */}
      <button
        onClick={() => { setIsChatOpen(true); setUnreadMessages(0); }}
        className="fixed bottom-20 right-4 z-50 bg-indigo-600 p-3 rounded-full shadow-lg border border-indigo-400 hover:bg-indigo-500 transition-transform hover:scale-105"
      >
        💬 {unreadMessages > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-xs w-5 h-5 flex items-center justify-center rounded-full border border-white">{unreadMessages}</span>}
      </button>

      {/* CHAT DRAWER */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            className="fixed inset-y-0 right-0 w-full md:w-80 bg-white text-slate-900 z-50 shadow-2xl flex flex-col"
          >
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold">Live Chat</h3>
              <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-slate-200 rounded">✕</button>
            </div>
            <div className="flex-1 overflow-hidden relative">
              <Chat messages={chatMessages} onSendMessage={handleSendMessage} currentUserId={user?._id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col">

        {/* LOBBY VIEW */}
        {gameState === 'waiting' && (
          <LobbyView
            roomCode={roomCode}
            player={{ username: user?.username || localStorage.getItem('username'), avatar: '😎' }}
            settings={sessionSettings}
            quizInfo={quizInfo}
            currentTip={TIPS[tipIndex]}
          />
        )}

        {/* GAME UI */}
        {gameState !== 'waiting' && (
          <>
            {/* Top Bar */}
            <div className="max-w-3xl mx-auto flex justify-between items-center mb-8 bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm w-full">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase font-bold">Score</span>
                <span className="text-2xl font-bold text-yellow-400">{score}
                  {streak > 2 && <span className="ml-2 animate-bounce inline-block">🔥 {streak}</span>}
                </span>
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
                    explanation={currentExplanation}
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
                    <div className="flex justify-between items-start mb-8">
                      <h2 className="text-2xl md:text-3xl font-bold leading-tight flex-1">
                        {currentQuestion?.question || currentQuestion?.text}
                      </h2>
                      <button
                        onClick={speakQuestion}
                        className="ml-4 p-3 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded-full transition-all"
                        title="Read Question"
                      >
                        🗣️
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {currentQuestion?.options?.map((opt, idx) => {
                        if (hiddenOptions.includes(idx)) return null;
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

                    {/* Reaction FAB */}
                    <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                      {['❤️', '😂', '😮', '😡'].map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => sendReaction(emoji)}
                          className="w-10 h-10 bg-white/10 rounded-full hover:bg-white/20 backdrop-blur text-xl shadow-lg transition-transform hover:scale-110 active:scale-95"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              ) : null}

              {gameState === 'finished' && (
                <div className="text-center py-12 bg-gray-800/80 rounded-2xl backdrop-blur-md">
                  <h2 className="text-4xl font-bold mb-4">Quiz Finished!</h2>
                  <p className="text-xl text-gray-400">Redirecting to results...</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PlayQuiz;
