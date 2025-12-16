// src/pages/Explore.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuiz } from '../context/QuizContext'
import { useAuth } from '../context/AuthContext'
import QuizPreviewModal from '../components/quiz/QuizPreviewModal'

import {
  Search,
  Filter,
  TrendingUp,
  Clock,
  Star,
  Users,
  Zap,
  Hash,
  BarChart3,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

const Explore = () => {
  const { quizzes, fetchQuizzes, loading } = useQuiz()
  const { user } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [filteredQuizzes, setFilteredQuizzes] = useState([])

  // Preview modal state
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  const handlePreview = (quiz) => {
    setSelectedQuiz(quiz)
    setShowPreview(true)
  }

  const categories = [
    'All Categories',
    'General Knowledge',
    'Science',
    'Technology',
    'History',
    'Geography',
    'Sports',
    'Entertainment',
    'Mathematics',
    'Literature',
    'Art',
    'Music',
    'Business',
    'Health',
    'Other'
  ]

  const difficulties = [
    { id: 'all', label: 'All Difficulties', color: 'bg-gray-100' },
    { id: 'easy', label: 'Easy', color: 'bg-green-100 text-green-800' },
    { id: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'hard', label: 'Hard', color: 'bg-red-100 text-red-800' }
  ]

  const sortOptions = [
    { id: 'newest', label: 'Newest', icon: <Clock size={16} /> },
    { id: 'popular', label: 'Most Popular', icon: <TrendingUp size={16} /> },
    { id: 'difficulty', label: 'Difficulty', icon: <BarChart3 size={16} /> },
    { id: 'questions', label: 'Most Questions', icon: <Hash size={16} /> },
    { id: 'rating', label: 'Highest Rated', icon: <Star size={16} /> }
  ]

  useEffect(() => {
    fetchQuizzes()
  }, [])

  useEffect(() => {
    filterAndSortQuizzes()
  }, [quizzes, searchQuery, selectedCategory, selectedDifficulty, sortBy])

  const filterAndSortQuizzes = () => {
    let filtered = [...quizzes]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(query) ||
        quiz.description.toLowerCase().includes(query) ||
        quiz.category.toLowerCase().includes(query) ||
        quiz.createdBy?.username.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(quiz =>
        quiz.category === selectedCategory
      )
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(quiz =>
        quiz.difficulty === selectedDifficulty
      )
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'popular':
          return (b.popularity || 0) - (a.popularity || 0)
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 }
          return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty]
        case 'questions':
          return (b.questions?.length || 0) - (a.questions?.length || 0)
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        default:
          return 0
      }
    })

    setFilteredQuizzes(filtered)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedDifficulty('all')
    setSortBy('newest')
    toast.success('Filters cleared')
  }

  const getPopularQuizzes = () => {
    return [...quizzes]
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 4)
  }

  const getRecentQuizzes = () => {
    return [...quizzes]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4)
  }

  const getCategoryStats = () => {
    const stats = {}
    quizzes.forEach(quiz => {
      stats[quiz.category] = (stats[quiz.category] || 0) + 1
    })
    return Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-accent-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Explore Amazing Quizzes
            </h1>
            <p className="text-xl opacity-90 mb-10">
              Discover thousands of quizzes created by educators, students, and quiz enthusiasts worldwide.
              Test your knowledge, learn something new, and compete with others!
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search quizzes by title, category, or creator..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Filters */}
          <div className="lg:w-1/4 space-y-6">
            {/* Filters Toggle for Mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-between w-full p-4 bg-white rounded-xl shadow-md"
            >
              <div className="flex items-center space-x-2">
                <Filter size={20} />
                <span className="font-semibold">Filters & Sorting</span>
              </div>
              {showFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {/* Filters Panel */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-6`}>
              {/* Sort By */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center space-x-2">
                  <RefreshCw size={20} />
                  <span>Sort By</span>
                </h3>
                <div className="space-y-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSortBy(option.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${sortBy === option.id
                        ? 'bg-primary-50 text-primary-700 border-2 border-primary-200'
                        : 'hover:bg-gray-50'
                        }`}
                    >
                      {option.icon}
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-lg mb-4">Category</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category === 'All Categories' ? 'all' : category)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${selectedCategory === (category === 'All Categories' ? 'all' : category)
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'hover:bg-gray-50'
                        }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-lg mb-4">Difficulty</h3>
                <div className="space-y-2">
                  {difficulties.map((diff) => (
                    <button
                      key={diff.id}
                      onClick={() => setSelectedDifficulty(diff.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${selectedDifficulty === diff.id
                        ? `${diff.color} font-semibold ring-2 ring-offset-2 ring-opacity-50`
                        : 'hover:bg-gray-50'
                        }`}
                    >
                      {diff.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4">Quiz Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Quizzes</span>
                    <span className="font-bold">{quizzes.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Users</span>
                    <span className="font-bold">1,234+</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg. Questions</span>
                    <span className="font-bold">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="font-bold text-green-600">89%</span>
                  </div>
                </div>
              </div>

              {/* Clear Filters Button */}
              <button
                onClick={clearFilters}
                className="w-full p-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Right Column - Quizzes Grid */}
          <div className="lg:w-3/4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {searchQuery ? `Results for "${searchQuery}"` : 'All Quizzes'}
                </h2>
                <p className="text-gray-600">
                  {filteredQuizzes.length} quizzes found
                  {selectedCategory !== 'all' && ` in ${selectedCategory}`}
                  {selectedDifficulty !== 'all' && ` • ${selectedDifficulty} difficulty`}
                </p>
              </div>

              {user && (
                <Link
                  to="/create-quiz"
                  className="btn-primary flex items-center space-x-2 whitespace-nowrap"
                >
                  <Zap size={20} />
                  <span>Create Quiz</span>
                </Link>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="flex gap-2">
                      <div className="h-6 w-20 bg-gray-200 rounded"></div>
                      <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quizzes Grid */}
            {!loading && (
              <>
                {/* Featured Section */}
                {!searchQuery && selectedCategory === 'all' && (
                  <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold flex items-center space-x-2">
                        <TrendingUp className="text-yellow-500" size={24} />
                        <span>Trending Now</span>
                      </h3>
                      <Link
                        to="/explore?sort=popular"
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View all trending →
                      </Link>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      {getPopularQuizzes().map((quiz) => (
                        <QuizCard key={quiz._id} quiz={quiz} featured />
                      ))}
                    </div>
                  </div>
                )}

                {/* Recently Added */}
                {!searchQuery && selectedCategory === 'all' && (
                  <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold flex items-center space-x-2">
                        <Clock className="text-blue-500" size={24} />
                        <span>Recently Added</span>
                      </h3>
                      <Link
                        to="/explore?sort=newest"
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View all recent →
                      </Link>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      {getRecentQuizzes().map((quiz) => (
                        <QuizCard key={quiz._id} quiz={quiz} />
                      ))}
                    </div>
                  </div>
                )}

                {/* All Quizzes Grid */}
                <div>
                  {filteredQuizzes.length > 0 ? (
                    <>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredQuizzes.map((quiz) => (
                          <QuizCard key={quiz._id} quiz={quiz} />
                        ))}
                      </div>

                      {/* Load More (Pagination would go here) */}
                      {filteredQuizzes.length > 12 && (
                        <div className="text-center mt-12">
                          <button className="btn-secondary px-8 py-3">
                            Load More Quizzes
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <Search className="text-gray-400" size={48} />
                      </div>
                      <h3 className="text-2xl font-bold mb-3">No quizzes found</h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        {searchQuery
                          ? `No quizzes match "${searchQuery}". Try a different search term.`
                          : 'No quizzes match your current filters. Try clearing some filters.'
                        }
                      </p>
                      <button
                        onClick={clearFilters}
                        className="btn-primary"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Category Stats */}
            {!loading && quizzes.length > 0 && !searchQuery && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-6">Popular Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {getCategoryStats().map(([category, count], index) => (
                    <div
                      key={category}
                      className="bg-white rounded-xl p-4 border border-gray-200 hover:border-primary-200 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold truncate">{category}</span>
                        <span className="bg-primary-100 text-primary-800 text-sm px-2 py-1 rounded-full">
                          {count}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                            style={{ width: `${(count / quizzes.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {user && (
        <div className="container mx-auto px-4 py-12">
          <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-3xl p-12 text-white text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">
                Ready to share your knowledge?
              </h2>
              <p className="text-xl opacity-90 mb-8">
                Create your own quiz and challenge the community. It only takes a few minutes!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/create-quiz"
                  className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-colors inline-flex items-center justify-center space-x-2"
                >
                  <Zap size={24} />
                  <span>Create a Quiz</span>
                </Link>
                <Link
                  to="/create-quiz"
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl font-bold text-lg transition-colors inline-flex items-center justify-center space-x-2"
                >
                  <Users size={24} />
                  <span>Host a Session</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Preview Modal */}
      <QuizPreviewModal
        quiz={selectedQuiz}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  )
}

export default Explore