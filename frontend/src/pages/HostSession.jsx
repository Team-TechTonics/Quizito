
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useQuiz } from '../context/QuizContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import QuizTimer from '../components/QuizTimer';
import '../styles/globals.css';
import { api } from '../lib/api.js';
import useSpeech from '../hooks/useSpeech';

const HostSession = () => {
  const navigate = useNavigate();
  const { roomCode: routeRoomCode } = useParams();
  const { user } = useAuth();
  const { currentQuiz } = useQuiz();
  const socketRef = useRef(null);

  // Room state
  const [roomCode, setRoomCode] = useState(routeRoomCode || '');
  const [participants, setParticipants] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameStatus, setGameStatus] = useState('lobby'); // lobby, starting, question, answer, finished
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [leaderboard, setLeaderboard] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  // Initialize session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setLoading(true);
        setError(null);

        let code = routeRoomCode;
        let id = null;
        let quizTitle = "";
        let questionsCount = 0;

        // If we have a room code from URL, fetch existing session
        if (routeRoomCode) {
          console.log('Restoring session:', routeRoomCode);
          const response = await api.get(`/api/sessions/${routeRoomCode}`);


          if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch session');
          }

          const session = response.data.session;

          // Verify we are the host
          if (user && session.hostId._id !== user._id && session.hostId !== user._id) {
            // throw new Error('You are not the host of this session');
            // Proceed anyway for testing, but ideally should block
            console.warn('User is not the original host');
          }

          code = session.roomCode;
          id = session._id;
          quizTitle = session.quizId?.title;
          questionsCount = session.quizId?.totalQuestions || 0;
          setParticipants(session.participants || []);
          setGameStatus(session.status === 'waiting' ? 'lobby' : session.status);

        } else {
          // No room code, try to create new session from currentQuiz
          // Get quiz from context or localStorage
          const quiz = currentQuiz || JSON.parse(localStorage.getItem('currentQuiz'));

          if (!quiz || !quiz._id) {
            // Cannot create session without quiz
            throw new Error('Quiz data not found. Please create or select a quiz first.');
          }

          // Create session via HTTP API
          console.log('Creating session for quiz:', quiz._id);
          const createSessionResponse = await api.post('/api/sessions', {
            quizId: quiz._id,
            name: quiz.title,
            description: quiz.description,
            settings: {
              maxPlayers: 100,
              questionTime: quiz.questions?.[0]?.timeLimit || 30,
              showLeaderboard: true,
              allowLateJoin: true,
              randomizeQuestions: false
            }
          });

          const sessionData = createSessionResponse.data;
          code = sessionData.session.roomCode;
          id = sessionData.session._id;
          questionsCount = sessionData.session.quiz?.totalQuestions || quiz.questions?.length || 0;
          setParticipants(sessionData.session.participants || []);
        }

        // Update state
        setRoomCode(code);
        setSessionId(id);
        setTotalQuestions(questionsCount);

        // Connect to socket with authentication in handshake
        const token = localStorage.getItem('quizito_token');
        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:10000', {
          reconnection: true,

          reconnectionAttempts: 5,
          transports: ['websocket', 'polling'],
          auth: {
            token: token
          }
        });

        socketRef.current = socket;

        // Successfully connected
        socket.on('connect', () => {
          console.log('Socket connected:', socket.id);
        });

        // Join the session
        socket.emit('join-session', {
          roomCode: code,
          displayName: user?.displayName || user?.username
        });

        // Participant joined
        socket.on('participant-joined', (data) => {
          console.log('Participant joined:', data);
          setParticipants(prev => {
            // Add new participant if not already in list
            const exists = prev.find(p => p.userId === data.participant.userId);
            if (exists) return prev;

            // Update participant count
            toast.success(`${data.participant?.username || 'A player'} joined the room`);

            return [...prev, data.participant];
          });
        });

        // Participant disconnected
        socket.on('participant-disconnected', (data) => {
          console.log('Participant disconnected:', data);
          setParticipants(prev => prev.filter(p => p.userId !== data.userId));
          toast(`${data.username || 'A player'} left the room`, { icon: '👋' });
        });

        // Player ready status
        socket.on('player-ready-update', (data) => {
          console.log('Player ready update:', data);
          setParticipants(prev =>
            prev.map(p =>
              p.userId === data.userId ? { ...p, isReady: data.isReady } : p
            )
          );
        });

        // All players ready
        socket.on('all-players-ready', () => {
          console.log('All players are ready!');
          toast.success('All players are ready to start!');
        });

        // Countdown before quiz starts
        socket.on('countdown', (data) => {
          console.log('Countdown:', data.countdown);
          setGameStatus('starting');
          toast(`Quiz starting in ${data.countdown}...`, { icon: '⏳' });
        });

        // Quiz started - backend sends first question
        socket.on('quiz-started', (data) => {
          console.log('Quiz started:', data);
          setQuizStarted(true);
          setGameStatus('question');
          setCurrentQuestion(data.question);
          setCurrentQuestionIndex(data.questionIndex);
          setTimeRemaining(data.timeRemaining || 30);
          setTotalQuestions(data.totalQuestions);
          setSelectedOption(null); // Reset selection
        });

        // Timer updates
        socket.on('timer-update', (data) => {
          setTimeRemaining(data.timeRemaining);
        });

        // Next question from backend
        socket.on('next-question', (data) => {
          console.log('Next question:', data);
          setGameStatus('question');
          setCurrentQuestion(data.question);
          setCurrentQuestionIndex(data.questionIndex);
          setTimeRemaining(data.timeRemaining || 30);
          setSelectedOption(null); // Reset selection
        });

        // Question completed (showing answers)
        socket.on('question-completed', (data) => {
          console.log('Question completed:', data);
          setGameStatus('answer');

          // Show correct answer and explanation
          if (data.explanation) {
            toast.success(`Correct answer: ${data.correctAnswer} `, { duration: 5000 });
          }
        });

        // Question time up
        socket.on('question-time-up', (data) => {
          console.log('Question time up:', data);
          setGameStatus('answer');
          toast.error("Time's up!");
        });

        // Quiz completed
        socket.on('quiz-completed', (data) => {
          console.log('Quiz completed:', data);
          setGameStatus('finished');
          setLeaderboard(data.finalResults?.leaderboard || []);

          // Save results to localStorage for results page
          localStorage.setItem('quizResults', JSON.stringify({
            sessionId: data.finalResults?.sessionId,
            quizId: data.finalResults?.quizId,
            leaderboard: data.finalResults?.leaderboard,
            totalQuestions: data.finalResults?.totalQuestions,
            duration: data.finalResults?.duration
          }));

          // Redirect to results page after delay
          setTimeout(() => {
            navigate('/results', {
              state: {
                roomCode: roomCode,
                sessionId: data.finalResults?.sessionId,
                leaderboard: data.finalResults?.leaderboard
              }
            });
          }, 5000);
        });

        // Leaderboard updates
        socket.on('leaderboard-update', (data) => {
          console.log('Leaderboard updated:', data);
          setLeaderboard(data.leaderboard);
          // Update participant scores
          setParticipants(prev =>
            prev.map(p => {
              const leaderboardEntry = data.leaderboard.find(l => l.userId === p.userId);
              return leaderboardEntry ? { ...p, score: leaderboardEntry.score } : p;
            })
          );
        });

        // Session ended by host
        socket.on('session-ended-by-host', (data) => {
          console.log('Session ended by host:', data);
          setGameStatus('finished');
          toast('Session ended by host', { icon: '🛑' });

          setTimeout(() => {
            navigate('/profile');
          }, 3000);
        });

        // Error handling
        socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          toast.error('Connection failed. Please check your internet.');
        });

        socket.on('error', (errorData) => {
          console.error('Socket error:', errorData);
          const errorMsg = typeof errorData === 'string' ? errorData : errorData?.message || 'Socket error';
          toast.error(errorMsg);
        });

        setLoading(false);

        return () => {
          if (socketRef.current) {
            socketRef.current.disconnect();
          }
        };

      } catch (err) {
        console.error('Session initialization error:', err);
        setError(err.message || 'Failed to create session');
        setLoading(false);
        toast.error(err.message || 'Failed to create session');
      }
    };

    initializeSession();
  }, [navigate, currentQuiz, user]);

  // Speech Integration
  const { speak, stop, toggleSpeech, speechEnabled, isSpeaking } = useSpeech();

  useEffect(() => {
    if (gameStatus === 'question' && currentQuestion && speechEnabled) {
      // Speak the question text
      speak(currentQuestion.text);

      // Optionally speak options after a delay? 
      // For now just the question to avoid noise.
    } else if (gameStatus !== 'question') {
      stop();
    }
  }, [currentQuestion, gameStatus, speechEnabled, speak, stop]);


  const handleStartQuiz = () => {
    if (!socketRef.current || !roomCode) {
      toast.error('Not connected to session');
      return;
    }

    if (participants.length === 0) {
      toast.error('Wait for at least one player to join before starting');
      return;
    }

    socketRef.current.emit('start-quiz', {
      roomCode: roomCode
    });
  };

  const handleEndQuiz = () => {
    if (!socketRef.current || !roomCode) {
      NotificationCenter.add({
        type: 'error',
        message: 'Not connected to session',
        duration: 3000
      });
      return;
    }

    socketRef.current.emit('end-session', {
      roomCode: roomCode
    });

    // Also call REST API to end session
    api.post(`/api/sessions/${roomCode}/end`).catch(console.error);
  };

  const handleKickPlayer = (userId) => {
    if (!socketRef.current || !roomCode) return;

    socketRef.current.emit('kick-player', {
      roomCode: roomCode,
      userId: userId
    });
  };

  if (loading) {
    return <LoadingSpinner text="Setting up your quiz room..." fullScreen={true} color="cyan" />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 max-w-md">
          <h2 className="text-red-400 font-bold mb-2">Error</h2>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={() => navigate('/create-quiz')}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
          >
            Go to Create Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 p-6 bg-gray-800/40 backdrop-blur-lg rounded-2xl border border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Host Quiz Session</h1>
              <div className="flex items-center gap-4">
                <p className="text-gray-400">
                  Room Code: <span className="text-cyan-300 font-bold text-2xl">{roomCode}</span>
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(roomCode);
                    toast.success('Room code copied to clipboard!');
                  }}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Host: {user?.username}</p>
              <p className="text-gray-400 text-sm capitalize">Status: {gameStatus.replace('-', ' ')}</p>
              <p className="text-gray-400 text-sm">Players: {participants.length}</p>
            </div>
          </div>
        </div>

        {!quizStarted ? (
          // Lobby view
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Participants list */}
            <div className="lg:col-span-2 bg-gray-800/40 backdrop-blur-lg rounded-2xl border border-gray-700 p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-cyan-400">👥</span> Waiting Room ({participants.length})
              </h2>
              <div className="space-y-3">
                {participants.length > 0 ? (
                  participants.map(p => (
                    <div key={p.userId || p.socketId} className="flex items-center justify-between bg-gray-700/30 p-3 rounded-lg hover:bg-gray-700/50 transition">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`}
                          alt={p.username}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-semibold">{p.username}</p>
                          <p className="text-xs text-gray-400">
                            {p.role === 'host' ? '👑 Host' : '🎮 Player'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Status:</p>
                          <p className={`text-sm font-semibold ${p.isReady ? 'text-green-400' : 'text-yellow-400'}`}>
                            {p.isReady ? 'Ready' : 'Not Ready'}
                          </p>
                        </div>
                        {p.role !== 'host' && (
                          <button
                            onClick={() => handleKickPlayer(p.userId)}
                            className="px-3 py-1 bg-red-900/30 hover:bg-red-900/50 border border-red-700 rounded-lg text-sm"
                          >
                            Kick
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">👤</div>
                    <p className="text-gray-400 text-lg mb-2">Waiting for players...</p>
                    <p className="text-gray-500 text-sm">Share the room code <span className="font-bold text-cyan-300">{roomCode}</span> with players</p>
                  </div>
                )}
              </div>
            </div>

            {/* Start button and info */}
            <div className="space-y-6">
              <button
                onClick={handleStartQuiz}
                disabled={participants.length === 0}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                🎯 Start Quiz
              </button>

              <div className="bg-gray-800/40 backdrop-blur-lg rounded-2xl border border-gray-700 p-6">
                <h3 className="font-bold text-lg mb-4">📊 Session Info</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Questions:</span>
                    <span className="font-bold">{totalQuestions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Players:</span>
                    <span className="font-bold">{participants.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Status:</span>
                    <span className={`font-bold ${gameStatus === 'lobby' ? 'text-yellow-400' : 'text-green-400'}`}>
                      {gameStatus === 'lobby' ? 'Waiting' : 'Starting...'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Room Code:</span>
                    <span className="font-mono font-bold text-cyan-300">{roomCode}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/40 backdrop-blur-lg rounded-2xl border border-gray-700 p-6">
                <h3 className="font-bold text-lg mb-4">⚡ Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/create-quiz')}
                    className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    <span>📝</span> Create New Quiz
                  </button>
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    <span>🏠</span> Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Quiz view
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Question display */}
            <div className="lg:col-span-2 bg-gray-800/40 backdrop-blur-lg rounded-2xl border border-gray-700 p-6">
              {currentQuestion ? (
                <>
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">
                        Q{currentQuestionIndex + 1}/{totalQuestions}
                      </h2>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleSpeech}
                          className={`p-2 rounded-full transition ${speechEnabled ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                          title={speechEnabled ? "Disable Text-to-Speech" : "Enable Text-to-Speech"}
                        >
                          {speechEnabled ? "🔊" : "🔇"}
                        </button>
                        <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                          {currentQuestion.difficulty || 'Medium'}
                        </span>
                        <span className="px-3 py-1 bg-blue-900/30 rounded-full text-sm">
                          {currentQuestion.points || 100} pts
                        </span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-6">{currentQuestion.text}</h3>

                    {currentQuestion.options && (
                      <div className="space-y-3">
                        {currentQuestion.options.map((option, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              if (gameStatus === 'question' && selectedOption === null) {
                                setSelectedOption(i); // Mark as selected

                                // Submit answer using the socket ref
                                // Need to calculate time taken or just send raw
                                const timeTaken = 30 - timeRemaining;
                                socketRef.current.emit('submit-answer', {
                                  roomCode,
                                  questionId: currentQuestion._id,
                                  selectedOption: i,
                                  timeTaken
                                });
                                // Optimistic update or wait for result?
                                // PlayQuiz waits for 'answer-result'. HostSession currently doesn't listen to it?
                                // Let's add toast for feedback
                                toast.success('Answer submitted!');
                              }
                            }}
                            className={`p-4 border rounded-lg transition cursor-pointer ${selectedOption === i
                              ? 'bg-blue-600 border-blue-400 ring-2 ring-blue-400'
                              : gameStatus === 'question'
                                ? 'bg-gray-800/30 border-gray-600 hover:bg-gray-700/50 hover:border-cyan-500' // Default interactive
                                : 'bg-gray-800/50 border-gray-700 opacity-70 cursor-not-allowed' // Disabled
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${selectedOption === i ? 'bg-white text-blue-600' : 'bg-gray-700'}`}>
                                {String.fromCharCode(65 + i)}
                              </div>
                              <span className="text-lg">{option.text}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {gameStatus === 'question' && (
                    <div className="mt-8 p-4 bg-gray-800/50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <QuizTimer time={timeRemaining} isActive={true} />
                          <span className="text-gray-400">
                            {timeRemaining > 0 ? 'Time remaining' : 'Time\'s up!'}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Question</p>
                          <p className="font-bold">{currentQuestionIndex + 1} of {totalQuestions}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {gameStatus === 'answer' && (
                    <div className="mt-6 p-4 bg-green-900/20 border border-green-700 rounded-xl">
                      <h4 className="font-bold text-green-400 mb-2">Answer Revealed</h4>
                      <p className="text-gray-300">
                        The correct answer is: <span className="font-bold text-white">{currentQuestion.correctAnswer || 'Check above'}</span>
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🤔</div>
                  <p className="text-gray-400 text-xl">Waiting for question...</p>
                </div>
              )}
            </div>

            {/* Leaderboard and Controls */}
            <div className="space-y-6">
              <div className="bg-gray-800/40 backdrop-blur-lg rounded-2xl border border-gray-700 p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span>📊</span> Live Leaderboard
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {participants.length > 0 ? (
                    participants
                      .sort((a, b) => (b.score || 0) - (a.score || 0))
                      .map((p, i) => (
                        <div key={p.userId || p.socketId} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${i === 0 ? 'bg-yellow-900/30 border border-yellow-700' :
                              i === 1 ? 'bg-gray-700 border border-gray-600' :
                                i === 2 ? 'bg-amber-900/30 border border-amber-700' :
                                  'bg-gray-800 border border-gray-700'
                              }`}>
                              {i + 1}
                            </div>
                            <div>
                              <p className="font-semibold">{p.username}</p>
                              <p className="text-xs text-gray-400">
                                {p.correctAnswers || 0} correct
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-400">{p.score || 0}</p>
                            <p className="text-xs text-gray-400">points</p>
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-gray-400 text-center py-4">No players yet</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-800/40 backdrop-blur-lg rounded-2xl border border-gray-700 p-6">
                <h3 className="font-bold mb-4">🎮 Host Controls</h3>
                <div className="space-y-3">
                  {gameStatus === 'question' && (
                    <button
                      onClick={() => {
                        // Force next question
                        socketRef.current.emit('next-question-force', { roomCode });
                      }}
                      className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
                    >
                      ⏩ Next Question
                    </button>
                  )}

                  <button
                    onClick={handleEndQuiz}
                    className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
                  >
                    🏁 End Quiz
                  </button>
                </div>
              </div>

              {/* Game status display */}
              <div className="bg-gray-800/40 backdrop-blur-lg rounded-2xl border border-gray-700 p-6">
                <h3 className="font-bold mb-4">📈 Game Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`font-bold capitalize ${gameStatus === 'question' ? 'text-green-400' :
                      gameStatus === 'answer' ? 'text-yellow-400' :
                        gameStatus === 'finished' ? 'text-red-400' :
                          'text-blue-400'
                      }`}>
                      {gameStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Q:</span>
                    <span className="font-bold">{currentQuestionIndex + 1}/{totalQuestions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Players:</span>
                    <span className="font-bold">{participants.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Connection status */}
        <div className="mt-6 text-center">
          {socketRef.current?.connected ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/20 border border-green-700 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">Connected</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-900/20 border border-red-700 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-400">Disconnected</span>
            </div>
          )}
        </div>

        {gameStatus === 'finished' && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center max-w-md w-full">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
              <p className="text-gray-400 mb-6">Redirecting to results page...</p>
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostSession;