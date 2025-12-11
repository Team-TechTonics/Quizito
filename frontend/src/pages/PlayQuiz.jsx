import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

// Context
import { useAuth } from "../context/AuthContext";

// Components (inside session folder)
import QuizQuestion from "../components/QuizQuestion";
import QuizTimer from "../components/QuizTimer";
import Leaderboard from "../components/Leaderboard";
import Participants from "../components/Participants";
import NotificationCenter from "../components/NotificationCenter";
import LoadingSpinner from "../components/LoadingSpinner";
import ProgressBar from "../components/ProgressBar";

// Global Styles
import "../styles/globals.css";

const PlayQuiz = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socketRef = useRef(null);

  // Game state
  const [gameState, setGameState] = useState({
    status: 'connecting', // connecting, waiting, question, feedback, ended
    currentQuestion: null,
    questionIndex: 0,
    totalQuestions: 0,
    selectedOption: null,
    isCorrect: null,
    showFeedback: false,
    feedbackData: null,
    timer: 30,
    score: 0,
    leaderboard: [],
    players: [],
    roomInfo: null
  });

  // Initialize connection
  useEffect(() => {
    const username = user?.username || localStorage.getItem('username') || `Player${Math.floor(Math.random() * 1000)}`;
    const userId = user?.id || `guest_${Date.now()}`;

    // Save username if not already saved
    if (!localStorage.getItem('username')) {
      localStorage.setItem('username', username);
    }

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:10000', {
      auth: {
        token: localStorage.getItem('quizito_token'),
        userId,
        username
      },
      reconnection: true,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    console.log('[PlayQuiz] Socket initialized, connecting to:', import.meta.env.VITE_API_URL || 'http://localhost:10000');
    console.log('[PlayQuiz] Room code:', roomCode);
    console.log('[PlayQuiz] Username:', username);

    // Connection events
    socket.on('connect', () => {
      console.log('[PlayQuiz] Socket connected!', socket.id);
      // Immediately set to waiting state as fallback
      setGameState(prev => ({
        ...prev,
        status: 'waiting'
      }));
    });

    socket.on('connect_error', (error) => {
      console.error('[PlayQuiz] Connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('[PlayQuiz] Socket disconnected:', reason);
    });

    // Authenticate first
    socket.emit('authenticate', {
      token: localStorage.getItem('quizito_token')
    });

    // After authentication, join session
    socket.on('authenticated', () => {
      console.log('[PlayQuiz] Authenticated! Joining session...');
      socket.emit('join-session', {
        roomCode,
        username,
        userId
      });
    });

    // Fallback: If not authenticated after 2 seconds, try joining anyway
    setTimeout(() => {
      if (gameState.status === 'connecting') {
        console.log('[PlayQuiz] Authentication timeout, attempting direct join...');
        socket.emit('join-session', {
          roomCode,
          username,
          userId
        });
      }
    }, 2000);

    // Successfully joined
    socket.on('session-joined', (data) => {
      console.log('[PlayQuiz] Session joined successfully!', data);
      setGameState(prev => ({
        ...prev,
        status: 'waiting',
        roomInfo: data.session,
        players: data.session.participants || []
      }));
    });

    // New question
    socket.on('new-question', (data) => {
      setGameState(prev => ({
        ...prev,
        status: 'question',
        currentQuestion: data.question,
        questionIndex: data.questionIndex,
        totalQuestions: data.question.totalQuestions,
        selectedOption: null,
        isCorrect: null,
        showFeedback: false,
        feedbackData: null,
        timer: data.question.timeLimit || 30
      }));

      // Start local timer
      startTimer(data.question.timeLimit || 30);
    });

    // Answer feedback
    socket.on('answer-feedback', (data) => {
      setGameState(prev => ({
        ...prev,
        status: 'feedback',
        isCorrect: data.isCorrect,
        feedbackData: data,
        showFeedback: true,
        score: data.isCorrect ? prev.score + (data.points || 10) : prev.score
      }));

      // Auto-clear feedback after 3 seconds
      setTimeout(() => {
        setGameState(prev => ({ ...prev, showFeedback: false }));
      }, 3000);
    });

    // When time runs out for a question
    socket.on('question-time-up', (data) => {
      setGameState(prev => ({
        ...prev,
        status: 'feedback',
        feedbackData: data,
        showFeedback: true
      }));

      // Wait a bit then show next question
      setTimeout(() => {
        setGameState(prev => ({ ...prev, showFeedback: false }));
      }, 3000);
    });

    // Leaderboard update
    socket.on('leaderboard-update', (data) => {
      setGameState(prev => ({
        ...prev,
        leaderboard: data.players
      }));
    });

    // Participant joined/left
    socket.on('participant-joined', (data) => {
      setGameState(prev => ({
        ...prev,
        players: [...prev.players, data.participant]
      }));

      NotificationCenter.add({
        type: 'info',
        message: `${data.participant?.username || 'A player'} joined`,
        duration: 2000
      });
    });

    socket.on('participant-left', (data) => {
      setGameState(prev => ({
        ...prev,
        players: prev.players.filter(p => p.userId !== data.participantId)
      }));
    });

    // Session update (new participants)
    socket.on('session-updated', (data) => {
      if (data.session && data.session.participants) {
        setGameState(prev => ({
          ...prev,
          players: data.session.participants
        }));
      }
    });

    // Quiz completed
    socket.on('quiz-completed', (data) => {
      setGameState(prev => ({
        ...prev,
        status: 'ended'
      }));
    });

    // Quiz ended
    socket.on('quiz-ended', (data) => {
      setGameState(prev => ({
        ...prev,
        status: 'ended',
        leaderboard: data.finalLeaderboard || data.participants || []
      }));

      // Navigate to results after delay
      setTimeout(() => {
        const sessionId = data.sessionId || roomCode || 'unknown';
        navigate(`/results/${sessionId}`, {
          state: {
            roomCode,
            scores: data.finalLeaderboard || data.participants || [],
            playerScore: gameState.score,
            totalQuestions: gameState.totalQuestions
          }
        });
      }, 3000);
    });

    // Errors
    socket.on('error', (data) => {
      console.error('[PlayQuiz] Socket error:', data);
      const errorMsg = typeof data === 'string' ? data : data?.message || 'Connection error';
      if (errorMsg.includes('Session not found') || errorMsg.includes('Room')) {
        NotificationCenter.add({
          type: 'error',
          message: 'Room not found',
          duration: 5000
        });
        setTimeout(() => navigate('/'), 3000);
      } else {
        NotificationCenter.add({
          type: 'error',
          message: errorMsg,
          duration: 3000
        });
      }
    });

    // Join error
    socket.on('join-error', (data) => {
      console.error('[PlayQuiz] Join error:', data);
      NotificationCenter.add({
        type: 'error',
        message: data.message || 'Failed to join session',
        duration: 5000
      });
      setTimeout(() => navigate('/'), 3000);
    });

    socket.on('countdown', (data) => {
      if (data.count === 1) {
        NotificationCenter.add({
          type: 'info',
          message: 'Quiz starting!',
          duration: 1000
        });
      }
    });

    return () => {
      console.log('[PlayQuiz] Cleaning up socket connection');
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomCode]); // Removed navigate and user from dependencies

  const startTimer = (duration) => {
    let timeLeft = duration;
    const timer = setInterval(() => {
      timeLeft--;
      setGameState(prev => {
        const newState = { ...prev, timer: timeLeft };

        if (timeLeft <= 0) {
          clearInterval(timer);
        }

        return newState;
      });
    }, 1000);

    return () => clearInterval(timer);
  };

  const handleOptionSelect = (optionIndex) => {
    console.log('Option clicked:', optionIndex);
    console.log('Current state:', {
      selectedOption: gameState.selectedOption,
      status: gameState.status,
      hasQuestion: !!gameState.currentQuestion
    });

    if (gameState.selectedOption !== null || gameState.status !== 'question') {
      console.log('Selection blocked - already selected or wrong status');
      return;
    }
    if (!gameState.currentQuestion || !gameState.currentQuestion.options) {
      console.log('Selection blocked - no question or options');
      return;
    }

    const selectedOption = gameState.currentQuestion.options[optionIndex]?.text || null;
    console.log('Submitting answer:', selectedOption);

    setGameState(prev => ({ ...prev, selectedOption: optionIndex }));

    // Calculate time taken
    const timeTaken = (gameState.currentQuestion?.timeLimit || 30) - gameState.timer;

    // Send answer to server
    socketRef.current.emit('submit-answer', {
      roomCode,
      questionIndex: gameState.questionIndex,
      answer: selectedOption,
      timeTaken: Math.max(0, timeTaken)
    });

    console.log('Answer submitted to server');
  };

  // Render different states
  if (gameState.status === 'connecting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <LoadingSpinner message="Connecting to quiz room..." />
      </div>
    );
  }

  if (gameState.status === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="text-6xl mb-6">🏆</div>
          <h1 className="text-4xl font-bold mb-4">Quiz Complete!</h1>
          <div className="text-2xl font-bold text-cyan-300 mb-2">
            Your Score: {gameState.score}
          </div>
          <p className="text-gray-400 mb-8">Redirecting to results...</p>
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full animate-pulse">
            Loading results...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 p-6 bg-gray-800/40 backdrop-blur-lg rounded-2xl border border-gray-700">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Room: <span className="text-cyan-300">{roomCode}</span>
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="text-gray-400">
                Playing as: <span className="text-white font-medium">{user?.username || localStorage.getItem('username')}</span>
              </div>
              <div className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                Score: <span className="font-bold text-green-300">{gameState.score}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 md:mt-0">
            <div className="flex items-center gap-4">
              <QuizTimer time={gameState.timer} isActive={gameState.status === 'question'} />
              <div className="px-4 py-2 bg-gray-700/50 rounded-xl">
                <div className="text-sm text-gray-400">Question</div>
                <div className="font-bold">
                  {gameState.questionIndex + 1} / {gameState.totalQuestions || '?'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Players & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Participants */}
            <div className="bg-gray-800/40 backdrop-blur-lg rounded-2xl border border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
                <span>👥 Players ({(gameState.players || []).length})</span>
                <span className="text-sm font-normal px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full">
                  Live
                </span>
              </h2>

              {/* Simple player list */}
              <div className="space-y-2">
                {(gameState.players || []).length > 0 ? (
                  (gameState.players || []).map((player, index) => (
                    <div
                      key={player.userId || player.id || index}
                      className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {(player.username || player.displayName || player.name || 'P').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">
                          {player.username || player.displayName || player.name || `Player ${index + 1}`}
                        </div>
                        <div className="text-sm text-gray-400">
                          {player.isReady ? '✓ Ready' : 'Not Ready'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-4xl mb-2">👥</div>
                    <div>No players yet</div>
                  </div>
                )}
              </div>
            </div>

            {/* Game Status */}
            <div className="bg-gray-800/40 backdrop-blur-lg rounded-2xl border border-gray-700 p-6">
              <h3 className="text-lg font-bold mb-4">📊 Game Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className={`font-semibold ${gameState.status === 'waiting' ? 'text-yellow-400' : gameState.status === 'question' ? 'text-green-400' : 'text-blue-400'}`}>
                    {gameState.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Your Score</span>
                  <span className="font-bold text-green-300">{gameState.score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Players</span>
                  <span className="font-bold">{(gameState.players || []).length}</span>
                </div>
                {gameState.roomInfo && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Host</span>
                    <span className="font-medium">{gameState.roomInfo.hostName || 'Unknown'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center Column - Question */}
          <div className="lg:col-span-2">
            {gameState.status === 'waiting' ? (
              <div className="bg-gray-800/40 backdrop-blur-lg rounded-2xl border border-gray-700 p-8 text-center">
                <div className="text-6xl mb-6">🎯</div>
                <h2 className="text-3xl font-bold mb-4">Waiting for Host</h2>
                <p className="text-gray-400 mb-8">
                  The host will start the quiz soon. Get ready!
                </p>
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-700/50 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="font-medium">Connected to room</span>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-900/30 rounded-xl">
                    <div className="text-2xl font-bold text-cyan-300">
                      {gameState.roomInfo?.questionCount || '?'}
                    </div>
                    <div className="text-sm text-gray-400">Questions</div>
                  </div>
                  <div className="p-4 bg-gray-900/30 rounded-xl">
                    <div className="text-2xl font-bold text-green-300">
                      {gameState.players.length}
                    </div>
                    <div className="text-sm text-gray-400">Players</div>
                  </div>
                  <div className="p-4 bg-gray-900/30 rounded-xl">
                    <div className="text-2xl font-bold text-purple-300">
                      {gameState.roomInfo?.category || 'General'}
                    </div>
                    <div className="text-sm text-gray-400">Category</div>
                  </div>
                </div>
              </div>
            ) : gameState.status === 'question' && gameState.currentQuestion ? (
              <div className="bg-gray-800/40 backdrop-blur-lg rounded-2xl border border-gray-700 p-8">
                {/* Question Progress */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-gray-400">
                      Question {gameState.questionIndex + 1} of {gameState.totalQuestions}
                    </div>
                    <div className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                      {gameState.currentQuestion.category}
                    </div>
                  </div>
                  <ProgressBar
                    current={gameState.questionIndex + 1}
                    total={gameState.totalQuestions}
                  />
                </div>

                {/* Question */}
                <h2 className="text-2xl font-bold mb-8">
                  {gameState.currentQuestion.text}
                </h2>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gameState.currentQuestion.options?.map((option, idx) => {
                    let optionState = 'default';
                    if (gameState.selectedOption === idx) {
                      optionState = 'selected';
                    }
                    if (gameState.showFeedback) {
                      if (gameState.selectedOption === idx) {
                        optionState = gameState.isCorrect ? 'correct' : 'incorrect';
                      } else if (option.isCorrect) {
                        optionState = 'correct-other';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        disabled={gameState.selectedOption !== null}
                        className={`p-6 text-left rounded-xl border transition-all duration-300 ${optionState === 'selected'
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : optionState === 'correct'
                            ? 'border-green-500 bg-green-500/10'
                            : optionState === 'incorrect'
                              ? 'border-red-500 bg-red-500/10'
                              : optionState === 'correct-other'
                                ? 'border-green-500/30 bg-green-500/5'
                                : 'border-gray-700 bg-gray-900/30 hover:border-cyan-500/50'
                          } ${gameState.selectedOption === null ? 'hover:scale-[1.02]' : ''}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold text-lg ${optionState === 'selected'
                            ? 'bg-cyan-600 text-white'
                            : optionState === 'correct'
                              ? 'bg-green-600 text-white'
                              : optionState === 'incorrect'
                                ? 'bg-red-600 text-white'
                                : optionState === 'correct-other'
                                  ? 'bg-green-600/30 text-green-300'
                                  : 'bg-gray-800 text-gray-300'
                            }`}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <div className="font-medium flex-1">{option.text}</div>
                          {optionState === 'correct' && (
                            <div className="text-2xl text-green-400">✓</div>
                          )}
                          {optionState === 'incorrect' && (
                            <div className="text-2xl text-red-400">✗</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Timer & Status */}
                <div className="mt-8 text-center text-gray-400">
                  {gameState.selectedOption === null ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                      Select your answer...
                    </div>
                  ) : (
                    <div className="text-cyan-300 font-medium">
                      Answer submitted! Waiting for results...
                    </div>
                  )}
                </div>
              </div>
            ) : gameState.status === 'feedback' && gameState.feedbackData ? (
              <div className="bg-gray-800/40 backdrop-blur-lg rounded-2xl border border-gray-700 p-8">
                <div className={`text-center p-8 rounded-2xl ${gameState.isCorrect
                  ? 'bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/30'
                  : 'bg-gradient-to-br from-red-500/10 to-rose-600/10 border border-red-500/30'
                  }`}>
                  <div className="text-6xl mb-6">
                    {gameState.isCorrect ? '🎉' : '💡'}
                  </div>
                  <h2 className="text-3xl font-bold mb-4">
                    {gameState.isCorrect ? 'Correct!' : 'Not Quite'}
                  </h2>
                  <p className="text-xl mb-6">
                    {gameState.feedbackData.explanation}
                  </p>
                  {gameState.isCorrect ? (
                    <div className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full font-bold text-lg">
                      +{gameState.feedbackData.points} points!
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      The correct answer was: <span className="font-bold text-green-300">
                        {gameState.feedbackData.correctAnswer}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-8 text-center text-gray-400">
                  Next question starting in 2 seconds...
                </div>
              </div>
            ) : null}

            {/* Leaderboard */}
            {gameState.leaderboard?.length > 0 && (
              <div className="mt-6">
                <Leaderboard
                  players={gameState.leaderboard}
                  showHeader={true}
                  currentUserId={user?.id}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayQuiz;
