// src/components/ai/AIGenerator.jsx
import React, { useState } from 'react'
import { Sparkles, Hash, TrendingUp, Zap } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AIGenerator = ({ onGenerate, loading, setLoading }) => {
  const [topic, setTopic] = useState('')
  const [numQuestions, setNumQuestions] = useState(10)
  const [difficulty, setDifficulty] = useState('medium')

  const difficulties = [
    { id: 'easy', label: 'Easy', color: 'bg-green-100 text-green-800' },
    { id: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'hard', label: 'Hard', color: 'bg-red-100 text-red-800' },
  ]

  const sampleTopics = [
    'World History',
    'Computer Science',
    'Biology',
    'Pop Culture',
    'Sports',
    'Geography',
    'Mathematics',
    'Literature'
  ]

  // 🚀 UPDATED handleSubmit (AI QUIZ GENERATION FIX)
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!topic.trim()) return

    setLoading(true)

    try {
      console.log('Generating quiz for topic:', topic)
      console.log('Num questions:', numQuestions)
      console.log('Difficulty:', difficulty)

      // ⚡ Correct backend parameter names
      const response = await axios.post(
  `${import.meta.env.VITE_API_URL || "http://localhost:10000"}/api/ai/generate`,
  {
    type: "topic",
    content: topic,
    options: {
      numQuestions,
      difficulty
    }
  },
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("quizito_token")}`,
      "Content-Type": "application/json"
    }
  }
);

      console.log('AI Generation Response:', response.data)

      if (response.data.success) {
        toast.success('Quiz generated successfully!')
        if (onGenerate) onGenerate(topic, numQuestions, difficulty)
      } else {
        toast.error(response.data.message || 'Failed to generate quiz')
      }

    } catch (error) {
      console.error('AI Generation Error Details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.response?.config
      })

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to generate quiz'

      toast.error(`AI Generation Failed: ${errorMessage}`)

    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Topic Input */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          What topic would you like to quiz about?
        </label>

        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Renaissance Art, Quantum Physics, JavaScript Basics"
          className="input-field text-lg py-4"
          required
        />

        {/* Sample Topics */}
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Quick suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {sampleTopics.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setTopic(sample)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Number of Questions */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-4">
            <Hash size={16} />
            <span>Number of Questions</span>
          </label>

          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="5"
              max="20"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-2xl font-bold text-primary-600 min-w-[60px]">
              {numQuestions}
            </div>
          </div>

          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>5 questions</span>
            <span>20 questions</span>
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-4">
            <TrendingUp size={16} />
            <span>Difficulty Level</span>
          </label>

          <div className="flex gap-2">
            {difficulties.map((diff) => (
              <button
                key={diff.id}
                type="button"
                onClick={() => setDifficulty(diff.id)}
                className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                  difficulty === diff.id
                    ? `${diff.color} ring-2 ring-offset-2 ring-opacity-50`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Generate Button */}
      <div className="pt-8 border-t">
        <button
          type="submit"
          disabled={loading || !topic.trim()}
          className="w-full btn-primary text-lg py-4 relative overflow-hidden group"
        >
          <div className="flex items-center justify-center space-x-3">
            {loading ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Quiz...</span>
              </>
            ) : (
              <>
                <Sparkles className="group-hover:scale-110 transition-transform" />
                <span>Generate Quiz with AI</span>
                <Zap className="group-hover:scale-110 transition-transform" />
              </>
            )}
          </div>

          {/* Button Hover Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[length:200%_100%] animate-shimmer" />
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Our AI will generate {numQuestions} {difficulty} questions about "{topic}"
        </p>
      </div>

      {/* Preview Section */}
      <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-6">
        <h4 className="font-bold text-gray-800 mb-3 flex items-center space-x-2">
          <Sparkles size={20} />
          <span>What to Expect</span>
        </h4>

        <ul className="space-y-2">
          <li className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />
            <span className="text-gray-700">
              Multiple choice questions with 4 options each
            </span>
          </li>

          <li className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />
            <span className="text-gray-700">
              Automatic difficulty adjustment based on your selection
            </span>
          </li>

          <li className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />
            <span className="text-gray-700">
              Clear explanations for correct answers
            </span>
          </li>

          <li className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />
            <span className="text-gray-700">
              Ready-to-host quiz session
            </span>
          </li>
        </ul>
      </div>
    </form>
  )
}

export default AIGenerator
