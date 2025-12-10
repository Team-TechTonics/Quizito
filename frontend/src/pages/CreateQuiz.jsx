// src/pages/CreateQuiz.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuiz } from '../context/QuizContext'
import { useAuth } from '../context/AuthContext'
import AIGenerator from '../components/ai/AIGenerator'
import QuizCreator from '../components/quiz/QuizCreator'
import { Brain, FileText, Upload, Sparkles, Users, Rocket } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const CreateQuiz = () => {
  const { createQuiz, generateAIQuiz } = useQuiz()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('ai')
  const [loading, setLoading] = useState(false)

  // ⭐ NEW: Create quiz AND host immediately
  const handleCreateAndHost = async (quizData) => {
    setLoading(true)
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';
      
      const response = await axios.post(
        `${API_URL}/api/quizzes/create-and-host`,
        { quizData },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (response.data.success) {
        const { roomCode, joinLinks, session } = response.data
        
        // Store session info
        localStorage.setItem('currentHostSession', JSON.stringify({
          roomCode,
          sessionId: session._id,
          quizId: session.quizId,
          joinLinks
        }))
        
        // Show success message
        toast.success(
          <div>
            <p className="font-bold">🎉 Quiz Created & Room Ready!</p>
            <p className="text-sm">Room Code: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{roomCode}</span></p>
            <button 
              onClick={() => navigator.clipboard.writeText(joinLinks.playerLink)}
              className="mt-2 text-sm text-primary-600 hover:text-primary-800"
            >
              Copy Join Link
            </button>
          </div>,
          { duration: 5000 }
        )
        
        // Redirect to host dashboard
        navigate(`/host/${roomCode}`)
      }
    } catch (error) {
      console.error('Failed to create and host:', error)
      
      // Fallback to regular creation if combined endpoint fails
      if (error.response?.status === 404) {
        toast.error('Quick hosting unavailable. Creating quiz first...')
        const quiz = await createQuiz(quizData)
        if (quiz) {
          navigate(`/quiz/${quiz._id}/host`)
        }
      } else {
        toast.error(error.response?.data?.message || 'Failed to create quiz and room')
      }
    } finally {
      setLoading(false)
    }
  }

  // ⭐ UPDATED: AI Generate -> Create & Host immediately
  const handleAIGenerate = async (topic, numQuestions, difficulty, options = {}) => {
    setLoading(true)
    try {
      // Generate quiz via AI
      const quiz = await generateAIQuiz(topic, numQuestions, difficulty, options)
      
      if (!quiz) {
        throw new Error('Failed to generate quiz')
      }
      
      // Prepare quiz data for hosting
      const quizData = {
        title: quiz.title || `AI Quiz: ${topic}`,
        description: quiz.description || `AI-generated quiz about ${topic}`,
        category: quiz.category || 'General Knowledge',
        difficulty: difficulty || 'medium',
        questions: quiz.questions || [],
        aiGenerated: true,
        aiModel: options.model || 'gpt-3.5-turbo',
        settings: {
          randomizeQuestions: true,
          showLeaderboard: true,
          showExplanations: true,
          allowLateJoin: true,
          ...options.settings
        },
        tags: [topic.toLowerCase().replace(/\s+/g, '-'), 'ai-generated', difficulty],
        visibility: 'public'
      }
      
      // Create and host immediately
      await handleCreateAndHost(quizData)
      
    } catch (err) {
      console.error('AI generation error:', err)
      toast.error(err.message || 'Failed to generate and host quiz')
    } finally {
      setLoading(false)
    }
  }

  // ⭐ UPDATED: Manual creation -> Create & Host immediately
  const handleManualCreate = async (quizData) => {
    try {
      // Add default settings if not provided
      const enhancedQuizData = {
        ...quizData,
        settings: {
          randomizeQuestions: false,
          randomizeOptions: false,
          showProgress: true,
          showTimer: true,
          showResults: true,
          showExplanations: true,
          showLeaderboard: true,
          allowRetake: true,
          allowReview: true,
          requireLogin: true,
          passingScore: 60,
          allowLateJoin: true,
          ...quizData.settings
        },
        visibility: quizData.visibility || 'public',
        status: 'draft'
      }
      
      await handleCreateAndHost(enhancedQuizData)
    } catch (error) {
      toast.error('Failed to create quiz: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto max-w-6xl px-4">

        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-100 to-blue-100 px-6 py-3 rounded-full mb-4 shadow-sm">
            <Sparkles className="text-primary-600" size={20} />
            <span className="text-primary-700 font-semibold">Create & Host Instantly</span>
            <Rocket className="ml-2 text-primary-600" size={16} />
          </div>
          <h1 className="text-4xl font-bold mb-4">Create Your Quiz</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Create amazing quizzes and start hosting live sessions immediately. 
            Your room will be ready to share instantly!
          </p>
        </div>

        {/* Stats Banner */}
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-6 mb-8 border border-primary-100">
          <div className="flex flex-wrap justify-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-700">Instant</div>
              <div className="text-gray-600">Room Generation</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-700">Live</div>
              <div className="text-gray-600">Multiplayer</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-700">Real-time</div>
              <div className="text-gray-600">Leaderboard</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-700">Share</div>
              <div className="text-gray-600">Via Link/Code</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-6 mb-8">
          {/* AI Tab */}
          <button
            className={`flex flex-col items-center justify-center w-48 h-32 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 ${
              activeTab === 'ai' 
                ? 'bg-white border-2 border-primary-300 shadow-lg' 
                : 'bg-gray-50 hover:bg-gray-100 shadow'
            }`}
            onClick={() => setActiveTab('ai')}
          >
            <div className={`p-3 rounded-full mb-3 ${activeTab === 'ai' ? 'bg-primary-100' : 'bg-gray-200'}`}>
              <Brain size={24} className={activeTab === 'ai' ? 'text-primary-600' : 'text-gray-600'} />
            </div>
            <span className={`font-semibold ${activeTab === 'ai' ? 'text-primary-700' : 'text-gray-700'}`}>
              AI Generator
            </span>
            <span className="text-sm text-gray-500 mt-1">Generate with AI</span>
          </button>

          {/* Manual Tab */}
          <button
            className={`flex flex-col items-center justify-center w-48 h-32 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 ${
              activeTab === 'manual' 
                ? 'bg-white border-2 border-primary-300 shadow-lg' 
                : 'bg-gray-50 hover:bg-gray-100 shadow'
            }`}
            onClick={() => setActiveTab('manual')}
          >
            <div className={`p-3 rounded-full mb-3 ${activeTab === 'manual' ? 'bg-primary-100' : 'bg-gray-200'}`}>
              <FileText size={24} className={activeTab === 'manual' ? 'text-primary-600' : 'text-gray-600'} />
            </div>
            <span className={`font-semibold ${activeTab === 'manual' ? 'text-primary-700' : 'text-gray-700'}`}>
              Manual Creator
            </span>
            <span className="text-sm text-gray-500 mt-1">Create manually</span>
          </button>

          {/* Upload Tab (Coming Soon) */}
          <button
            className="flex flex-col items-center justify-center w-48 h-32 rounded-2xl bg-gray-50 opacity-50 cursor-not-allowed"
            disabled
          >
            <div className="p-3 rounded-full mb-3 bg-gray-200">
              <Upload size={24} className="text-gray-400" />
            </div>
            <span className="font-semibold text-gray-400">
              Upload
            </span>
            <span className="text-sm text-gray-400 mt-1">Coming soon</span>
          </button>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {activeTab === 'ai' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Brain className="text-primary-600" />
                    AI Quiz Generator
                  </h2>
                  <p className="text-gray-600">
                    Let AI create an engaging quiz for you. Just provide a topic!
                  </p>
                </div>
                {loading && (
                  <div className="flex items-center gap-2 text-primary-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                    <span>Creating & hosting...</span>
                  </div>
                )}
              </div>
              <AIGenerator 
                onGenerate={handleAIGenerate} 
                loading={loading} 
                setLoading={setLoading}
                immediateHosting={true}
              />
            </div>
          )}

          {activeTab === 'manual' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <FileText className="text-primary-600" />
                    Manual Quiz Creator
                  </h2>
                  <p className="text-gray-600">
                    Build your quiz from scratch. Add questions, options, and explanations.
                  </p>
                </div>
                {loading && (
                  <div className="flex items-center gap-2 text-primary-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                    <span>Creating & hosting...</span>
                  </div>
                )}
              </div>
              <QuizCreator 
                onCreate={handleManualCreate} 
                loading={loading}
                immediateHosting={true}
              />
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <Users size={20} />
            Quick Hosting Tips
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <li className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-sm font-bold">1</span>
              </div>
              <span className="text-gray-700">Your room code will be generated immediately after quiz creation</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-sm font-bold">2</span>
              </div>
              <span className="text-gray-700">Share the 6-digit code or QR code with participants</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-sm font-bold">3</span>
              </div>
              <span className="text-gray-700">Monitor players in real-time from the host dashboard</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-sm font-bold">4</span>
              </div>
              <span className="text-gray-700">Participants can join via code at <span className="font-mono">quizito.com/join</span></span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  )
}

export default CreateQuiz