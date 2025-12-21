// src/QuizSession.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuiz } from "../QuizContext";
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import toast from 'react-hot-toast';

import QuizQuestion from "../components/QuizQuestion";
import Leaderboard from "../components/Leaderboard";
import Chat from "../components/Chat";
import Participants from "../components/Participants";
import QuizTimer from "../components/QuizTimer";
import QuizResults from "../components/QuizResults";
import ProgressBar from "../components/ProgressBar";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAntiCheat } from '../hooks/useAntiCheat';


const QuizSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const {
    socket,
    user,
    currentQuiz,
    leaderboard,
    loading,
    submitAnswer,
    isConnected,
    activeSession,
    joinQuiz
  } = useQuiz();

  const [sessionData, setSessionData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizStatus, setQuizStatus] = useState('waiting');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [showConfetti, setShowConfetti] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [quizResults, setQuizResults] = useState(null);
  const [quizStats, setQuizStats] = useState({
    correctAnswers: 0,
    totalAnswered: 0,
    currentStreak: 0,
    bestStreak: 0,
    averageTime: 0,
    totalPoints: 0
  });
  const [questionHistory, setQuestionHistory] = useState([]);
  const [isHost, setIsHost] = useState(false);

  const timerRef = useRef(null);
  const questionStartTime = useRef(null);
  const socketInitialized = useRef(false);

  // Anti-Cheat Handler
  const handleDisqualification = () => {
    submitAnswer(currentQuestionIndex, -1, 0); // Submit invalid
    navigate('/');
    toast.error("🚫 You have been disqualified for cheating!", { duration: 6000, icon: '👮' });
  };

  useAntiCheat(!isHost && quizStatus === 'active', handleDisqualification);

  // Initialize session
  useEffect(() => {
    if (!user || !sessionId) {
      navigate('/join-quiz');
      return;
    }

    const initializeSession = async () => {
      try {
        // Join the quiz session
        await joinQuiz(sessionId, user.username);

        // Fetch session details
        const response = await api.get(`/sessions/${sessionId}`);
        if (response.data.success) {
          const session = response.data.data;
          setSessionData(session);
          setParticipants(session.participants || []);
          setQuizStatus(session.status);
          setIsHost(session.hostId === (user.id || user._id));

          if (session.status === 'active') {
            setCurrentQuestionIndex(session.currentQuestion || 0);
            setTimeRemaining(session.settings?.timePerQuestion || 30);
            startQuestionTimer();
          }
        }
      } catch (error) {
        toast.error('Failed to join session');
        navigate('/join-quiz');
      }
    };

    if (!socketInitialized.current) {
      initializeSession();
      socketInitialized.current = true;
    }

    return () => {
      if (socket && user) {
        socket.emit('leave-session', {
          sessionId,
          userId: user.id || user._id
        });
      }
      clearInterval(timerRef.current);
    };
  }, [sessionId, user, navigate, joinQuiz]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleSessionJoined = (data) => {
      setSessionData(data.session);
      setParticipants(data.session.participants || []);
      setQuizStatus(data.session.status);
      setIsHost(data.session.hostId === (user.id || user._id));
      toast.success(`Joined: ${data.session.quizId?.title}`);
    };

    const handleQuizStarted = (data) => {
      setQuizStatus('active');
      setCurrentQuestionIndex(0);
      setSessionData(data.session);
      setTimeRemaining(data.session.settings?.timePerQuestion || 30);
      questionStartTime.current = Date.now();

      // Play sound notification
      playSound('quizStart');
      toast.success('Quiz started! Good luck!');

      startQuestionTimer();
    };

    const handleNewQuestion = (data) => {
      setCurrentQuestionIndex(data.questionIndex);
      setSelectedAnswer(null);
      setAnswerSubmitted(false);
      setTimeRemaining(data.session.settings?.timePerQuestion || 30);
      questionStartTime.current = Date.now();

      // Record previous question
      if (currentQuestionIndex >= 0) {
        setQuestionHistory(prev => [...prev, {
          index: currentQuestionIndex,
          selectedAnswer,
          timeSpent: 30 - timeRemaining
        }]);
      }

      clearInterval(timerRef.current);
      startQuestionTimer();

      // Play sound
      playSound('newQuestion');

      toast.info(`Question ${data.questionIndex + 1}`);
    };

    const handleAnswerFeedback = (data) => {
      setAnswerSubmitted(true);

      const isCorrect = data.isCorrect;
      const pointsEarned = data.pointsEarned || 0;

      if (isCorrect) {
        setQuizStats(prev => ({
          ...prev,
          correctAnswers: prev.correctAnswers + 1,
          currentStreak: prev.currentStreak + 1,
          bestStreak: Math.max(prev.bestStreak, prev.currentStreak + 1),
          totalPoints: prev.totalPoints + pointsEarned
        }));

        // Play success sound
        playSound('correct');
        toast.success(`Correct! +${pointsEarned} points`);
      } else {
        setQuizStats(prev => ({
          ...prev,
          currentStreak: 0
        }));

        // Play error sound
        playSound('incorrect');
        toast.error('Incorrect');
      }

      setQuizStats(prev => ({
        ...prev,
        totalAnswered: prev.totalAnswered + 1,
        averageTime: ((prev.averageTime * (prev.totalAnswered - 1)) +
          (Date.now() - questionStartTime.current)) / prev.totalAnswered
      }));
    };

    const handleLeaderboardUpdate = (data) => {
      setLeaderboard(data);
    };

    const handleQuizEnded = (data) => {
      setQuizStatus('completed');
      setQuizResults(data.results);
      clearInterval(timerRef.current);

      // Find user's result
      const userResult = data.results?.find(r => r.userId === (user.id || user._id));
      if (userResult?.rank && userResult.rank <= 3) {
        setShowConfetti(true);
        playSound('win');
        setTimeout(() => setShowConfetti(false), 5000);
      } else if (userResult?.score > (data.results?.reduce((a, b) => a + b.score, 0) / data.results?.length || 0)) {
        playSound('achievement');
      }

      toast.success('Quiz completed! Check your results.');
    };

    const handleParticipantUpdate = (data) => {
      setParticipants(data.participants);
    };

    const handleChatMessage = (message) => {
      setChatMessages(prev => [...prev, message]);

      // Play notification sound for new messages (if not from self)
      if (message.userId !== (user.id || user._id)) {
        playSound('notification');
      }
    };

    const handleChatToggled = ({ enabled }) => {
      setChatEnabled(enabled);
      toast(enabled ? 'Chat enabled by host' : 'Chat disabled by host', {
        icon: enabled ? '🟢' : '🔴'
      });
    };

    const handleSessionError = (error) => {
      toast.error(error.message || 'Session error occurred');

      if (error.code === 'SESSION_FULL') {
        navigate('/join-quiz');
      }
    };

    const handleTimeUpdate = (data) => {
      setTimeRemaining(data.timeRemaining);
    };

    // Register event listeners
    socket.on('session-joined', handleSessionJoined);
    socket.on('quiz-started', handleQuizStarted);
    socket.on('new-question', handleNewQuestion);
    socket.on('answer-feedback', handleAnswerFeedback);
    socket.on('leaderboard-update', handleLeaderboardUpdate);
    socket.on('quiz-ended', handleQuizEnded);
    socket.on('participant-update', handleParticipantUpdate);
    socket.on('chat-message', handleChatMessage);
    socket.on('chat-toggled', handleChatToggled);
    socket.on('session-error', handleSessionError);
    socket.on('time-update', handleTimeUpdate);

    return () => {
      socket.off('session-joined', handleSessionJoined);
      socket.off('quiz-started', handleQuizStarted);
      socket.off('new-question', handleNewQuestion);
      socket.off('answer-feedback', handleAnswerFeedback);
      socket.off('leaderboard-update', handleLeaderboardUpdate);
      socket.off('quiz-ended', handleQuizEnded);
      socket.off('participant-update', handleParticipantUpdate);
      socket.off('chat-message', handleChatMessage);
      socket.off('session-error', handleSessionError);
      socket.off('time-update', handleTimeUpdate);
    };
  }, [socket, user, navigate, currentQuestionIndex, selectedAnswer, timeRemaining]);

  // Helper functions
  const startQuestionTimer = () => {
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeUp = () => {
    if (!answerSubmitted) {
      if (selectedAnswer !== null) {
        handleSubmitAnswer();
      } else {
        // Auto-submit blank answer
        submitAnswer(currentQuestionIndex, -1, timeRemaining);
        toast.warning('Time\'s up! No answer submitted.');
      }
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    console.log('handleAnswerSelect called with:', answerIndex, {
      answerSubmitted,
      quizStatus
    });

    if (answerSubmitted || quizStatus !== 'active') {
      console.warn('Selection ignored in parent: submitted or inactive');
      return;
    }

    setSelectedAnswer(answerIndex);

    // Play selection sound
    playSound('select');
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || answerSubmitted || quizStatus !== 'active') return;

    const timeTaken = Math.floor((Date.now() - questionStartTime.current) / 1000);

    submitAnswer(
      currentQuestionIndex,
      selectedAnswer,
      timeTaken
    );

    setAnswerSubmitted(true);
  };

  const handleSendMessage = (message) => {
    if (!socket || !sessionId || !user) return;

    socket.emit('send-message', {
      sessionId,
      userId: user.id || user._id,
      message,
      username: user.username,
      isHost
    });
  };

  const handleStartQuiz = () => {
    if (socket && isHost) {
      socket.emit('start-quiz', sessionId);
    }
  };

  const handleNextQuestion = () => {
    if (socket && isHost) {
      socket.emit('next-question', sessionId);
    }
  };

  const playSound = (type) => {
    // In a real app, you would play actual sound files
    console.log(`Playing sound: ${type}`);
  };

  const getCurrentQuestion = () => {
    if (!sessionData?.quizId?.questions || !sessionData.quizId.questions[currentQuestionIndex]) {
      return null;
    }

    return {
      ...sessionData.quizId.questions[currentQuestionIndex],
      index: currentQuestionIndex,
      total: sessionData.quizId.questions.length
    };
  };

  // Replace this in QuizSession.jsx when checking connection
  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Connecting to quiz...</h2>
          <p className="text-gray-600 mt-2">Please wait while we connect you</p>
        </div>
      </div>
    );
  }

  // Render quiz results
  if (quizStatus === 'completed' && quizResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        {showConfetti && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={300}
            gravity={0.1}
          />
        )}

        <QuizResults
          results={quizResults}
          sessionData={sessionData}
          user={user}
          stats={quizStats}
          onRetake={() => window.location.reload()}
          onGoHome={() => navigate('/')}
          onShare={() => {
            // Implement share functionality
            toast.success('Results copied to clipboard!');
          }}
        />
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold">Q</span>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {sessionData?.quizId?.title || 'Live Quiz Session'}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-sm text-gray-600">
                      Host: <span className="font-semibold">{sessionData?.hostId?.username || 'Unknown'}</span>
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600">
                      Code: <span className="font-mono font-bold text-blue-600">{sessionId}</span>
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${quizStatus === 'active' ? 'bg-green-100 text-green-800' :
                      quizStatus === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                        quizStatus === 'completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                      }`}>
                      {quizStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <QuizTimer
                timeRemaining={timeRemaining}
                totalTime={sessionData?.settings?.timePerQuestion || 30}
                isActive={quizStatus === 'active' && !answerSubmitted}
                showWarning={timeRemaining <= 10}
              />

              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to leave the quiz?')) {
                    navigate('/');
                  }
                }}
                className="px-4 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
              >
                Leave Quiz
              </button>
            </div>
          </div>

          {quizStatus === 'active' && currentQuestion && (
            <div className="mt-6">
              <ProgressBar
                current={currentQuestionIndex + 1}
                total={currentQuestion.total}
                showText={true}
                size="lg"
              />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quiz Area */}
          <div className="lg:col-span-2 space-y-6">
            {quizStatus === 'waiting' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center"
              >
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <svg className="w-20 h-20 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Waiting for Host to Start
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  The quiz will begin shortly. Get ready to test your knowledge!
                </p>

                <div className="flex items-center justify-center gap-2 mb-8">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse delay-75"></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                </div>

                {/* Participant Count */}
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="font-semibold text-gray-800">{participants.length}</span>
                    <span className="text-gray-600">participants waiting</span>
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Tips</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { icon: '👀', text: 'Read questions carefully', color: 'blue' },
                      { icon: '⏱️', text: 'Manage your time wisely', color: 'green' },
                      { icon: '🎯', text: 'Focus on accuracy first', color: 'purple' },
                      { icon: '🧠', text: 'Trust your first instinct', color: 'orange' },
                    ].map((tip, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-3 bg-white rounded-lg border border-${tip.color}-100 shadow-sm`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{tip.icon}</span>
                          <span className="text-sm text-gray-800">{tip.text}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : quizStatus === 'active' && currentQuestion ? (
              <QuizQuestion
                question={currentQuestion}
                selectedOption={selectedAnswer}
                onOptionSelect={handleAnswerSelect}
                onSubmit={handleSubmitAnswer}
                answerSubmitted={answerSubmitted}
                timeRemaining={timeRemaining}
                questionIndex={currentQuestionIndex}
                totalQuestions={currentQuestion.total}
              />
            ) : null}

            {/* Stats Panel */}
            {quizStatus === 'active' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Live Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: 'Correct', value: quizStats.correctAnswers, color: 'green', icon: '✓' },
                    { label: 'Streak', value: quizStats.currentStreak, color: 'purple', icon: '🔥' },
                    { label: 'Best Streak', value: quizStats.bestStreak, color: 'orange', icon: '⭐' },
                    { label: 'Points', value: quizStats.totalPoints, color: 'blue', icon: '🏆' },
                    { label: 'Avg Time', value: `${Math.round(quizStats.averageTime / 1000)}s`, color: 'indigo', icon: '⏱️' },
                  ].map((stat, index) => (
                    <div key={index} className="text-center p-3 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-100">
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <span className="text-gray-600">{stat.icon}</span>
                        <span className={`text-xs font-medium text-${stat.color}-600`}>
                          {stat.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Live Leaderboard</h3>
                  <span className="text-xs text-gray-500">Updated in real-time</span>
                </div>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                <Leaderboard
                  data={leaderboard}
                  currentUser={user}
                  highlightCurrentUser={true}
                  showAvatars={true}
                  showPoints={true}
                />
              </div>
            </div>

            {/* Participants */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-lg font-semibold text-gray-900">
                  Participants ({participants.length})
                </h3>
              </div>
              <div className="p-4 max-h-64 overflow-y-auto">
                <Participants
                  participants={participants}
                  currentUserId={user?.id || user?._id}
                  showStatus={true}
                />
              </div>
            </div>

            {/* Chat */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-lg font-semibold text-gray-900">Live Chat</h3>
              </div>
              <div className="h-64 flex flex-col">
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

        {/* Host Controls */}
        {isHost && quizStatus === 'waiting' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 border border-blue-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Host Controls</h3>
                <p className="text-sm text-blue-700">You're hosting this quiz session</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-800">Host</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleStartQuiz}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Quiz
              </button>

              <button
                onClick={() => toast.info('Settings feature coming soon!')}
                className="flex-1 px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>

              <button
                onClick={() => {
                  const inviteLink = `${window.location.origin}/join-quiz?code=${sessionId}`;
                  navigator.clipboard.writeText(inviteLink);
                  toast.success('Invite link copied!');
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            </div>
          </motion.div>
        )}

        {/* Host Controls - During Quiz */}
        {isHost && quizStatus === 'active' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-xl p-6 border border-green-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-green-900">Quiz Controls</h3>
                <p className="text-sm text-green-700">Manage the live quiz session</p>
              </div>
              <div className="text-sm text-gray-600">
                Question: {currentQuestionIndex + 1} / {currentQuestion?.total || 0}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleNextQuestion}
                disabled={!answerSubmitted}
                className={`flex-1 px-6 py-3 rounded-xl flex items-center justify-center gap-2 ${answerSubmitted
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                Next Question
              </button>

              <button
                onClick={() => {
                  if (window.confirm('End quiz early? All participants will see their results.')) {
                    socket.emit('end-quiz', sessionId);
                  }
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                End Quiz
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default QuizSession;
