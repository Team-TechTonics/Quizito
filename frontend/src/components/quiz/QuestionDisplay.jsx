// src/components/quiz/QuestionDisplay.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle,
  BarChart3,
  Zap,
  TrendingUp,
  AlertCircle,
  Target,
  Award,
  ChevronRight,
  ChevronLeft,
  Volume2,
  VolumeX,
  Flag
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Countdown from 'react-countdown'
import { useSpeech } from '../../hooks/useSpeech'

const QuestionDisplay = ({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  onNext,
  onPrevious,
  timeLimit = 30,
  showResults = false,
  isHost = false,
  onTimeUp,
  difficulty = 'medium'
}) => {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [isTimeUp, setIsTimeUp] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [timerActive, setTimerActive] = useState(true)
  const [answerSubmitted, setAnswerSubmitted] = useState(false)
  const [hoveredOption, setHoveredOption] = useState(null)

  const timerRef = useRef(null)
  const questionStartTime = useRef(Date.now())
  const audioRef = useRef(null)

  // Speech-to-Text hook
  const { speak, stop, isSpeaking, speechEnabled, toggleSpeech } = useSpeech()

  const difficulties = {
    easy: { color: 'from-green-500 to-emerald-500', label: 'Easy', icon: '🌟' },
    medium: { color: 'from-yellow-500 to-orange-500', label: 'Medium', icon: '⚡' },
    hard: { color: 'from-red-500 to-pink-500', label: 'Hard', icon: '🔥' }
  }

  const questionTypes = {
    'multiple-choice': 'Multiple Choice',
    'true-false': 'True/False',
    'short-answer': 'Short Answer'
  }

  // Start timer when question changes
  useEffect(() => {
    if (!question || !timerActive) return

    setTimeRemaining(timeLimit)
    setIsTimeUp(false)
    setAnswerSubmitted(false)
    setShowExplanation(false)
    questionStartTime.current = Date.now()

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [question, timeLimit, timerActive])

  // Play sound when time is running low
  useEffect(() => {
    if (timeRemaining <= 10 && timeRemaining > 0 && !answerSubmitted) {
      playLowTimeSound()
    }
  }, [timeRemaining, answerSubmitted])

  // Speak question when it changes (if speech is enabled)
  useEffect(() => {
    if (speechEnabled && question?.question) {
      // Speak the question text
      speak(question.question)
    }

    // Cleanup: stop speaking when component unmounts or question changes
    return () => {
      stop()
    }
  }, [question, speechEnabled])

  const handleTimeUp = () => {
    setIsTimeUp(true)
    setTimerActive(false)
    if (onTimeUp) {
      const timeTaken = Math.floor((Date.now() - questionStartTime.current) / 1000)
      onTimeUp(timeTaken)
    }

    // Auto-select if no answer chosen
    if (!selectedAnswer && question?.options?.length > 0) {
      const randomOption = question.options[0].text
      handleAnswerSelect(randomOption)
    }
  }

  const playLowTimeSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      // Create a simple beep sound using Web Audio API
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = 800
        oscillator.type = 'sine'

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.1)
      } catch (error) {
        console.log('Audio not supported')
      }
    }
  }

  const handleAnswerSelect = (option) => {
    if (answerSubmitted || isTimeUp) return

    setAnswerSubmitted(true)
    setTimerActive(false)
    clearInterval(timerRef.current)

    const timeTaken = Math.floor((Date.now() - questionStartTime.current) / 1000)

    if (onAnswerSelect) {
      onAnswerSelect(option, timeTaken)
    }
  }

  const getOptionClass = (option) => {
    if (!answerSubmitted && !showResults) {
      return selectedAnswer === option ? 'selected' : ''
    }

    const isCorrect = option === question?.correctAnswer
    const isSelected = selectedAnswer === option

    if (showResults || answerSubmitted) {
      if (isCorrect) return 'correct'
      if (isSelected && !isCorrect) return 'incorrect'
      if (isSelected && isCorrect) return 'correct'
    }

    return ''
  }

  const getOptionLetter = (index) => {
    return String.fromCharCode(65 + index)
  }

  const getTimeColor = () => {
    if (timeRemaining <= 10) return 'text-red-600 animate-pulse'
    if (timeRemaining <= 20) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getPointsForAnswer = () => {
    if (!selectedAnswer || !question) return 0

    const basePoints = question.points || 100
    const timeTaken = Math.floor((Date.now() - questionStartTime.current) / 1000)
    const timeBonus = Math.max(0, 10 - timeTaken) * 10 // Bonus for speed

    return selectedAnswer === question.correctAnswer
      ? basePoints + timeBonus
      : 0
  }

  const handleNext = () => {
    if (onNext) {
      onNext()
    }
    setTimerActive(true)
  }

  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious()
    }
  }

  if (!question) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No question available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Question Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* Question Info */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xl">
                {questionIndex + 1}
              </div>
              <div className="absolute -top-2 -right-2 bg-white border-2 border-primary-500 rounded-full px-2 py-1 text-xs font-bold">
                {totalQuestions}
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className={`badge bg-gradient-to-r ${difficulties[difficulty].color} text-white border-0`}>
                  {difficulties[difficulty].icon} {difficulties[difficulty].label}
                </span>
                <span className="badge bg-gray-100 text-gray-800 border-gray-300">
                  {questionTypes[question.type] || 'Multiple Choice'}
                </span>
                {isHost && (
                  <span className="badge bg-purple-100 text-purple-800 border-purple-300">
                    Host View
                  </span>
                )}
              </div>
              <h3 className="text-sm text-gray-600">Question {questionIndex + 1} of {totalQuestions}</h3>
            </div>
          </div>

          {/* Speech Control, Timer and Points */}
          <div className="flex items-center space-x-4">
            {/* Speech Control Button */}
            <button
              onClick={toggleSpeech}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all ${speechEnabled
                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              title={speechEnabled ? 'Disable question reading' : 'Enable question reading'}
            >
              {speechEnabled ? (
                <>
                  <Volume2 size={20} className={isSpeaking ? 'animate-pulse' : ''} />
                  <span className="hidden sm:inline font-medium">
                    {isSpeaking ? 'Speaking...' : 'Speech On'}
                  </span>
                </>
              ) : (
                <>
                  <VolumeX size={20} />
                  <span className="hidden sm:inline font-medium">Speech Off</span>
                </>
              )}
            </button>

            {/* Timer */}
            <div className="text-center">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className={`${getTimeColor()}`} size={20} />
                <div className={`text-3xl font-bold ${getTimeColor()}`}>
                  {timeRemaining}s
                </div>
              </div>
              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${timeRemaining <= 10
                    ? 'bg-gradient-to-r from-red-500 to-pink-500'
                    : timeRemaining <= 20
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500'
                    }`}
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeRemaining / timeLimit) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>
            </div>

            {/* Points */}
            <div className="text-center">
              <div className="flex items-center space-x-2 mb-2">
                <Award className="text-yellow-500" size={20} />
                <div className="text-3xl font-bold text-yellow-600">
                  {question.points || 100}
                </div>
              </div>
              <div className="text-sm text-gray-600">Points</div>
            </div>
          </div>
        </div>

        {/* Question Text */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border-2 border-gray-200 mb-8">
          <h2 className="text-3xl font-bold leading-relaxed mb-6">
            {question.question}
          </h2>

          {question.image && (
            <div className="mb-6">
              <img
                src={question.image}
                alt="Question illustration"
                className="max-w-full h-auto rounded-xl shadow-lg"
              />
            </div>
          )}

          {/* Question Stats (for host) */}
          {isHost && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-bold text-gray-700 mb-3">Question Statistics</h4>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">85%</div>
                  <div className="text-sm text-gray-600">Avg. Accuracy</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">23s</div>
                  <div className="text-sm text-gray-600">Avg. Time</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">72%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">4.2</div>
                  <div className="text-sm text-gray-600">Difficulty Score</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Options Grid */}
      <div className={`grid ${question.options.length <= 2 ? 'grid-cols-1 md:grid-cols-2' :
        question.options.length <= 4 ? 'grid-cols-1 md:grid-cols-2' :
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'
        } gap-4 mb-8`}>
        {question.options.map((option, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: !answerSubmitted && !selectedAnswer ? 1.02 : 1 }}
            whileTap={{ scale: !answerSubmitted && !selectedAnswer ? 0.98 : 1 }}
            onClick={() => handleAnswerSelect(option.text)}
            onMouseEnter={() => setHoveredOption(index)}
            onMouseLeave={() => setHoveredOption(null)}
            disabled={answerSubmitted || isTimeUp}
            className={`quiz-option relative overflow-hidden group ${getOptionClass(option.text)
              } ${hoveredOption === index ? 'scale-[1.02]' : ''}`}
          >
            {/* Option Letter */}
            <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${selectedAnswer === option.text
              ? 'bg-gradient-to-br from-primary-600 to-accent-600 text-white'
              : 'bg-gray-100 text-gray-700'
              }`}>
              {getOptionLetter(index)}
            </div>

            {/* Option Text */}
            <div className="pl-16 pr-12 py-4">
              <p className="text-lg font-medium">{option.text}</p>

              {/* Option Stats (for host) */}
              {isHost && (
                <div className="mt-2 flex items-center space-x-3 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <BarChart3 size={12} />
                    <span>65% selected</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={12} />
                    <span>12s avg</span>
                  </div>
                </div>
              )}
            </div>

            {/* Status Icons */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              {answerSubmitted || showResults ? (
                option.text === question.correctAnswer ? (
                  <CheckCircle className="text-green-500" size={24} />
                ) : selectedAnswer === option.text ? (
                  <XCircle className="text-red-500" size={24} />
                ) : null
              ) : selectedAnswer === option.text ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              ) : hoveredOption === index && !answerSubmitted ? (
                <ChevronRight className="text-gray-400 group-hover:text-primary-500" size={24} />
              ) : null}
            </div>

            {/* Hover Gradient */}
            {!answerSubmitted && !selectedAnswer && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/0 to-accent-500/0 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            )}
          </motion.button>
        ))}
      </div>

      {/* Answer Feedback */}
      <AnimatePresence>
        {(answerSubmitted || showResults) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={`rounded-2xl p-8 mb-8 ${selectedAnswer === question.correctAnswer
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200'
              : 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200'
              }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    {selectedAnswer === question.correctAnswer ? (
                      <>
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                          <CheckCircle className="text-green-600" size={28} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-green-800">Correct! 🎉</h3>
                          <p className="text-green-700">
                            Excellent! You answered correctly in {Math.floor((Date.now() - questionStartTime.current) / 1000)} seconds
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                          <XCircle className="text-red-600" size={28} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-red-800">Not Quite Right</h3>
                          <p className="text-red-700">
                            The correct answer was: <span className="font-bold">{question.correctAnswer}</span>
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Points Earned */}
                  <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl mb-4">
                    <Award className="text-yellow-500" size={20} />
                    <span className="font-bold text-lg">
                      {getPointsForAnswer()} points earned
                    </span>
                    {timeRemaining > 20 && (
                      <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        + Speed Bonus!
                      </span>
                    )}
                  </div>

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="mt-4">
                      <button
                        onClick={() => setShowExplanation(!showExplanation)}
                        className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium mb-2"
                      >
                        <HelpCircle size={20} />
                        <span>{showExplanation ? 'Hide Explanation' : 'Show Explanation'}</span>
                      </button>

                      {showExplanation && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200"
                        >
                          <p className="text-gray-700">{question.explanation}</p>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>

                {/* Score Breakdown */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 min-w-[200px]">
                  <h4 className="font-bold text-gray-800 mb-4">Score Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Points</span>
                      <span className="font-bold">{question.points || 100}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Bonus</span>
                      <span className="font-bold text-green-600">
                        +{Math.max(0, 10 - Math.floor((Date.now() - questionStartTime.current) / 1000)) * 10}
                      </span>
                    </div>
                    <div className="pt-3 border-t">
                      <div className="flex justify-between">
                        <span className="font-bold">Total</span>
                        <span className="font-bold text-2xl text-yellow-600">
                          {getPointsForAnswer()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Previous Button */}
          {questionIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="flex items-center space-x-2 px-6 py-3 border-2 border-gray-300 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
              <span>Previous</span>
            </button>
          )}

          {/* Flag Question */}
          <button
            className="flex items-center space-x-2 px-4 py-3 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-colors"
            title="Flag question for review"
          >
            <Flag size={18} />
            <span className="hidden sm:inline">Flag</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Timer Status */}
          {isTimeUp && !answerSubmitted && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
              <AlertCircle size={18} />
              <span>Time's up!</span>
            </div>
          )}

          {/* Next Button */}
          {(answerSubmitted || showResults || isHost) && questionIndex < totalQuestions - 1 && (
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 btn-primary px-8 py-3"
            >
              <span>Next Question</span>
              <ChevronRight size={20} />
            </button>
          )}

          {/* Complete Button */}
          {(answerSubmitted || showResults) && questionIndex === totalQuestions - 1 && (
            <button
              onClick={() => window.location.href = '/results'}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-shadow"
            >
              <span>Complete Quiz</span>
              <Award size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-primary-600">{questionIndex + 1}</div>
            <div className="text-sm text-gray-600">Current Question</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(((questionIndex + 1) / totalQuestions) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Progress</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">
              {Math.floor((Date.now() - questionStartTime.current) / 1000)}s
            </div>
            <div className="text-sm text-gray-600">Time Spent</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-yellow-600">
              {selectedAnswer === question.correctAnswer ? question.points || 100 : 0}
            </div>
            <div className="text-sm text-gray-600">Points Earned</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionDisplay