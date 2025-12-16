// src/components/quiz/QuizCard.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Clock,
  Star,
  Trophy,
  BarChart3,
  Play,
  MoreVertical,
  User,
  Hash,
  Zap
} from 'lucide-react'
import { motion } from 'framer-motion'

const QuizCard = ({ quiz, featured = false }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      'General Knowledge': 'bg-blue-100 text-blue-800 border-blue-200',
      'Science': 'bg-purple-100 text-purple-800 border-purple-200',
      'Technology': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'History': 'bg-amber-100 text-amber-800 border-amber-200',
      'Geography': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Sports': 'bg-orange-100 text-orange-800 border-orange-200',
      'Entertainment': 'bg-pink-100 text-pink-800 border-pink-200',
      'Mathematics': 'bg-red-100 text-red-800 border-red-200',
      'Literature': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'Art': 'bg-rose-100 text-rose-800 border-rose-200',
      'Music': 'bg-violet-100 text-violet-800 border-violet-200'
    }
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const calculateRating = (quiz) => {
    // This would normally come from backend
    return 4.5 + Math.random() * 0.5 // Random between 4.5-5.0 for demo
  }

  const getPopularity = (quiz) => {
    // This would normally come from backend
    return Math.floor(Math.random() * 1000) + 100 // Random 100-1100 for demo
  }

  const rating = calculateRating(quiz)
  const popularity = getPopularity(quiz)
  const timeToComplete = quiz.questions?.length * 30 // 30 seconds per question
  const minutes = Math.floor(timeToComplete / 60)
  const seconds = timeToComplete % 60
  const timeString = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${featured
          ? 'border-primary-300 bg-gradient-to-br from-primary-50 to-white shadow-xl'
          : 'border-gray-200 bg-white hover:border-primary-200 hover:shadow-xl'
        }`}
    >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
            <Zap size={12} />
            <span>TRENDING</span>
          </div>
        </div>
      )}

      {/* Quiz Image/Header */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary-500 to-accent-500">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white line-clamp-2">
                {quiz.title}
              </h3>
              <p className="text-white/90 text-sm mt-1 line-clamp-1">
                {quiz.description}
              </p>
            </div>
            <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <MoreVertical className="text-white" size={20} />
            </button>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
            <Star size={12} className="text-yellow-300" />
            <span className="text-white text-sm font-medium">
              {rating.toFixed(1)}
            </span>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-white text-sm font-medium">
              {quiz.questions?.length || 0} Qs
            </span>
          </div>
        </div>
      </div>

      {/* Quiz Content */}
      <div className="p-6">
        {/* Creator Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={quiz.createdBy?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${quiz.createdBy?.username || 'quiz'}`}
                alt={quiz.createdBy?.username}
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-800">
                  {quiz.createdBy?.username || 'Anonymous'}
                </span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500">
                  {formatDate(quiz.createdAt)}
                </span>
              </div>
              <p className="text-xs text-gray-500">Creator</p>
            </div>
          </div>
        </div>

        {/* Categories & Difficulty */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`badge border ${getCategoryColor(quiz.category)}`}>
            {quiz.category || 'Uncategorized'}
          </span>
          <span className={`badge border ${getDifficultyColor(quiz.difficulty)}`}>
            <BarChart3 size={12} className="mr-1" />
            {quiz.difficulty || 'Medium'}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
              <Users className="text-primary-600" size={16} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Players</p>
              <p className="font-bold">{popularity.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <Clock className="text-green-600" size={16} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Time</p>
              <p className="font-bold">{timeString}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Trophy className="text-yellow-600" size={16} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Avg. Score</p>
              <p className="font-bold">85%</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Hash className="text-purple-600" size={16} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Questions</p>
              <p className="font-bold">{quiz.questions?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Rating</span>
            <span className="text-sm font-bold">{rating.toFixed(1)}/5.0</span>
          </div>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <div
                key={star}
                className={`w-full h-2 rounded-full ${star <= Math.floor(rating)
                    ? 'bg-yellow-500'
                    : star === Math.ceil(rating) && rating % 1 > 0
                      ? 'bg-gradient-to-r from-yellow-500 to-gray-300'
                      : 'bg-gray-200'
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link
            to={`/create-quiz?quizId=${quiz._id}`}
            className="flex-1 btn-primary py-3 flex items-center justify-center space-x-2"
          >
            <Play size={18} />
            <span>Host Quiz</span>
          </Link>
          <Link
            to={`/quizzes/${quiz._id}`}
            className="flex-1 btn-secondary py-3 flex items-center justify-center space-x-2"
          >
            <span>Preview</span>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Completion Rate</span>
            <span className="font-bold text-green-600">89%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
              style={{ width: '89%' }}
            />
          </div>
        </div>

        {/* AI Generated Badge */}
        {quiz.description?.includes('AI') && (
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
              <Zap size={10} />
              <span>AI GENERATED</span>
            </div>
          </div>
        )}
      </div>

      {/* Hover Effect Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/0 to-accent-500/0 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
      </div>
    </motion.div>
  )
}

export default QuizCard