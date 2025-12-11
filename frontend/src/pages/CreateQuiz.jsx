// src/pages/CreateQuiz.jsx
import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuiz } from '../context/QuizContext'
import { useAuth } from '../context/AuthContext'
import AIGenerator from '../components/ai/AIGenerator'
import QuizCreator from '../components/quiz/QuizCreator'
import { Brain, FileText, Upload, Sparkles, Users, Rocket, Copy, Zap, Mic, Square, Play } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../lib/api.js'

const CreateQuiz = () => {
  const { createQuiz, generateAIQuiz } = useQuiz()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('ai')
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recordingIntervalRef = useRef(null)

  // TWO-STEP METHOD: Create quiz, then create session
  const handleCreateAndHost = async (quizData) => {
    setLoading(true)
    try {
      console.log("Creating quiz with data title:", quizData.title);

      // STEP 1: Create the quiz
      const quizResponse = await api.post(
        '/api/quizzes',
        quizData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!quizResponse.data.success) {
        throw new Error(quizResponse.data.message || 'Failed to create quiz')
      }

      const quiz = quizResponse.data.quiz
      console.log("Quiz created successfully:", quiz._id);

      // STEP 2: Create a session for this quiz
      console.log("Creating session for quiz:", quiz._id);
      const sessionResponse = await api.post(
        '/api/sessions',
        {
          quizId: quiz._id,
          name: quiz.title,
          description: quiz.description || "Join this quiz session!",
          settings: {
            maxPlayers: 100,
            questionTime: 30,
            showLeaderboard: true,
            showCorrectAnswers: true,
            allowLateJoin: true,
            requireApproval: false,
            privateMode: false,
            ...quizData.settings
          }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!sessionResponse.data.success) {
        throw new Error(sessionResponse.data.message || 'Failed to create session')
      }

      const session = sessionResponse.data.session
      const roomCode = session.roomCode

      console.log("Session created successfully. Room code:", roomCode);

      // Create join links
      // Use window.location.origin for frontend URL - simpler and more robust
      const FRONTEND_URL = window.location.origin;
      const joinLinks = {
        playerLink: `${FRONTEND_URL}/join/${roomCode}`,
        hostDashboard: `${FRONTEND_URL}/host/${roomCode}`,
        embedCode: `<iframe src="${FRONTEND_URL}/embed/${roomCode}" width="800" height="600"></iframe>`,
      }

      // Store session info
      localStorage.setItem('currentHostSession', JSON.stringify({
        roomCode,
        sessionId: session._id,
        quizId: quiz._id,
        quizTitle: quiz.title,
        joinLinks
      }))

      // Show success message with copy button
      toast.success(
        <div className="p-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Rocket size={16} className="text-green-600" />
            </div>
            <p className="font-bold text-lg">🎉 Quiz & Room Ready!</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Room Code:</span>
              <code className="bg-gray-100 px-3 py-1 rounded-lg font-mono text-lg font-bold">
                {roomCode}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(roomCode)
                  toast.success('Room code copied!')
                }}
                className="p-1 hover:bg-gray-200 rounded"
                title="Copy room code"
              >
                <Copy size={16} />
              </button>
            </div>

            <div className="mt-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(joinLinks.playerLink)
                  toast.success('Join link copied!')
                }}
                className="text-sm bg-primary-100 hover:bg-primary-200 text-primary-800 px-3 py-1 rounded flex items-center gap-1"
              >
                <Copy size={12} />
                Copy Join Link
              </button>
            </div>
          </div>
        </div>,
        {
          duration: 8000,
          position: 'top-center'
        }
      )

      // Redirect to host dashboard after a short delay
      setTimeout(() => {
        navigate(`/host/${roomCode}`)
      }, 1500)

      return true

    } catch (error) {
      console.error('Failed to create and host:', error)

      let errorMessage = 'Failed to create quiz and room'

      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || error.response.statusText

        // More specific error messages
        if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.'
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to create quizzes.'
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.errors?.join(', ') || errorMessage
        }
      } else if (error.request) {
        // No response received
        errorMessage = 'No response from server. Please check your connection.'
      }

      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleAIGenerate = async (topic, numQuestions, difficulty, options = {}) => {
    setLoading(true)
    try {
      let quizData;

      if (options.quiz) {
        // Use provided quiz data (whether fallback or real AI)
        quizData = options.quiz;
      } else {
        // Generate quiz via AI (legacy path or direct call)
        const quiz = await generateAIQuiz(topic, numQuestions, difficulty, options)

        if (!quiz) {
          throw new Error('Failed to generate quiz')
        }

        quizData = quiz;
      }

      // Prepare quiz data for hosting
      const enhancedQuizData = {
        title: quizData.title || `Quiz: ${topic}`,
        description: quizData.description || `Quiz about ${topic}`,
        category: quizData.category || 'General Knowledge',
        difficulty: difficulty || 'medium',
        questions: quizData.questions || [],
        aiGenerated: quizData.aiGenerated || false,
        aiModel: quizData.aiModel || 'fallback',
        settings: {
          randomizeQuestions: true,
          showLeaderboard: true,
          showExplanations: true,
          allowLateJoin: true,
          ...options.settings
        },
        tags: [topic.toLowerCase().replace(/\s+/g, '-'), quizData.fallback ? 'fallback' : 'ai-generated', difficulty],
        visibility: 'public'
      }

      // Create and host
      await handleCreateAndHost(enhancedQuizData)

    } catch (err) {
      console.error('Quiz generation error:', err)
      toast.error(err.message || 'Failed to generate and host quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleManualCreate = async (quizData) => {
    try {
      setLoading(true)
      await handleCreateAndHost(quizData)
    } catch (error) {
      console.error('Manual quiz creation error:', error)
      toast.error(error.message || 'Failed to create quiz')
    } finally {
      setLoading(false)
    }
  }

  // Handle file upload (PDF or Audio)
  const handleFileUpload = async (file, type) => {
    if (!file) return

    setLoading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      // Use 'audio' for audio uploads (matches new backend route), 'file' for PDF
      if (type === 'pdf') {
        formData.append('file', file)
      } else {
        formData.append('audio', file)
      }

      formData.append('numberOfQuestions', '10')
      formData.append('difficulty', 'medium')
      formData.append('category', 'General')

      const endpoint = type === 'pdf' ? '/api/quiz/generate-from-pdf' : '/api/quiz-generation/from-audio'

      toast.loading(`Processing ${type === 'pdf' ? 'PDF' : 'audio'}...`, { id: 'upload' })

      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(progress)
        }
      })

      toast.dismiss('upload')

      if (response.data.success) {
        // Handle different response structures
        // PDF route returns { quiz: { questions: [...] } }
        // Audio route returns { quiz: [...] } (array of questions)
        const rawQuiz = response.data.quiz
        const questionsArray = Array.isArray(rawQuiz) ? rawQuiz : (rawQuiz.questions || [])

        // Wrap in standard format if it's just an array
        const generatedQuiz = Array.isArray(rawQuiz)
          ? { title: 'Audio Quiz', questions: rawQuiz, category: 'General', difficulty: 'medium' }
          : rawQuiz


        // Temporary logging to see actual structure
        console.log('🔍 Quiz structure:', {
          hasQuiz: !!generatedQuiz,
          hasQuestions: !!generatedQuiz?.questions,
          quizKeys: generatedQuiz ? Object.keys(generatedQuiz) : [],
          quiz: generatedQuiz
        })

        if (!generatedQuiz || !generatedQuiz.questions) {
          console.error('❌ Invalid structure. Expected quiz.questions, got:', generatedQuiz)
          throw new Error('Invalid quiz structure received from server')
        }

        toast.success(`Generated ${generatedQuiz.questions.length} questions!`)

        // Format questions for handleCreateAndHost
        const quizData = {
          title: generatedQuiz.title,
          description: `Generated from ${type === 'pdf' ? 'PDF' : 'audio'}: ${file.name}`,
          category: generatedQuiz.category || 'General',
          difficulty: generatedQuiz.difficulty || 'medium',
          questions: generatedQuiz.questions.map((q, qIndex) => {
            // Python service returns 'answer' (text), find its index in options
            const correctAnswerText = q.answer || q.correctAnswer
            const correctIndex = q.options.findIndex(opt =>
              opt.toLowerCase().trim() === (correctAnswerText || '').toLowerCase().trim()
            )
            const finalIndex = correctIndex >= 0 ? correctIndex : 0

            return {
              question: q.question,
              type: 'multiple-choice',
              options: q.options.map((opt, idx) => ({
                text: opt,
                isCorrect: idx === finalIndex
              })),
              correctAnswer: q.options[finalIndex],
              explanation: q.explanation || `The correct answer is: ${q.options[finalIndex]}`,
              timeLimit: 30,
              points: 100
            }
          })
        }

        await handleCreateAndHost(quizData)
      } else {
        throw new Error(response.data.error || 'Failed to generate quiz')
      }
    } catch (error) {
      console.error('File upload error:', error)
      console.error('Backend error response:', JSON.stringify(error.response?.data, null, 2))
      toast.error(error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to process file')
    } finally {
      setLoading(false)
      setUploadProgress(0)
      setSelectedFile(null)
    }
  }

  // Start recording from microphone
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        setRecordedAudio({ blob: audioBlob, url: audioUrl })

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

      toast.success('Recording started!')
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast.error('Could not access microphone. Please check permissions.')
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }

      toast.success('Recording stopped!')
    }
  }

  // Upload recorded audio
  const uploadRecordedAudio = async () => {
    if (!recordedAudio) return

    // Convert blob to File
    const file = new File([recordedAudio.blob], `recording_${Date.now()}.webm`, {
      type: 'audio/webm'
    })

    await handleFileUpload(file, 'audio')

    // Clear recorded audio
    setRecordedAudio(null)
    setRecordingTime(0)
  }

  // Format recording time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
            className={`flex flex-col items-center justify-center w-48 h-32 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 ${activeTab === 'ai'
              ? 'bg-white border-2 border-primary-300 shadow-lg'
              : 'bg-gray-50 hover:bg-gray-100 shadow'
              }`}
            onClick={() => setActiveTab('ai')}
            disabled={loading}
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
            className={`flex flex-col items-center justify-center w-48 h-32 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 ${activeTab === 'manual'
              ? 'bg-white border-2 border-primary-300 shadow-lg'
              : 'bg-gray-50 hover:bg-gray-100 shadow'
              }`}
            onClick={() => setActiveTab('manual')}
            disabled={loading}
          >
            <div className={`p-3 rounded-full mb-3 ${activeTab === 'manual' ? 'bg-primary-100' : 'bg-gray-200'}`}>
              <FileText size={24} className={activeTab === 'manual' ? 'text-primary-600' : 'text-gray-600'} />
            </div>
            <span className={`font-semibold ${activeTab === 'manual' ? 'text-primary-700' : 'text-gray-700'}`}>
              Manual Creator
            </span>
            <span className="text-sm text-gray-500 mt-1">Create manually</span>
          </button>

          {/* PDF Upload Tab */}
          <button
            className={`flex flex-col items-center justify-center w-48 h-32 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 ${activeTab === 'pdf'
              ? 'bg-white border-2 border-primary-300 shadow-lg'
              : 'bg-gray-50 hover:bg-gray-100 shadow'
              }`}
            onClick={() => setActiveTab('pdf')}
            disabled={loading}
          >
            <div className={`p-3 rounded-full mb-3 ${activeTab === 'pdf' ? 'bg-primary-100' : 'bg-gray-200'}`}>
              <Upload size={24} className={activeTab === 'pdf' ? 'text-primary-600' : 'text-gray-600'} />
            </div>
            <span className={`font-semibold ${activeTab === 'pdf' ? 'text-primary-700' : 'text-gray-700'}`}>
              PDF Upload
            </span>
            <span className="text-sm text-gray-500 mt-1">From documents</span>
          </button>

          {/* Audio Upload Tab */}
          <button
            className={`flex flex-col items-center justify-center w-48 h-32 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 ${activeTab === 'audio'
              ? 'bg-white border-2 border-primary-300 shadow-lg'
              : 'bg-gray-50 hover:bg-gray-100 shadow'
              }`}
            onClick={() => setActiveTab('audio')}
            disabled={loading}
          >
            <div className={`p-3 rounded-full mb-3 ${activeTab === 'audio' ? 'bg-primary-100' : 'bg-gray-200'}`}>
              <Zap size={24} className={activeTab === 'audio' ? 'text-primary-600' : 'text-gray-600'} />
            </div>
            <span className={`font-semibold ${activeTab === 'audio' ? 'text-primary-700' : 'text-gray-700'}`}>
              Audio Upload
            </span>
            <span className="text-sm text-gray-500 mt-1">From lectures</span>
          </button>

          {/* Demo Button */}
          <button
            className="flex flex-col items-center justify-center w-48 h-32 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 shadow transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => handleCreateAndHost({
              title: "Demo Quiz: Capital Cities",
              description: "A quick test quiz about capital cities.",
              questions: [
                {
                  text: "What is the capital of France?",
                  type: "multiple-choice",
                  options: [
                    { text: "London", isCorrect: false },
                    { text: "Paris", isCorrect: true },
                    { text: "Berlin", isCorrect: false },
                    { text: "Madrid", isCorrect: false }
                  ],
                  correctAnswer: "Paris",
                  timeLimit: 30,
                  points: 100
                },
                {
                  text: "What is the capital of Japan?",
                  type: "multiple-choice",
                  options: [
                    { text: "Seoul", isCorrect: false },
                    { text: "Beijing", isCorrect: false },
                    { text: "Tokyo", isCorrect: true },
                    { text: "Bangkok", isCorrect: false }
                  ],
                  correctAnswer: "Tokyo",
                  timeLimit: 30,
                  points: 100
                }
              ],
              settings: {
                randomizeQuestions: false,
                showLeaderboard: true
              }
            })}
            disabled={loading}
          >
            <div className="p-3 rounded-full mb-3 bg-amber-100">
              <Zap size={24} className="text-amber-600" />
            </div>
            <span className="font-semibold text-amber-800">
              Quick Demo
            </span>
            <span className="text-sm text-amber-600 mt-1">Instant Test</span>
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

          {/* PDF Upload Tab */}
          {activeTab === 'pdf' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Upload className="text-primary-600" />
                    PDF Quiz Generator
                  </h2>
                  <p className="text-gray-600">
                    Upload a PDF document and AI will generate quiz questions from it.
                  </p>
                </div>
                {loading && (
                  <div className="flex items-center gap-2 text-primary-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                    <span>Processing PDF...</span>
                  </div>
                )}
              </div>

              {/* File Upload Area */}
              <div className="bg-white rounded-2xl p-8 border-2 border-dashed border-gray-300 hover:border-primary-400 transition-colors">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="mb-4">
                    <label htmlFor="pdf-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Drop your PDF here or click to browse
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        PDF files up to 10MB
                      </span>
                    </label>
                    <input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) {
                          setSelectedFile(file)
                          handleFileUpload(file, 'pdf')
                        }
                      }}
                      disabled={loading}
                    />
                  </div>

                  {selectedFile && (
                    <div className="mt-4 text-sm text-gray-600">
                      Selected: {selectedFile.name}
                    </div>
                  )}

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{uploadProgress}% uploaded</p>
                    </div>
                  )}

                  <button
                    onClick={() => document.getElementById('pdf-upload').click()}
                    disabled={loading}
                    className="mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Processing...' : 'Choose PDF File'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Audio Upload Tab */}
          {activeTab === 'audio' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Zap className="text-primary-600" />
                    Audio Quiz Generator
                  </h2>
                  <p className="text-gray-600">
                    Upload an audio lecture and AI will transcribe and generate quiz questions.
                  </p>
                </div>
                {loading && (
                  <div className="flex items-center gap-2 text-primary-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                    <span>Processing audio...</span>
                  </div>
                )}
              </div>

              {/* File Upload Area */}
              <div className="space-y-6">
                {/* Microphone Recording Section */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border-2 border-purple-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Mic className="h-8 w-8 text-purple-600" />
                      <h3 className="text-xl font-bold text-gray-900">Record Audio</h3>
                    </div>
                    <p className="text-gray-600 mb-6">Record your lecture or explanation directly</p>

                    {!isRecording && !recordedAudio && (
                      <button
                        onClick={startRecording}
                        disabled={loading}
                        className="px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
                      >
                        <Mic size={20} />
                        Start Recording
                      </button>
                    )}

                    {isRecording && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-2xl font-mono font-bold text-red-600">
                            {formatTime(recordingTime)}
                          </span>
                        </div>
                        <button
                          onClick={stopRecording}
                          className="px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
                        >
                          <Square size={20} />
                          Stop Recording
                        </button>
                      </div>
                    )}

                    {recordedAudio && !isRecording && (
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 border border-purple-200">
                          <div className="flex items-center justify-center gap-2 mb-3">
                            <Play size={16} className="text-purple-600" />
                            <span className="text-sm font-medium text-gray-700">
                              Recording ready ({formatTime(recordingTime)})
                            </span>
                          </div>
                          <audio
                            src={recordedAudio.url}
                            controls
                            className="w-full"
                          />
                        </div>
                        <div className="flex gap-3 justify-center">
                          <button
                            onClick={() => {
                              setRecordedAudio(null)
                              setRecordingTime(0)
                            }}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Discard
                          </button>
                          <button
                            onClick={uploadRecordedAudio}
                            disabled={loading}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                          >
                            <Upload size={16} />
                            {loading ? 'Processing...' : 'Generate Quiz'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gray-50 text-gray-500">OR</span>
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="bg-white rounded-2xl p-8 border-2 border-dashed border-gray-300 hover:border-primary-400 transition-colors">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <div className="mb-4">
                      <label htmlFor="audio-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload an audio file
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                          MP3, WAV, M4A files up to 25MB
                        </span>
                      </label>
                      <input
                        id="audio-upload"
                        type="file"
                        accept="audio/*,.mp3,.wav,.m4a,.mp4"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0]
                          if (file) {
                            setSelectedFile(file)
                            handleFileUpload(file, 'audio')
                          }
                        }}
                        disabled={loading}
                      />
                    </div>

                    {selectedFile && (
                      <div className="mt-4 text-sm text-gray-600">
                        Selected: {selectedFile.name}
                      </div>
                    )}

                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{uploadProgress}% uploaded</p>
                      </div>
                    )}

                    <button
                      onClick={() => document.getElementById('audio-upload').click()}
                      disabled={loading}
                      className="mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Processing...' : 'Choose Audio File'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        {loading && (
          <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <Rocket size={20} />
              Setting up your quiz...
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <span className="text-xs">1</span>
                </div>
                <span className="font-medium">Creating quiz content...</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center">
                  <span className="text-xs">2</span>
                </div>
                <span className="font-medium text-blue-700">Setting up live room...</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <span className="text-xs">3</span>
                </div>
                <span className="text-gray-600">Ready to host!</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Tips */}
        {!loading && (
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
        )}

      </div>
    </div>
  )
}

export default CreateQuiz