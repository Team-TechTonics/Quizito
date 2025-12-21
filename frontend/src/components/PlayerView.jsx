
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socketService } from '../services';
import LoadingSpinner from './LoadingSpinner';
import Chat from './Chat';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import { useAntiCheat } from '../hooks/useAntiCheat';

const PlayerView = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [player, setPlayer] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [gamePhase, setGamePhase] = useState('lobby'); // lobby, question, answer, finished
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null); // { isCorrect: boolean, correctAnswer: string, points: number }
  const [chatMessages, setChatMessages] = useState([]);
  const [chatEnabled, setChatEnabled] = useState(true);

  // Anti-Cheat Handler
  const handleDisqualification = () => {
    socketService.submitAnswer({
      roomCode,
      questionIndex: currentQuestionIndex,
      answer: null,
      timeTaken: 0,
      disqualified: true
    });
    navigate('/');
    toast.error("🚫 You have been disqualified for cheating!", { duration: 6000, icon: '👮' });
  };

  useAntiCheat(['question', 'answer'].includes(gamePhase), handleDisqualification);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
      navigate('/login');
      return;
    }

    const initSocket = async () => {
      try {
        setLoading(true);
        // Ensure connection
        socketService.connect(token);

        // Join session
        socketService.joinSession(roomCode, user.username);

        // Setup listeners
        socketService.on('countdown', (data) => {
          setCountdown(data.countdown);
          // Play beep sound logic or speech
          const synth = window.speechSynthesis;
          if (synth && data.countdown <= 3) {
            const utterance = new SpeechSynthesisUtterance(data.countdown.toString());
            utterance.rate = 1.5;
            synth.speak(utterance);
          }
        });

        socketService.on('session-data', (data) => {
          console.log("Session Data:", data);
          setSession(data.session);
          setPlayer(data.participant);
          // If session is already in progress, sync state
          if (data.session.status === 'active' || data.session.isActive) {
            // We might need to handle late join specifically if backend supports sending current question
            // For now, rely on next question or quiz-started if it happens
          }
          setGamePhase(data.session.status === 'waiting' ? 'lobby' : 'question'); // Simplified initial state
          setLoading(false);
        });

        socketService.on('quiz-started', (data) => {
          console.log("Quiz Started:", data);
          setCountdown(null);
          setGamePhase('question');
          setGamePhase('question');
          setCurrentQuestion(data.question);
          setCurrentQuestionIndex(data.questionIndex);
          setTimeRemaining(data.timeRemaining || 30);
          setSelectedAnswer(null);
          setSelectedOption(null);
          setIsSubmitted(false);
          setFeedback(null);
        });

        socketService.on('next-question', (data) => {
          console.log("Next Question:", data);
          setGamePhase('question');
          setGamePhase('question');
          setCurrentQuestion(data.question);
          setCurrentQuestionIndex(data.questionIndex);
          setTimeRemaining(data.timeRemaining || 30);
          setSelectedAnswer(null);
          setSelectedOption(null);
          setIsSubmitted(false);
          setFeedback(null);
        });

        socketService.on('question-completed', (data) => {
          console.log("Question Completed:", data);
          setGamePhase('answer');
          setFeedback({
            isCorrect: false, // We don't know yet until we get individual feedback or infer it
            correctAnswer: data.correctAnswer
          });
        });

        socketService.on('answer-feedback', (data) => {
          console.log("Feedback:", data);
          setFeedback({
            isCorrect: data.isCorrect,
            correctAnswer: data.correctAnswer,
            points: data.points
          });
        });

        socketService.on('timer-update', (data) => {
          setTimeRemaining(data.timeRemaining);
        });

        socketService.on('leaderboard-update', (data) => {
          setLeaderboard(data.leaderboard);
        });

        socketService.on('quiz-completed', (data) => {
          setGamePhase('finished');
          setLeaderboard(data.finalResults?.leaderboard || []);
        });

        socketService.on('player-ready-update', (data) => {
          // Handle ready updates if we want to show it
        });

        socketService.on('participant-joined', (data) => {
          // Update session participant list if we want
        });

        socketService.onChatMessage((message) => {
          setChatMessages(prev => [...prev, message]);
        });

        socketService.onSessionEndedByHost(() => {
          toast.error("Host ended the session");
          navigate('/dashboard');
        });

      } catch (err) {
        console.error("Socket Init Error:", err);
        toast.error("Failed to connect to game session");
      }
    };

    initSocket();

    return () => {
      socketService.removeAllListeners();
    };
  }, [roomCode, navigate]);


  // Auto-submit on timeout
  useEffect(() => {
    if (timeRemaining === 0 && !isSubmitted && gamePhase === 'question') {
      submitAnswer(selectedOption);
    }
  }, [timeRemaining, isSubmitted, gamePhase, selectedOption]);

  const handleOptionSelect = (optionText) => {
    if (isSubmitted) return;
    setSelectedOption(optionText);
  };

  const submitAnswer = (answer) => {
    if (gamePhase !== 'question' || isSubmitted) return;

    setIsSubmitted(true);
    socketService.submitAnswer({
      roomCode,
      questionIndex: currentQuestionIndex,
      answer: answer,
      timeTaken: 30 - timeRemaining
    });
  };

  // Kept for backward compatibility if needed, but renamed/unused in new flow
  const handleAnswerSubmit = (optionText) => submitAnswer(optionText);

  const handleReadyToggle = () => {
    if (!player) return;
    const newReadyState = !player.isReady;
    setPlayer(p => ({ ...p, isReady: newReadyState })); // Optimistic update
    socketRef.current?.emit('player-ready', { roomCode, isReady: newReadyState }); // Wait, need to check if socketService has player-ready emitter
    // socketService.js doesn't have emit('player-ready'). Let's add it or use raw `socketService.socket.emit`
    socketService.socket?.emit('player-ready', { roomCode, isReady: newReadyState });
  };

  const handleSendMessage = (text) => {
    if (!roomCode || !player) return;
    socketService.sendChatMessage({
      roomCode,
      message: text
    });
  };


  if (loading) return <LoadingSpinner text="Joining game..." fullScreen={true} color="purple" />;

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans overflow-hidden relative">
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-gray-900 to-black pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto h-screen flex flex-col p-4">

        {/* Header */}
        <div className="flex justify-between items-center bg-white/5 backdrop-blur-lg rounded-2xl p-3 mb-4 border border-white/10 shadow-lg">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors" title="Leave Game">
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-violet-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                {player?.avatar ? <img src={player.avatar} alt="avatar" className="w-full h-full object-cover" /> : <span className="text-xl">😎</span>}
              </div>
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">{player?.username || 'Player'}</p>
              <p className="text-xs text-purple-300 font-mono tracking-wider">{player?.score || 0} PTS</p>
            </div>
          </div>

          {gamePhase === 'question' && (
            <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 font-bold text-lg 
                    ${timeRemaining <= 10 ? 'border-red-500 text-red-500 animate-pulse' : 'border-cyan-400 text-cyan-400'}`}>
              {timeRemaining}
            </div>
          )}
        </div>

        {/* COUNTDOWN OVERLAY */}
        <AnimatePresence>
          {countdown !== null && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              key={countdown}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-3xl"
            >
              <motion.div
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1.2, rotate: 0 }}
                className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]"
              >
                {countdown}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LOBBY PHASE */}
        {gamePhase === 'lobby' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col justify-center items-center text-center space-y-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/30 blur-3xl rounded-full animate-pulse" />
              <img src="https://media.giphy.com/media/xTkceqACH9RbwxqbT2/giphy.gif" alt="Waiting" className="w-48 h-48 object-contain relative z-10 rounded-xl" />
              {/* Note: In a real app, use a local asset or a better placeholder. Using a generic waiting gif for 'cute' vibe */}
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
                You're In!
              </h2>
              <p className="text-gray-400">Waiting for host to start...</p>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleReadyToggle}
              className={`px-8 py-4 rounded-2xl font-bold text-xl shadow-xl transition-all w-full max-w-xs
                        ${player?.isReady
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white ring-4 ring-green-500/30'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
            >
              {player?.isReady ? 'READY! 🚀' : 'Tap when Ready'}
            </motion.button>
          </motion.div>
        )}

        {/* GAME PHASE */}
        {gamePhase === 'question' && currentQuestion && (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 flex flex-col justify-center my-4">
              <h2 className="text-2xl font-bold text-center leading-relaxed mb-8">
                {currentQuestion.question}
              </h2>

              {currentQuestion.imageUrl && (
                <div className="rounded-2xl overflow-hidden mb-6 shadow-2xl border border-white/10">
                  <img src={currentQuestion.imageUrl} alt="Question" className="w-full h-48 object-cover" />
                </div>
              )}


              <div className="grid grid-cols-1 gap-3">
                {(() => {
                  // Standardize options to array (similar to HostSession)
                  let options = currentQuestion.options;
                  if (options && !Array.isArray(options)) {
                    options = Object.values(options);
                  }

                  return options?.map((opt, idx) => {
                    // Handle both string options and object options
                    const optionText = typeof opt === 'string' ? opt : opt.text;
                    const isSelected = selectedOption === optionText;
                    const colors = [
                      'from-blue-500 to-blue-600',
                      'from-purple-500 to-purple-600',
                      'from-pink-500 to-pink-600',
                      'from-orange-500 to-orange-600'
                    ];

                    return (
                      <motion.button
                        key={idx}
                        whileTap={!isSubmitted ? { scale: 0.98 } : {}}
                        onClick={() => handleOptionSelect(optionText)}
                        disabled={isSubmitted}
                        className={`relative overflow-hidden p-6 rounded-xl text-left transition-all border-2
                                          ${isSelected
                            ? 'border-white bg-white/20 scale-[1.02] shadow-lg'
                            : 'border-transparent bg-gradient-to-r ' + (colors[idx % 4]) + ' opacity-90'}
                                          ${isSubmitted && !isSelected ? 'opacity-40 grayscale' : ''}
                                      `}
                      >
                        <span className="font-bold text-lg md:text-xl drop-shadow-md">{optionText}</span>
                        {isSelected && (
                          <motion.div
                            layoutId="check"
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white text-purple-600 rounded-full p-1"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })
                })()}
              </div>
            </div>

            {/* Submit Button Area */}
            <div className="p-4 bg-gray-900/50 backdrop-blur-sm border-t border-white/10 mt-auto">
              {!isSubmitted ? (
                <button
                  onClick={() => submitAnswer(selectedOption)}
                  disabled={!selectedOption}
                  className={`w-full py-4 rounded-xl font-black text-xl tracking-wide shadow-lg transition-all
                      ${selectedOption
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:scale-[1.02] active:scale-95'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                >
                  SUBMIT ANSWER 🚀
                </button>
              ) : (
                <div className="text-center animate-pulse">
                  <p className="text-xl font-bold text-green-400 mb-1">Answer Submitted!</p>
                  <p className="text-sm text-gray-400">Waiting for other players...</p>
                </div>
              )}
            </div>
          </div>
        )}


        {/* CHAT OVERLAY/COMPONENT */}
        <div className="mt-auto bg-white/5 backdrop-blur-lg rounded-t-2xl overflow-hidden h-48 border-t border-white/10 shrink-0">
          <div className="p-2 bg-white/5 font-bold text-xs text-center uppercase tracking-widest text-gray-400">Live Chat</div>
          <Chat
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            disabled={false}
            currentUser={{ ...player, id: player?.userId || player?._id }}
          />
        </div>

        {/* ANSWER/FEEDBACK PHASE */}
        {gamePhase === 'answer' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex-1 flex flex-col justify-center items-center text-center space-y-6"
          >
            <div className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl shadow-2xl mb-4
                    ${feedback?.isCorrect ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`}
            >
              {feedback?.isCorrect ? '🎉' : '😢'}
            </div>

            <div>
              <h2 className="text-3xl font-black mb-2">
                {feedback?.isCorrect ? 'Awesome!' : 'Oops!'}
              </h2>
              <p className="text-lg text-gray-300">
                {feedback?.isCorrect ? `You earned +${feedback.points} points` : 'Better luck next time'}
              </p>
            </div>

            {!feedback?.isCorrect && (
              <div className="bg-white/10 p-4 rounded-xl border border-white/10 w-full max-w-sm">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Correct Answer</p>
                <p className="font-bold text-lg text-green-400">{feedback?.correctAnswer}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* FINISHED PHASE */}
        {gamePhase === 'finished' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="text-center py-6">
              <h2 className="text-3xl font-black text-yellow-400 mb-2">Quiz Results</h2>
              <p className="text-gray-300">Top Players</p>
            </div>

            <div className="flex-1 overflow-y-auto px-2 space-y-3 custom-scrollbar">
              {leaderboard.map((entry, idx) => (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx}
                  className={`flex items-center p-4 rounded-2xl border 
                                ${entry.username === player?.username ? 'bg-purple-600/30 border-purple-500' : 'bg-white/5 border-white/5'}
                            `}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg mr-4
                                ${idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                      idx === 1 ? 'bg-gray-300 text-gray-800' :
                        idx === 2 ? 'bg-orange-400 text-orange-900' : 'bg-white/10 text-gray-400'}
                            `}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-lg">{entry.username}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-cyan-400">{entry.score}</p>
                    <p className="text-xs text-gray-500">PTS</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-4">
              <button onClick={() => navigate('/dashboard')} className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors">
                Return to Dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PlayerView;