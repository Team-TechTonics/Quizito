
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
import { motion, AnimatePresence } from 'framer-motion';

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
  const [countdown, setCountdown] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [questionDuration, setQuestionDuration] = useState(30);

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

        // Connect Socket
        socketService.connect(token);

        if (routeRoomCode) {
          socketService.joinSession(routeRoomCode, user?.username || 'Host');
          setRoomCode(routeRoomCode);
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

          // Set dynamic time
          const duration = question.timeLimit || 30; // Default to 30 if missing
          setQuestionDuration(duration);
          setTimeRemaining(data.timeRemaining || duration);

          setTotalQuestions(data.totalQuestions);
          setSelectedOption(null);
          setCountdown(null);
        };

        const handleCountdown = (data) => {
          setCountdown(data.countdown);
          // Play beep sound logic or speech
          const synth = window.speechSynthesis;
          if (synth && data.countdown <= 3) {
            const utterance = new SpeechSynthesisUtterance(data.countdown.toString());
            utterance.rate = 1.5;
            synth.speak(utterance);
          }
        };

        const handleNextQuestion = (data) => {
          const question = { ...data.question };
          if (question?.options && !Array.isArray(question.options)) {
            question.options = Object.values(question.options);
          }
          setGameStatus('question');
          setCurrentQuestion(question);
          setCurrentQuestionIndex(data.questionIndex);

          // Set dynamic time
          const duration = question.timeLimit || 30;
          setQuestionDuration(duration);
          setTimeRemaining(data.timeRemaining || duration);

          setSelectedOption(null);
        };

        const handleQuestionCompleted = (data) => {
          setGameStatus('answer');
        };

        const handleQuizCompleted = (data) => {
          setGameStatus('finished');
          setLeaderboard(data.finalResults?.leaderboard || []);
          localStorage.setItem('quizResults', JSON.stringify(data.finalResults));
          setTimeout(() => navigate('/results', { state: data.finalResults }), 8000);
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

        const handlePlayerReady = (data) => {
          // Ideally update participant ready state here
          setParticipants(prev => prev.map(p =>
            p.userId === data.userId ? { ...p, isReady: data.isReady } : p
          ));
        };

        // Register listeners
        socketService.onParticipantJoined(handleParticipantJoined);
        socketService.onParticipantDisconnected(handleParticipantDisconnected);
        socketService.onQuizStarted(handleQuizStarted);
        socketService.onNextQuestion(handleNextQuestion);
        socketService.onQuestionCompleted(handleQuestionCompleted);
        socketService.onQuestionTimeUp((data) => {
          setGameStatus('answer');
        });
        socketService.onQuizCompleted(handleQuizCompleted);
        socketService.onLeaderboardUpdate(handleLeaderboardUpdate);
        socketService.onTimerUpdate((data) => setTimeRemaining(data.timeRemaining));
        socketService.onChatMessage(handleChatMessage);
        socketService.onPlayerReadyUpdate(handlePlayerReady);
        socketService.on('countdown', handleCountdown);

        socketService.onSessionEndedByHost(() => {
          toast('Session ended', { icon: '🏁' });
          navigate(`/dashboard`);
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

    return () => {
      socketService.removeAllListeners();
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

  // Host Gameplay Interaction
  const handleOptionClick = (index) => {
    // Only allow selection if game is active and not already selected
    if (gameStatus !== 'question' || selectedOption !== null) return;

    setSelectedOption(index);

    // Submit answer to socket
    // NOTE: Host usually shouldn't play, but user requested it.
    // Ensure backend supports host answering if roomCode/userId logic matches.
    socketService.submitAnswer({
      roomCode,
      questionIndex: currentQuestionIndex,
      answer: index
    }, (response) => {
      if (!response.success) {
        console.error('Failed to submit answer:', response.message);
      }
    });

    // Optional: sound
    const audio = new Audio('/sounds/select.mp3');
    audio.play().catch(() => { });
  };

  const handleStartQuiz = () => {
    if (participants.length === 0) {
      toast.error('Wait for at least one player');
      return;
    }

    socketService.startQuiz(roomCode, (response) => {
      if (response.success) {
        toast.success('Quiz starting!');
      } else {
        toast.error(response.message || 'Failed to start quiz');
      }
    });
  };

  const handleEndQuiz = () => {
    socketService.endSession(roomCode);
  };

  const handleNextForce = () => {
    socketService.nextQuestionForce(roomCode);
  }

  const handleKickPlayer = (userId) => {
    socketService.kickPlayer(roomCode, userId, (response) => {
      if (response.success) {
        toast.success('Player removed');
      } else {
        toast.error(response.message || 'Failed to kick player');
      }
    });
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

  if (loading) return <LoadingSpinner text="Setting up party..." fullScreen={true} color="purple" />;
  if (error) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-red-900/30 border border-red-500 rounded-xl p-8 max-w-md text-center">
        <h2 className="text-xl font-bold text-red-200 mb-4">Connection Error</h2>
        <p className="text-gray-300 mb-6">{error}</p>
        <button onClick={() => navigate('/create-quiz')} className="px-6 py-2 bg-red-600 rounded-lg text-white font-bold hover:bg-red-700">Back</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 font-sans overflow-hidden">

      {/* Background Decorations - Subtle */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[70vh] h-[70vh] rounded-full bg-indigo-100/50 blur-3xl"></div>
        <div className="absolute top-[20%] -left-[10%] w-[50vh] h-[50vh] rounded-full bg-purple-100/50 blur-3xl"></div>
      </div>

      {/* COUNTDOWN OVERLAY */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            key={countdown}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1.2, rotate: 0 }}
              className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 drop-shadow-2xl"
            >
              {countdown}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col h-[calc(100vh-2rem)]">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-3 rounded-xl shadow-md text-white">
              <span className="text-xl font-bold">Q</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Host Panel</h1>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                Code:
                <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded tracking-wider border border-indigo-100">
                  {roomCode}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Status</p>
              <div className="flex items-center gap-2 justify-end">
                <span className={`w-2.5 h-2.5 rounded-full ${gameStatus === 'lobby' ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`}></span>
                <span className="font-bold text-slate-700 text-sm">{gameStatus.toUpperCase()}</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
            <div className="text-right hidden md:block">
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Players</p>
              <p className="font-bold text-slate-700 text-lg leading-none">{participants.length}</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">

          {/* GAME AREA */}
          <div className="lg:col-span-2 flex flex-col h-full min-h-0">

            {/* LOBBY VIEW */}
            {!quizStarted && (
              <div className="flex-1 bg-white rounded-3xl shadow-xl border border-slate-100 p-8 flex flex-col relative overflow-hidden">
                <div className="text-center mb-10">
                  <h2 className="text-4xl font-black text-slate-800 mb-3">
                    Waiting for Players...
                  </h2>
                  <p className="text-slate-500 text-lg">
                    Join at <span className="text-indigo-600 font-bold">quizito.com</span> using code
                  </p>
                  <div className="mt-4 text-5xl font-mono font-black text-indigo-600 tracking-widest">
                    {roomCode}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 mb-6">
                  {participants.length > 0 ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      <AnimatePresence>
                        {participants.map((p, i) => (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            key={p.userId}
                            className="aspect-square bg-slate-50 rounded-2xl flex flex-col items-center justify-center relative group hover:bg-white hover:shadow-lg transition-all border-2 border-slate-100 hover:border-indigo-200"
                          >
                            <div className="mb-2 text-4xl transform group-hover:scale-110 transition-transform">
                              {p.avatar ? <img src={p.avatar} alt="avatar" className="w-14 h-14 rounded-full shadow-sm" /> : '😎'}
                            </div>
                            <p className="font-bold text-sm truncate w-full text-center px-2 text-slate-700">{p.username}</p>
                            {p.isReady && (
                              <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                            )}
                            <button
                              onClick={() => handleKickPlayer(p.userId)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md scale-90 hover:scale-110"
                            >
                              ✕
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300">
                      <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-indigo-200 animate-spin mb-4"></div>
                      <p className="text-lg font-medium">Waiting for someone to join...</p>
                    </div>
                  )}
                </div>

                <div className="mt-auto flex justify-center pt-6 border-t border-slate-100">
                  <button
                    onClick={handleStartQuiz}
                    disabled={participants.length === 0}
                    className="px-16 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl text-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none flex items-center gap-3"
                  >
                    <span>START GAME</span>
                    <span className="text-2xl">🚀</span>
                  </button>
                </div>
              </div>
            )}

            {/* QUESTION VIEW */}
            {quizStarted && currentQuestion && (
              <div className="flex-1 bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 flex flex-col relative overflow-hidden">
                {/* Timer Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: questionDuration, ease: "linear" }}
                    key={currentQuestionIndex + gameStatus}
                    className="h-full bg-indigo-500"
                  />
                </div>

                <div className="flex justify-between items-center mb-6 mt-2">
                  <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider border border-slate-200">
                    Question {currentQuestionIndex + 1} / {totalQuestions}
                  </span>
                  <QuizTimer time={timeRemaining} totalTime={questionDuration} isActive={gameStatus === 'question'} size="sm" />
                </div>

                <div className="flex-1 flex flex-col justify-center min-h-0">
                  <div className="flex-1 flex items-center justify-center mb-8">
                    <h2 className="text-2xl md:text-4xl font-bold text-center text-slate-800 leading-snug">
                      {currentQuestion.question}
                    </h2>
                  </div>

                  {/* Options - Interactivity ENABLED for Host (per user request) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
                    {currentQuestion.options?.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleOptionClick(i)}
                        disabled={gameStatus !== 'question' || selectedOption !== null}
                        className={`p-5 rounded-xl border-2 transition-all flex items-center gap-4 text-left group relative
                                   ${gameStatus === 'answer' && opt.isCorrect
                            ? 'border-green-500 bg-green-50 shadow-md ring-1 ring-green-200'
                            : gameStatus === 'answer' && !opt.isCorrect
                              ? 'border-slate-100 bg-slate-50 opacity-50'
                              : selectedOption === i
                                ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg transform scale-[1.02]'
                                : 'border-slate-200 bg-white shadow-sm hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md cursor-pointer'}
                                `}
                      >
                        <div className={`w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-xl shadow-sm transition-colors
                                      ${gameStatus === 'answer' && opt.isCorrect
                            ? 'bg-green-500 text-white'
                            : selectedOption === i
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}
                                   `}>
                          {['A', 'B', 'C', 'D'][i]}
                        </div>
                        <span className={`text-lg font-medium transition-colors ${gameStatus === 'answer' && opt.isCorrect ? 'text-green-800' :
                          selectedOption === i ? 'text-white' : 'text-slate-700'
                          }`}>
                          {typeof opt === 'string' ? opt : opt.text}
                        </span>

                        {/* Status Icons */}
                        {gameStatus === 'answer' && opt.isCorrect && (
                          <div className="ml-auto text-green-600">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          </div>
                        )}
                        {selectedOption === i && gameStatus === 'question' && (
                          <div className="ml-auto text-white/80 animate-pulse">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {gameStatus === 'answer' && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      className="absolute bottom-6 left-1/2 -translate-x-1/2 w-3/4 md:w-1/2 bg-white/95 backdrop-blur shadow-2xl p-6 rounded-2xl border border-indigo-100 text-center z-20"
                    >
                      <p className="text-indigo-600 font-extrabold mb-1 uppercase tracking-widest text-xs">Explanation</p>
                      <p className="text-slate-800 font-medium text-lg leading-relaxed">{currentQuestion.explanation || "Great work!"}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

          </div>

          {/* CONTROLS & CHAT SIDEBAR */}
          <div className="flex flex-col gap-6 min-h-0 h-full">

            {/* Leaderboard Mini */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-5 flex-[2] min-h-0 flex flex-col">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-4 text-slate-800 pb-2 border-b border-slate-100">
                <span>🏆 Leaderboard</span>
              </h3>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${idx === 0
                      ? 'bg-yellow-50 border-yellow-200 text-yellow-900 shadow-sm'
                      : idx === 1
                        ? 'bg-slate-50 border-slate-200 text-slate-700'
                        : idx === 2
                          ? 'bg-orange-50 border-orange-200 text-orange-800'
                          : 'bg-white border-transparent text-slate-500'
                      }`}>
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${idx === 0 ? 'bg-yellow-500 text-white' :
                          idx === 1 ? 'bg-slate-400 text-white' :
                            idx === 2 ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-400'
                          }`}>
                          {idx + 1}
                        </span>
                        <span className="font-bold truncate max-w-[120px]">{entry.username}</span>
                      </div>
                      <span className="font-mono font-bold text-indigo-600">{entry.score} pts</span>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm">
                    <p>Scores will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-5 shrink-0">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Host Controls</h3>
              <div className="grid grid-cols-2 gap-3">
                {gameStatus === 'question' && (
                  <button onClick={handleNextForce} className="col-span-2 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold transition-colors border border-indigo-200 flex items-center justify-center gap-2">
                    SKIP TO ANSWER ⏩
                  </button>
                )}

                <button onClick={() => setChatEnabled(!chatEnabled)} className={`py-3 rounded-xl font-bold transition-colors border flex flex-col items-center justify-center ${chatEnabled
                  ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                  }`}>
                  <span className="text-xs font-normal opacity-70">CHAT</span>
                  {chatEnabled ? 'ENABLED' : 'DISABLED'}
                </button>

                <button onClick={handleEndQuiz} className="py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl font-bold transition-colors flex flex-col items-center justify-center">
                  <span className="text-xs font-normal opacity-70">SESSION</span>
                  END GAME
                </button>
              </div>
            </div>

            {/* CHAT COMPONENT */}
            <div className={`bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden flex flex-col flex-1 min-h-[200px] transition-all duration-300 ${chatEnabled ? 'opacity-100' : 'opacity-50 grayscale pointer-events-none'}`}>
              <div className="bg-slate-50 p-3 border-b border-slate-100 font-bold text-slate-700 text-sm flex items-center gap-2">
                <span>💬 Live Chat</span>
                {!chatEnabled && <span className="text-xs bg-slate-200 text-slate-500 px-2 py-0.5 rounded">PAUSED</span>}
              </div>
              <div className="flex-1 overflow-hidden relative">
                <Chat
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                  disabled={!chatEnabled}
                  currentUser={user}
                />
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default HostSession;
