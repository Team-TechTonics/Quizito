// src/pages/HostSession.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuiz } from '../context/QuizContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import QuizTimer from '../components/QuizTimer';
import '../styles/globals.css';
import { quizService, socketService } from '../services';
import useSpeech from '../hooks/useSpeech';
import Chat from '../components/Chat';

const HostSession = () => {
  const navigate = useNavigate();
  const { roomCode: routeRoomCode } = useParams();
  const { user, token } = useAuth();
  const { currentQuiz } = useQuiz();

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
  const [chatEnabled, setChatEnabled] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

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

        // 1. Get/Create Session Logic
        if (routeRoomCode) {
          console.log('Restoring session:', routeRoomCode);
          const response = await quizService.getQuizById(routeRoomCode).catch(() => null); // Adjust if getSessionByRoomCode exists
          // Since getQuizById takes ID not room code, we probably need a specific endpoint or assume local handling for now.
          // Wait, the previous code used api.get(`/api/sessions/${routeRoomCode}`)

          // Let's use direct API call for session if quizService doesn't have it explicitly yet, or add it.
          // For now, I'll stick to logic similar to before but cleaner, or assume quizService.getSession(code)
          // To be safe, let's assume we need to fetch it.
          // TODO: Add getSession to quizService properly. For now, inline or rely on what we have.
        }

        // Actually, let's keep the logic robust. 
        // If routeRoomCode exists, we fetch session. If not, we create one.

        // Connect Socket
        socketService.connect(token);

        if (routeRoomCode) {
          socketService.joinSession(routeRoomCode, user?.username || 'Host');
          setRoomCode(routeRoomCode);
          // We would ideally fetch session details here to populate state if joining an existing one
        } else {
          // Create mode
          const quiz = currentQuiz || JSON.parse(localStorage.getItem('currentQuiz'));
          if (!quiz || !quiz._id) throw new Error('Quiz data not found');

          const session = await quizService.createSession({
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

          code = session.roomCode;
          id = session._id;
          questionsCount = session.quiz?.totalQuestions || quiz.questions?.length || 0;
          setRoomCode(code);
          setSessionId(id);
          setTotalQuestions(questionsCount);

          socketService.joinSession(code, user?.username || 'Host');
        }

        // Setup Event Listeners
        const handleParticipantJoined = (data) => {
          console.log('Participant joined:', data);
          setParticipants(prev => {
            const exists = prev.find(p => p.userId === data.participant.userId);
            if (exists) return prev;
            toast.success(`${data.participant?.username || 'A player'} joined`);
            return [...prev, data.participant];
          });
        };

        const handleParticipantDisconnected = (data) => {
          setParticipants(prev => prev.filter(p => p.userId !== data.userId));
          toast(`${data.username || 'A player'} left`, { icon: '👋' });
        };

        const handleQuizStarted = (data) => {
          const question = { ...data.question };
          if (question?.options && !Array.isArray(question.options)) {
            question.options = Object.values(question.options);
          }
          setQuizStarted(true);
          setGameStatus('question');
          setCurrentQuestion(question);
          setCurrentQuestionIndex(data.questionIndex);
          setTimeRemaining(data.timeRemaining || 30);
          setTotalQuestions(data.totalQuestions);
          setSelectedOption(null);
        };

        const handleNextQuestion = (data) => {
          const question = { ...data.question };
          if (question?.options && !Array.isArray(question.options)) {
            question.options = Object.values(question.options);
          }
          setGameStatus('question');
          setCurrentQuestion(question);
          setCurrentQuestionIndex(data.questionIndex);
          setTimeRemaining(data.timeRemaining || 30);
          setSelectedOption(null);
        };

        const handleQuestionCompleted = (data) => {
          setGameStatus('answer');
          if (data.explanation) {
            toast.success(`Answer: ${data.correctAnswer}`, { duration: 4000 });
          }
        };

        const handleQuizCompleted = (data) => {
          setGameStatus('finished');
          setLeaderboard(data.finalResults?.leaderboard || []);
          localStorage.setItem('quizResults', JSON.stringify(data.finalResults));
          setTimeout(() => navigate('/results', { state: data.finalResults }), 5000);
        };

        const handleLeaderboardUpdate = (data) => {
          if (data.leaderboard) {
            setLeaderboard(data.leaderboard);
            setParticipants(prev => prev.map(p => {
              const entry = data.leaderboard.find(l => l.userId === p.userId);
              return entry ? { ...p, score: entry.score } : p;
            }));
          }
        };

        const handleChatMessage = (message) => {
          setChatMessages(prev => [...prev, message]);
        };

        // Register listeners
        socketService.onParticipantJoined(handleParticipantJoined);
        socketService.onParticipantDisconnected(handleParticipantDisconnected);
        socketService.onQuizStarted(handleQuizStarted);
        socketService.onNextQuestion(handleNextQuestion);
        socketService.onQuestionCompleted(handleQuestionCompleted);
        socketService.onQuestionTimeUp((data) => {
          setGameStatus('answer');
          toast.error("Time's up!");
        });
        socketService.onQuizCompleted(handleQuizCompleted);
        socketService.onLeaderboardUpdate(handleLeaderboardUpdate);
        socketService.onTimerUpdate((data) => setTimeRemaining(data.timeRemaining));
        socketService.onChatMessage(handleChatMessage);
        socketService.onSessionEndedByHost(() => {
          toast('Session ended', { icon: '🏁' });
          navigate(`/dashboard`); // Go back to dashboard on forced end
        });

      } catch (err) {
        console.error('Session init error:', err);
        setError(err.message || 'Failed to initialize session');
        toast.error('Session Error: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();

    // Cleanup
    return () => {
      socketService.removeAllListeners();
      // Optionally disconnect if we want to clean up completely, 
      // but usually we keep socket open for other features. 
      // For a specific session page, maybe just leave room?
      // socketService.leaveSession(roomCode); // If method existed
    };
  }, [navigate, routeRoomCode, currentQuiz, user, token]);

  // Speech Integration
  const { speak, stop, toggleSpeech, speechEnabled, isSpeaking } = useSpeech();

  useEffect(() => {
    if (gameStatus === 'question' && currentQuestion && speechEnabled) {
      speak(currentQuestion.text);
    } else if (gameStatus !== 'question') {
      stop();
    }
  }, [currentQuestion, gameStatus, speechEnabled, speak, stop]);


  const handleStartQuiz = () => {
    if (participants.length === 0) {
      toast.error('Wait for at least one player');
      return;
    }
    socketService.startQuiz(roomCode);
  };

  const handleEndQuiz = () => {
    socketService.endSession(roomCode);
    // Also call API to ensure DB update
    // api.post(...) handled by socket mostly, but good redundancy to keep if needed
  };

  const handleNextForce = () => {
    socketService.nextQuestionForce(roomCode);
  }

  const handleKickPlayer = (userId) => {
    socketService.kickPlayer(roomCode, userId);
  }

  const handleSendMessage = (text) => {
    if (!roomCode || !user) return;
    socketService.sendChatMessage({
      roomCode,
      userId: user.id || user._id,
      username: user.username || 'Host',
      message: text,
      isHost: true
    });
  };

  if (loading) return <LoadingSpinner text="Setting up session..." fullScreen={true} color="cyan" />;
  if (error) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-red-900/30 border border-red-500 rounded-xl p-8 max-w-md text-center">
        <h2 className="text-xl font-bold text-red-200 mb-4">Connection Error</h2>
        <p className="text-gray-300 mb-6">{error}</p>
        <button
          onClick={() => navigate('/create-quiz')}
          className="px-6 py-2 bg-red-600 rounded-lg text-white font-bold hover:bg-red-700"
        >
          Back to Create
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-black text-white p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-gray-800/40 backdrop-blur-md p-6 rounded-2xl border border-white/10">
          <div>
            <span className="text-purple-400 font-bold tracking-wider text-sm uppercase">Host Panel</span>
            <h1 className="text-3xl font-bold">Quiz Session</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-gray-400 text-xs uppercase font-bold">Room Code</p>
              <div className="flex items-center gap-2">
                <span className="text-4xl font-mono font-bold text-cyan-400 tracking-wider">{roomCode}</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(roomCode); toast.success('Copied!'); }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  📋
                </button>
              </div>
            </div>
            <div className="h-10 w-px bg-white/10 hidden md:block"></div>
            <div className="text-right hidden md:block">
              <p className="text-sm text-gray-400">Status: <span className="text-white capitalize font-bold">{gameStatus}</span></p>
              <p className="text-sm text-gray-400">Players: <span className="text-white font-bold">{participants.length}</span></p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Game Area */}
          <div className="lg:col-span-2 space-y-6">

            {/* Lobby View */}
            {!quizStarted && (
              <div className="bg-gray-800/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 min-h-[400px]">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  Waiting Room ({participants.length})
                </h2>

                {participants.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {participants.map(p => (
                      <div key={p.userId} className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center font-bold">
                            {p.username[0].toUpperCase()}
                          </div>
                          <span className="font-medium truncate max-w-[100px]">{p.username}</span>
                        </div>
                        <button
                          onClick={() => handleKickPlayer(p.userId)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 text-red-400 rounded transition-all"
                          title="Kick Player"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 animate-pulse">
                      <span className="text-2xl">⏳</span>
                    </div>
                    <p className="text-lg">Waiting for players to join...</p>
                    <p className="text-sm">Join code: <span className="text-cyan-400 font-mono">{roomCode}</span></p>
                  </div>
                )}

                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleStartQuiz}
                    disabled={participants.length === 0}
                    className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-xl shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
                  >
                    Start Quiz 🚀
                  </button>
                </div>
              </div>
            )}

            {/* Question View */}
            {quizStarted && currentQuestion && (
              <div className="bg-gray-800/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 relative overflow-hidden">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-1000"
                  style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}></div>

                <div className="flex justify-between items-center mb-6">
                  <span className="bg-white/10 px-3 py-1 rounded-full text-sm font-bold">
                    Question {currentQuestionIndex + 1} / {totalQuestions}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={toggleSpeech}
                      className={`p-2 rounded-full ${speechEnabled ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-gray-400'}`}
                    >
                      {speechEnabled ? '🔊' : '🔇'}
                    </button>
                    <QuizTimer time={timeRemaining} totalTime={currentQuestion.timeLimit} isActive={gameStatus === 'question'} />
                  </div>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-tight">
                  {currentQuestion.question}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.options?.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border-2 transition-all opacity-90
                                        ${gameStatus === 'answer' && opt.isCorrect ? 'border-green-500 bg-green-500/20' :
                          gameStatus === 'answer' && !opt.isCorrect ? 'border-white/5 bg-white/5 opacity-50' :
                            'border-white/10 bg-white/5'}
                                    `}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold
                                            ${gameStatus === 'answer' && opt.isCorrect ? 'bg-green-500 text-black' : 'bg-white/10'}
                                        `}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="font-medium text-lg">{opt.text}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {gameStatus === 'answer' && (
                  <div className="mt-8 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <h4 className="text-green-400 font-bold mb-1">Answer & Explanation</h4>
                    <p className="text-gray-300">{currentQuestion.explanation || "Correct answer: " + currentQuestion.correctAnswer}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Stats & Controls */}
          <div className="space-y-6">

            {/* Chat Panel */}
            <div className="bg-gray-800/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[400px]">
              <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  💬 Live Chat
                </h3>
                <button
                  onClick={() => {
                    const newState = !chatEnabled;
                    setChatEnabled(newState);
                    socketService.toggleChat(roomCode, newState);
                    toast.success(`Chat ${newState ? 'enabled' : 'disabled'}`);
                  }}
                  className={`text-xs px-2 py-1 rounded border ${chatEnabled ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}`}
                >
                  {chatEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <Chat
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                  currentUser={user}
                />
              </div>
            </div>

            {/* Control Panel */}
            <div className="bg-gray-800/40 backdrop-blur-md border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Host Controls</h3>
              <div className="space-y-3">
                {gameStatus === 'question' && (
                  <button
                    onClick={handleNextForce}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-colors"
                  >
                    Skip Timer ⏩
                  </button>
                )}
                <button
                  onClick={handleEndQuiz}
                  className="w-full py-3 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/50 rounded-xl font-bold transition-colors"
                >
                  End Session 🛑
                </button>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-gray-800/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex-1 max-h-[500px] flex flex-col">
              <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                <span>🏆 Leaderboard</span>
                <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">Live</span>
              </h3>

              <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry, idx) => (
                    <div key={entry.userId} className={`flex items-center justify-between p-3 rounded-xl ${idx === 0 ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-white/5'}`}>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold w-6 text-center ${idx === 0 ? 'text-yellow-400' : 'text-gray-400'}`}>#{idx + 1}</span>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{entry.username}</span>
                          <span className="text-xs text-gray-500">{entry.correctAnswers || 0} correct</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-cyan-400">{entry.score}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No scores yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostSession;