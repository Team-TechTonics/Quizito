// src/components/ai/AIGenerator.jsx
import React, { useState } from 'react'
import { Sparkles, Hash, TrendingUp, Zap, AlertCircle } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const AIGenerator = ({ onGenerate, loading, setLoading }) => {
  const [topic, setTopic] = useState('')
  const [numQuestions, setNumQuestions] = useState(10)
  const [difficulty, setDifficulty] = useState('medium')
  const [useFallback, setUseFallback] = useState(false)
  const { token } = useAuth()

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

  // Get API URL - supports both Vite and Create React App
  const getApiUrl = () => {
    // Try Vite first
    if (import.meta.env && import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    // Try Create React App
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    // Default fallback
    return 'http://localhost:10000';
  }

  // Get token from context or localStorage
  const getToken = () => {
    if (token) return token;
    // Fallback to localStorage
    return localStorage.getItem('quizito_token') || localStorage.getItem('token');
  }

  // Generate fallback questions locally (no API needed)
  const generateFallbackQuestions = () => {
    const questions = [];
    for (let i = 1; i <= numQuestions; i++) {
      questions.push({
        question: `Sample question ${i} about ${topic}?`,
        type: 'multiple-choice',
        options: [
          { text: 'Correct answer', isCorrect: true },
          { text: 'Incorrect answer 1', isCorrect: false },
          { text: 'Incorrect answer 2', isCorrect: false },
          { text: 'Incorrect answer 3', isCorrect: false },
        ],
        correctAnswer: 'Correct answer',
        correctIndex: 0,
        explanation: `This is the correct answer for question ${i} about ${topic}.`,
        difficulty: difficulty,
        points: 100,
        timeLimit: 30,
        tags: [topic.toLowerCase().replace(/\s+/g, '-'), 'fallback'],
        aiGenerated: false,
        aiModel: 'fallback',
      });
    }
    
    return {
      title: `Quiz: ${topic}`,
      description: `Learn about ${topic}`,
      category: topic,
      difficulty: difficulty,
      questions: questions,
      aiGenerated: false,
      fallback: true,
    };
  }

  // 🚀 Handle AI Generation with Fallback
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!topic.trim()) {
      toast.error('Please enter a topic')
      return
    }

    setLoading(true)

    try {
      const API_URL = getApiUrl();
      const authToken = getToken();
      
      if (!authToken) {
        toast.error('Please log in to generate quizzes');
        setLoading(false);
        return;
      }

      console.log('Generating quiz for topic:', topic)
      
      let quizData;
      
      if (useFallback) {
        // Use local fallback generator
        toast.loading('Generating fallback questions...', { id: 'ai-generate' });
        quizData = generateFallbackQuestions();
        toast.success('Fallback questions generated!', { id: 'ai-generate' });
      } else {
        // Try to use AI service
        try {
          const response = await axios.post(
            `${API_URL}/api/ai/generate`,
            {
              type: "topic",
              content: topic,
              options: {
                numQuestions,
                difficulty,
                category: topic,
                language: "en",
                questionTypes: ["multiple-choice"],
                includeExplanations: true,
                includeHints: true
              }
            },
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json"
              },
              timeout: 30000 // 30 second timeout
            }
          );

          console.log('AI Generation Response:', response.data)

          if (response.data.success) {
            toast.success('AI quiz generated successfully!')
            quizData = response.data.quiz;
          } else {
            throw new Error(response.data.message || 'AI service failed');
          }
        } catch (aiError) {
          console.warn('AI service failed, using fallback:', aiError.message);
          toast.error('AI service unavailable. Using fallback questions.', {
            duration: 5000,
            icon: '⚠️'
          });
          
          // Show option to retry with fallback
          if (window.confirm('AI service is unavailable. Would you like to use fallback questions instead?')) {
            quizData = generateFallbackQuestions();
            setUseFallback(true);
          } else {
            throw new Error('AI generation cancelled');
          }
        }
      }

      // Pass the generated quiz data back to parent
      if (onGenerate && quizData) {
        // Call parent's onGenerate with quiz data
        onGenerate(
          topic, 
          numQuestions, 
          difficulty, 
          {
            quiz: quizData,
            model: quizData.aiModel || 'fallback',
            fallback: quizData.fallback || false
          }
        )
      }

    } catch (error) {
      console.error('Quiz Generation Error:', error)

      let errorMessage = 'Failed to generate quiz';
      
      if (error.message === 'AI generation cancelled') {
        errorMessage = 'Quiz generation cancelled';
      } else if (error.response?.status === 401) {
        errorMessage = 'Please log in again';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to use AI features';
      } else if (error.response?.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (error.response?.status === 503) {
        errorMessage = 'AI service is currently unavailable. Try fallback mode.';
      }

      toast.error(errorMessage);

    } finally {
      setLoading(false)
    }
  }

  // Quick generate with fallback
  const handleQuickGenerate = (sampleTopic) => {
    setTopic(sampleTopic);
    setUseFallback(true); // Use fallback for quick generation
    setTimeout(() => {
      document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 100);
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
          disabled={loading}
        />

        {/* Sample Topics */}
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Quick suggestions (fallback mode):</p>
          <div className="flex flex-wrap gap-2">
            {sampleTopics.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => handleQuickGenerate(sample)}
                disabled={loading}
                className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={loading}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={loading}
                className={`flex-1 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
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

      {/* Mode Selection */}
      <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h4 className="font-semibold text-yellow-800 mb-2">Generation Mode</h4>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={!useFallback}
                  onChange={() => setUseFallback(false)}
                  disabled={loading}
                  className="text-primary-600"
                />
                <span className="text-gray-700">Try AI First (requires API key)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={useFallback}
                  onChange={() => setUseFallback(true)}
                  disabled={loading}
                  className="text-primary-600"
                />
                <span className="text-gray-700">Use Fallback Mode (no API needed)</span>
              </label>
            </div>
            <p className="text-sm text-yellow-700">
              {useFallback 
                ? 'Using fallback mode: Simple questions generated locally without AI.'
                : 'AI mode: Will try OpenAI/DeepSeek first, fallback if unavailable.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="pt-8 border-t">
        <button
          type="submit"
          disabled={loading || !topic.trim()}
          className={`w-full text-lg py-4 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed ${
            useFallback ? 'btn-secondary' : 'btn-primary'
          }`}
        >
          <div className="flex items-center justify-center space-x-3">
            {loading ? (
              <>
                <div className={`w-6 h-6 border-2 ${useFallback ? 'border-gray-600' : 'border-white'} border-t-transparent rounded-full animate-spin`} />
                <span>Generating Quiz...</span>
              </>
            ) : (
              <>
                <Sparkles className="group-hover:scale-110 transition-transform" />
                <span>
                  {useFallback ? 'Generate Fallback Quiz' : 'Generate Quiz with AI'}
                </span>
                <Zap className="group-hover:scale-110 transition-transform" />
              </>
            )}
          </div>

          {/* Button Hover Background */}
          {!useFallback && (
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[length:200%_100%] animate-shimmer" />
          )}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          {useFallback 
            ? `Will generate ${numQuestions} ${difficulty} fallback questions about "${topic}"`
            : `Our AI will generate ${numQuestions} ${difficulty} questions about "${topic}"`
          }
        </p>
      </div>

      {/* Preview Section */}
      <div className={`rounded-2xl p-6 ${useFallback ? 'bg-gray-50 border border-gray-200' : 'bg-gradient-to-br from-primary-50 to-accent-50'}`}>
        <h4 className="font-bold text-gray-800 mb-3 flex items-center space-x-2">
          <Sparkles size={20} />
          <span>What to Expect</span>
        </h4>

        <ul className="space-y-2 mb-4">
          <li className="flex items-start space-x-2">
            <div className={`w-2 h-2 ${useFallback ? 'bg-gray-500' : 'bg-primary-500'} rounded-full mt-2`} />
            <span className="text-gray-700">
              Multiple choice questions with 4 options each
            </span>
          </li>

          <li className="flex items-start space-x-2">
            <div className={`w-2 h-2 ${useFallback ? 'bg-gray-500' : 'bg-primary-500'} rounded-full mt-2`} />
            <span className="text-gray-700">
              Difficulty level: {difficulty}
            </span>
          </li>

          <li className="flex items-start space-x-2">
            <div className={`w-2 h-2 ${useFallback ? 'bg-gray-500' : 'bg-primary-500'} rounded-full mt-2`} />
            <span className="text-gray-700">
              Clear explanations for correct answers
            </span>
          </li>

          <li className="flex items-start space-x-2">
            <div className={`w-2 h-2 ${useFallback ? 'bg-gray-500' : 'bg-primary-500'} rounded-full mt-2`} />
            <span className="text-gray-700">
              Ready-to-host quiz session (creates room automatically)
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <div className={`w-2 h-2 ${useFallback ? 'bg-gray-500' : 'bg-primary-500'} rounded-full mt-2`} />
            <span className="text-gray-700">
              Estimated time: {Math.round(numQuestions * 0.5)}-{Math.round(numQuestions * 1)} minutes
            </span>
          </li>
        </ul>

        {/* Mode-specific note */}
        {useFallback ? (
          <div className="p-3 bg-gray-100 rounded-lg border border-gray-300">
            <p className="text-sm text-gray-700">
              <strong>Fallback Mode:</strong> Generating simple questions locally without AI.
              Perfect for testing or when AI services are unavailable.
            </p>
          </div>
        ) : (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-700">
              <strong>AI Mode:</strong> Requires valid OpenAI or DeepSeek API key on backend.
              Contact admin if you see API key errors.
            </p>
          </div>
        )}
      </div>

      {/* API Key Instructions */}
      {!useFallback && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <h4 className="font-semibold text-purple-800 mb-2 flex items-center space-x-2">
            <AlertCircle size={18} />
            <span>Need AI? Fix API Key</span>
          </h4>
          <p className="text-sm text-purple-700 mb-2">
            To use AI quiz generation, you need to configure API keys on the server:
          </p>
          <ul className="text-sm text-purple-600 space-y-1 mb-3">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Get an OpenAI API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com</a>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Or get a DeepSeek API key from <a href="https://platform.deepseek.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">platform.deepseek.com</a>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Add the key to backend environment variables: <code className="bg-purple-100 px-1 rounded">OPENAI_API_KEY</code> or <code className="bg-purple-100 px-1 rounded">DEEPSEEK_API_KEY</code>
            </li>
          </ul>
          <button
            type="button"
            onClick={() => setUseFallback(true)}
            className="text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded"
          >
            Use Fallback Mode Instead
          </button>
        </div>
      )}
    </form>
  )
}

export default AIGenerator