// src/pages/Results.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useQuiz } from '../context/QuizContext'
import Confetti from 'react-confetti'
import {
  Trophy,
  Star,
  TrendingUp,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Award,
  Share2,
  Download,
  RefreshCw,
  Home,
  ChevronRight,
  Users,
  Hash,
  Zap,
  Crown,
  Medal,
  TrendingDown,
  Eye,
  AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'

const Results = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { getSession, saveResults } = useQuiz()

  const [results, setResults] = useState(null)
  const [session, setSession] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [performanceData, setPerformanceData] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [userRank, setUserRank] = useState(0)
  const [showAnswerDetails, setShowAnswerDetails] = useState(false)

  useEffect(() => {
    if (sessionId || location.state) {
      fetchResults()
    }
  }, [sessionId, location.state])

  useEffect(() => {
    if (results?.score > 80) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [results])

  const fetchResults = async () => {
    setLoading(true);
    try {
      // 1. Try location state (most fresh)
      let resultsData = location.state;

      // 2. Try localStorage (backup)
      if (!resultsData) {
        const savedResults = localStorage.getItem('quizResults');
        if (savedResults) {
          resultsData = JSON.parse(savedResults);
        }
      }

      // 3. If no data, render empty state (or fetch from API if you had an endpoint)
      if (!resultsData) {
        // Fallback or just stop
        setLoading(false);
        return;
      }

      // Handle both "participant" view and "host" view structures
      // Host view usually sends { leaderboard, finalResults, ... }
      // Participant view might send simplified data.

      // Normalize leaderboard
      const lb = resultsData.leaderboard || resultsData.finalResults?.leaderboard || [];

      // Find current user stats
      const username = user?.username || localStorage.getItem('username');
      const userId = user?._id;

      let currentUserData = null;

      // Try finding by ID then Username
      if (resultsData.participants) {
        currentUserData = resultsData.participants.find(p => p.userId === userId || p.username === username);
      }
      if (!currentUserData && lb.length > 0) {
        currentUserData = lb.find(p => p.userId === userId || p.username === username);
      }

      // Use REAL data from session
      // If we are host, we might not have "userScore" for ourselves if we didn't play.
      // But we requested "Host Can Play", so likely we are in the list.

      const userScore = currentUserData?.score || 0;
      const userCorrect = currentUserData?.correctAnswers || 0;
      const totalQuestions = resultsData.totalQuestions || 10;
      // Safety check for div by zero
      const userAccuracy = totalQuestions > 0 ? (userCorrect / totalQuestions) * 100 : 0;
      const userAnswers = currentUserData?.answers || [];

      // Calculate total time
      const totalTime = userAnswers.reduce((sum, a) => sum + (a.timeTaken || 0), 0);

      // Rank calculation
      const myRank = lb.findIndex(p => p.userId === userId || p.username === username) + 1;

      setResults({
        score: userScore,
        correctAnswers: userCorrect,
        totalQuestions: totalQuestions,
        accuracy: userAccuracy,
        timeTaken: totalTime,
        answers: userAnswers,
        rank: myRank || 0,
        leaderboard: lb // Store full leaderboard in results too for easy access
      });

      setLeaderboard(lb);
      setUserRank(myRank || 0);

      // Only generate if we have valid data
      if (currentUserData || lb.length > 0) {
        generatePerformanceData({ ...resultsData, participants: resultsData.participants || lb });
      }

    } catch (error) {
      console.error('Failed to fetch results:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePerformanceData = (resultsData) => {
    // Find current user stats
    const currentUser = resultsData.participants?.find(p =>
      p.username === user?.username || p.userId === user?._id
    ) || resultsData.leaderboard?.find(p =>
      p.username === user?.username || p.userId === user?._id
    );

    if (!currentUser) return;

    // Accuracy
    const totalQs = resultsData.totalQuestions || 1;
    const accuracy = currentUser.performance?.accuracy || (currentUser.correctAnswers / totalQs * 100);

    // Speed (Inverse of average time, normalized to 30s)
    const avgTime = currentUser.performance?.speed || 15;
    const speedScore = Math.min(100, Math.max(0, 100 - ((avgTime / 30) * 100) + 20)); // Bonus for being fast

    // Consistency (Variance or Streak)
    const streak = currentUser.streak || 0;
    const consistency = Math.min(100, (streak / totalQs) * 100 + 40);

    // Engagement (Participation)
    const answeredCount = currentUser.answers?.length || currentUser.correctAnswers || 0;
    const engagement = (answeredCount / totalQs) * 100;

    const categories = ['Speed', 'Accuracy', 'Consistency', 'Engagement'];
    const data = categories.map(category => {
      let score = 0;
      switch (category) {
        case 'Speed': score = speedScore; break;
        case 'Accuracy': score = accuracy; break;
        case 'Consistency': score = consistency; break;
        case 'Engagement': score = engagement; break;
        default: score = 75;
      }
      return {
        category,
        score: Math.round(score),
        fullMark: 100
      };
    });

    setPerformanceData(data);
  }

  const getGrade = (score) => {
    if (score >= 90) return { grade: 'A+', color: 'from-green-500 to-emerald-600' }
    if (score >= 80) return { grade: 'A', color: 'from-green-400 to-emerald-500' }
    if (score >= 70) return { grade: 'B', color: 'from-blue-500 to-cyan-600' }
    if (score >= 60) return { grade: 'C', color: 'from-yellow-500 to-orange-600' }
    if (score >= 50) return { grade: 'D', color: 'from-orange-500 to-red-600' }
    return { grade: 'F', color: 'from-red-500 to-pink-600' }
  }

  const getRankBadge = (rank) => {
    if (rank === 1) return { icon: <Crown className="text-yellow-500" />, color: 'bg-gradient-to-br from-yellow-500 to-yellow-600' }
    if (rank === 2) return { icon: <Medal className="text-gray-400" />, color: 'bg-gradient-to-br from-gray-400 to-gray-600' }
    if (rank === 3) return { icon: <Medal className="text-orange-400" />, color: 'bg-gradient-to-br from-orange-500 to-orange-700' }
    return { icon: <Hash className="text-gray-500" />, color: 'bg-gradient-to-br from-gray-500 to-gray-700' }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `I scored ${results.score} points on Quizito!`,
          text: `Check out my quiz results on Quizito - ${results.score} points!`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Sharing cancelled')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Results link copied to clipboard!')
    }
  }

  const handlePlayAgain = () => {
    navigate('/explore')
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getPerformanceChartData = () => {
    if (!results?.answers) return []
    return results.answers.map((answer, index) => ({
      question: `Q${index + 1}`,
      time: answer.timeTaken,
      correct: answer.isCorrect ? 1 : 0,
      points: answer.points
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Results Not Found</h3>
          <p className="text-gray-600 mb-6">Could not find the quiz results you're looking for.</p>
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  const grade = getGrade(results.accuracy)
  const rankBadge = getRankBadge(userRank)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-accent-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 py-12 relative">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h1 className="text-4xl font-bold mb-4">Quiz Results</h1>
                <p className="text-xl opacity-90">
                  Great job completing the quiz! Here's how you performed.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleShare}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-colors"
                >
                  <Share2 size={20} />
                  <span>Share Results</span>
                </button>
                <button
                  onClick={handlePlayAgain}
                  className="bg-white text-primary-600 hover:bg-gray-100 px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-colors"
                >
                  <RefreshCw size={20} />
                  <span>Play Again</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Score Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 border-2 border-primary-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                  <Trophy className="text-primary-600" size={24} />
                </div>
                <div className={`px-3 py-1 rounded-full ${grade.color.replace('from-', 'bg-gradient-to-r from-')} text-white text-sm font-bold`}>
                  {grade.grade}
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">{results.score}</h3>
              <p className="text-gray-600">Total Score</p>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{results.accuracy}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${grade.color.replace('from-', 'bg-gradient-to-r from-')} rounded-full`}
                    style={{ width: `${results.accuracy}%` }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Accuracy Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Target className="text-green-600" size={24} />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {results.accuracy}%
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">
                {results.correctAnswers}/{results.totalQuestions}
              </h3>
              <p className="text-gray-600">Correct Answers</p>
              <div className="mt-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={16} />
                  <span className="text-sm text-gray-600">{results.correctAnswers} correct</span>
                  <XCircle className="text-red-500 ml-4" size={16} />
                  <span className="text-sm text-gray-600">{results.totalQuestions - results.correctAnswers} incorrect</span>
                </div>
              </div>
            </motion.div>

            {/* Time Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Clock className="text-blue-600" size={24} />
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatTime(results.timeTaken)}
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">
                {Math.round(results.timeTaken / results.totalQuestions)}s
              </h3>
              <p className="text-gray-600">Average Time per Question</p>
              <div className="mt-4">
                <div className="flex items-center space-x-2 text-sm">
                  <TrendingUp className="text-green-500" size={16} />
                  <span className="text-gray-600">
                    {results.timeTaken < 180 ? 'Fast' : results.timeTaken < 300 ? 'Average' : 'Slow'} pace
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Rank Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  {rankBadge.icon}
                </div>
                <div className={`w-10 h-10 rounded-full ${rankBadge.color} flex items-center justify-center text-white font-bold`}>
                  {userRank}
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">
                #{userRank} of {leaderboard.length}
              </h3>
              <p className="text-gray-600">Global Rank</p>
              <div className="mt-4">
                <div className="flex items-center space-x-2">
                  <Users className="text-gray-400" size={16} />
                  <span className="text-sm text-gray-600">Top {Math.round((userRank / leaderboard.length) * 100)}%</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex border-b border-gray-200">
              {['overview', 'answers', 'leaderboard', 'analytics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-6 py-3 font-medium text-lg border-b-2 transition-colors ${selectedTab === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {selectedTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Performance Overview */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h3 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                    <BarChart3 size={24} />
                    <span>Performance Overview</span>
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={performanceData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar
                          name="Performance"
                          dataKey="score"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.6}
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Progress Over Time */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h3 className="text-2xl font-bold mb-6">Question-by-Question Performance</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getPerformanceChartData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="question" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="points"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          name="Points Earned"
                        />
                        <Line
                          type="monotone"
                          dataKey="time"
                          stroke="#10b981"
                          strokeWidth={2}
                          name="Time (seconds)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'answers' && (
              <motion.div
                key="answers"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold">Detailed Answers</h3>
                    <button
                      onClick={() => setShowAnswerDetails(!showAnswerDetails)}
                      className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                    >
                      <Eye size={20} />
                      <span>{showAnswerDetails ? 'Hide Details' : 'Show Details'}</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {results.answers.map((answer, index) => (
                      <div
                        key={index}
                        className={`p-6 rounded-xl border-2 transition-all ${answer.isCorrect
                          ? 'border-green-200 bg-green-50'
                          : 'border-red-200 bg-red-50'
                          }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${answer.isCorrect
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                              }`}>
                              {answer.isCorrect ? (
                                <CheckCircle size={20} />
                              ) : (
                                <XCircle size={20} />
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold">Question {index + 1}</h4>
                              <p className="text-sm text-gray-600">{answer.timeTaken}s response time</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">{answer.points} pts</div>
                            <div className="text-sm text-gray-600">Score</div>
                          </div>
                        </div>

                        {showAnswerDetails && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600 mb-2">Your Answer</p>
                                <div className={`p-3 rounded-lg ${answer.isCorrect
                                  ? 'bg-green-100 border border-green-200'
                                  : 'bg-red-100 border border-red-200'
                                  }`}>
                                  {answer.selectedOption || 'No answer'}
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 mb-2">Correct Answer</p>
                                <div className="p-3 rounded-lg bg-green-100 border border-green-200">
                                  {answer.correctAnswer}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-xl p-8"
              >
                <h3 className="text-2xl font-bold mb-6">Session Leaderboard</h3>
                <div className="space-y-4">
                  {leaderboard.map((participant, index) => (
                    <div
                      key={participant.userId}
                      className={`p-4 rounded-xl border-2 transition-all ${participant.username === user?.username
                        ? 'bg-primary-50 border-primary-300'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${index === 0 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                            index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                              index === 2 ? 'bg-gradient-to-br from-orange-500 to-orange-700' :
                                'bg-gradient-to-br from-gray-500 to-gray-700'
                            }`}>
                            {index === 0 ? (
                              <Crown size={20} />
                            ) : index < 3 ? (
                              <Medal size={20} />
                            ) : (
                              <span className="font-bold">{index + 1}</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-3">
                            <img
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.username}`}
                              alt={participant.username}
                              className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                            />
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold">{participant.username}</span>
                                {participant.username === user?.username && (
                                  <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                                    You
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {participant.correctAnswers} correct answers
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{participant.score}</div>
                          <div className="text-sm text-gray-600">points</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Score Progress</span>
                          <span className="font-medium">
                            {Math.round((participant.score / leaderboard[0].score) * 100)}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${index === 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                              index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                                index === 2 ? 'bg-gradient-to-r from-orange-500 to-orange-700' :
                                  'bg-gradient-to-r from-gray-500 to-gray-700'
                              }`}
                            style={{ width: `${(participant.score / leaderboard[0].score) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {selectedTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Score Distribution */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h3 className="text-2xl font-bold mb-6">Score Distribution</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="category" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar
                          dataKey="score"
                          fill="#3b82f6"
                          radius={[8, 8, 0, 0]}
                          name="Score"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Performance Comparison */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h3 className="text-2xl font-bold mb-6">Time Analysis</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Fast Answers', value: Math.floor(Math.random() * 30) + 40 },
                              { name: 'Average Time', value: Math.floor(Math.random() * 30) + 30 },
                              { name: 'Slow Answers', value: Math.floor(Math.random() * 20) + 10 }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            <Cell fill="#10b981" />
                            <Cell fill="#3b82f6" />
                            <Cell fill="#ef4444" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="text-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2" />
                        <div className="font-bold">40-60%</div>
                        <div className="text-sm text-gray-600">Fast</div>
                      </div>
                      <div className="text-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2" />
                        <div className="font-bold">30-40%</div>
                        <div className="text-sm text-gray-600">Average</div>
                      </div>
                      <div className="text-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-2" />
                        <div className="font-bold">10-20%</div>
                        <div className="text-sm text-gray-600">Slow</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h3 className="text-2xl font-bold mb-6">Accuracy Trends</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Current Session</span>
                          <span className="font-bold text-green-600">{results.accuracy}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${results.accuracy}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Average</span>
                          <span className="font-bold text-blue-600">75%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: '75%' }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Best Session</span>
                          <span className="font-bold text-purple-600">92%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: '92%' }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="text-green-500" />
                          <span className="font-medium">
                            {results.accuracy > 75 ? 'Above average!' : 'Room for improvement'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Results