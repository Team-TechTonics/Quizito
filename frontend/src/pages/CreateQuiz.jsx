// src/pages/CreateQuiz.jsx
import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AIGenerator from '../components/ai/AIGenerator'
import QuizCreator from '../components/quiz/QuizCreator'
import { Brain, FileText, Upload, Sparkles, Users, Rocket, Copy, Zap, Mic, Square, Layout, BookOpen, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { quizService } from '../services'
import { motion } from 'framer-motion';

// Pre-defined Templates
const QUIZ_TEMPLATES = [
  {
    id: 'pop-quiz',
    title: 'Pop Quiz',
    description: 'Quick check-in with random questions.',
    icon: Zap,
    color: 'text-yellow-500 bg-yellow-50',
    settings: {
      timeLimit: 300, // 5 min
      questionTime: 30,
      randomizeQuestions: true,
      randomizeOptions: true,
      difficulty: 'medium',
      numQuestions: 5
    }
  },
  {
    id: 'final-exam',
    title: 'Final Exam',
    description: 'Comprehensive assessment mode.',
    icon: FileText,
    color: 'text-red-500 bg-red-50',
    settings: {
      timeLimit: 3600, // 60 min
      questionTime: 0, // No per question limit
      randomizeQuestions: true,
      showResults: false,
      difficulty: 'hard',
      numQuestions: 50
    }
  },
  {
    id: 'vocab-check',
    title: 'Vocabulary Check',
    description: 'Fast-paced definition matching.',
    icon: Brain,
    color: 'text-purple-500 bg-purple-50',
    settings: {
      timeLimit: 600,
      questionTime: 15, // Fast
      randomizeQuestions: true,
      difficulty: 'easy',
      numQuestions: 20
    }
  }
];

const CreateQuiz = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('templates') // Start with templates/AI choice
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)

  // Template State
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Audio recording state
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
      const quiz = await quizService.createQuiz(quizData);
      console.log("Quiz created successfully:", quiz._id || quiz.id);

      // STEP 2: Create a session for this quiz
      const sessionData = {
        quizId: quiz._id || quiz.id,
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
      };

      console.log("Creating session for quiz:", quiz._id || quiz.id);
      const session = await quizService.createSession(sessionData);

      const roomCode = session.roomCode
      console.log("Session created successfully. Room code:", roomCode);

      // Create join links
      const FRONTEND_URL = window.location.origin;
      const joinLinks = {
        playerLink: `${FRONTEND_URL}/join/${roomCode}`,
        hostDashboard: `${FRONTEND_URL}/host/${roomCode}`,
        embedCode: `<iframe src="${FRONTEND_URL}/embed/${roomCode}" width="800" height="600"></iframe>`,
      }

      // Store session info
      localStorage.setItem('currentHostSession', JSON.stringify({
        roomCode,
        sessionId: session._id || session.id,
        quizId: quiz._id || quiz.id,
        quizTitle: quiz.title,
        joinLinks
      }))

      // Show success message
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
          </div>
        </div>,
        { duration: 6000 }
      )

      // Redirect to host dashboard
      setTimeout(() => {
        navigate(`/host/${roomCode}`)
      }, 1000)

      return true

    } catch (error) {
      console.error('Failed to create and host:', error)
      const errorMessage = error.message || error.error || 'Failed to create quiz and room';
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
        // Use provided quiz data (from AIGenerator fallback or success)
        quizData = options.quiz;
      } else {
        // Direct call (less likely with new component, but supported)
        quizData = await quizService.generateAIQuiz(topic, {
          numQuestions,
          difficulty,
          category: topic
        });
      }

      // Format quiz data
      const enhancedQuizData = {
        title: quizData.title || `Quiz: ${topic}`,
        description: quizData.description || `Quiz about ${topic}`,
        category: quizData.category || 'General Knowledge',
        difficulty: difficulty || 'medium',
        questions: (quizData.questions || []).map(q => {
          // Identify correct index/answer for normalization
          let correctIndex = -1;
          const options = q.options || [];

          if (q.correctIndex !== undefined) {
            correctIndex = q.correctIndex;
          } else if (typeof q.correctAnswer === 'number') {
            correctIndex = q.correctAnswer;
          } else if (q.correctAnswer) {
            // Try to find string match
            correctIndex = options.findIndex(opt =>
              String(typeof opt === 'string' ? opt : opt.text).toLowerCase().trim() ===
              String(q.correctAnswer).toLowerCase().trim()
            );
          }

          // Default to 0 if not found
          const validCorrectIndex = correctIndex >= 0 ? correctIndex : 0;

          // Normalize options to objects
          const standardizedOptions = options.map((opt, idx) => ({
            text: typeof opt === 'string' ? opt : (opt.text || ""),
            isCorrect: idx === validCorrectIndex
          }));

          return {
            ...q,
            options: standardizedOptions,
            correctAnswer: standardizedOptions[validCorrectIndex]?.text
          };
        }),
        aiGenerated: !!quizData.aiGenerated,
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

      await handleCreateAndHost(enhancedQuizData)

    } catch (err) {
      console.error('Quiz generation error:', err)
      toast.error(err.message || 'Failed to generate quiz')
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
      if (type === 'pdf') {
        formData.append('file', file)
      } else {
        formData.append('file', file)
      }
      // Basic params for file generation
      formData.append('numberOfQuestions', '10')
      formData.append('difficulty', 'medium')
      formData.append('category', 'General')

      toast.loading(`Processing ${type === 'pdf' ? 'PDF' : 'audio'}...`, { id: 'upload' })

      // Call service based on type
      let generatedQuiz;
      const onProgress = (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        setUploadProgress(progress)
      };

      if (type === 'pdf') {
        const response = await quizService.generateFromPDF(formData, onProgress);
        generatedQuiz = response.quiz || response; // Handle different potential return shapes
      } else {
        const response = await quizService.generateFromAudio(formData, onProgress);
        generatedQuiz = response.quiz || response;
      }

      toast.dismiss('upload')

      // Normalize questions
      const questionsArray = Array.isArray(generatedQuiz) ? generatedQuiz : (generatedQuiz.questions || [])
      const finalQuizStruct = Array.isArray(generatedQuiz)
        ? { title: `${type === 'pdf' ? 'PDF' : 'Audio'} Quiz`, questions: generatedQuiz, category: 'General' }
        : generatedQuiz

      if (!finalQuizStruct.questions || finalQuizStruct.questions.length === 0) {
        throw new Error('No questions were generated. Please try a different file.');
      }

      toast.success(`Generated ${finalQuizStruct.questions.length} questions!`)

      // Format for generic creator
      const quizData = {
        title: finalQuizStruct.title || `Content Quiz`,
        description: `Generated from ${type === 'pdf' ? 'PDF' : 'audio'}: ${file.name}`,
        category: finalQuizStruct.category || 'General',
        difficulty: finalQuizStruct.difficulty || 'medium',
        questions: finalQuizStruct.questions.map((q) => {
          // Normalize question structure
          const options = q.options || [];
          let correctIndex = -1;

          if (q.correctIndex !== undefined) {
            correctIndex = q.correctIndex;
          } else if (typeof q.correctAnswer === 'number') {
            correctIndex = q.correctAnswer;
          } else if (q.correctAnswer) {
            correctIndex = options.findIndex(opt =>
              String(opt).toLowerCase().trim() === String(q.correctAnswer).toLowerCase().trim()
            );
          }

          const finalIndex = correctIndex >= 0 ? correctIndex : 0;

          return {
            question: q.question,
            type: 'multiple-choice',
            options: options.map((opt, idx) => ({
              text: typeof opt === 'string' ? opt : opt.text,
              isCorrect: idx === finalIndex
            })),
            correctAnswer: options[finalIndex],
            explanation: q.explanation || '',
            timeLimit: 30,
            points: 100
          }
        })
      }

      await handleCreateAndHost(quizData)

    } catch (error) {
      console.error('File upload error:', error)
      toast.error(error.message || 'Failed to process file')
    } finally {
      setLoading(false)
      setUploadProgress(0)
      setSelectedFile(null)
      toast.dismiss('upload')
    }
  }

  // Start recording
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
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      toast.success('Recording started!')
    } catch (error) {
      console.error('Microphone error:', error)
      toast.error('Could not access microphone.')
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
      toast.success('Recording stopped!')
    }
  }

  // Upload recording
  const uploadRecordedAudio = async () => {
    if (!recordedAudio) return
    const file = new File([recordedAudio.blob], `recording_${Date.now()}.webm`, { type: 'audio/webm' })
    await handleFileUpload(file, 'audio')
    setRecordedAudio(null)
    setRecordingTime(0)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-6xl">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-indigo-100 px-6 py-2 rounded-full mb-4 shadow-sm border border-purple-200">
            <Sparkles className="text-purple-600" size={18} />
            <span className="text-purple-800 font-semibold text-sm">Create & Host Live Quizzes</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-800 tracking-tight">
            Create Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Masterpiece</span>
          </h1>

        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {[
            { id: 'templates', icon: Layout, label: 'Templates', desc: 'Quick Start' },
            { id: 'ai', icon: Brain, label: 'AI Generator', desc: 'Auto-create' },
            { id: 'manual', icon: FileText, label: 'Manual', desc: 'Start fresh' },
            { id: 'pdf', icon: Upload, label: 'PDF Upload', desc: 'From file' },
            { id: 'audio', icon: Mic, label: 'Audio / Voice', desc: 'From speech' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={loading}
              className={`flex flex-col items-center justify-center p-4 w-32 md:w-40 rounded-2xl transition-all duration-300 ${activeTab === tab.id
                ? 'bg-white shadow-lg border-2 border-purple-500 scale-105'
                : 'bg-white/50 border border-gray-200 hover:bg-white hover:shadow-md'
                }`}
            >
              <tab.icon className={`mb-2 ${activeTab === tab.id ? 'text-purple-600' : 'text-gray-500'}`} size={28} />
              <span className={`font-bold ${activeTab === tab.id ? 'text-gray-800' : 'text-gray-600'}`}>{tab.label}</span>
              <span className="text-xs text-gray-400 mt-1">{tab.desc}</span>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-gray-100 min-h-[500px]">

          {/* Loading Overlay with Educational Tips */}
          {loading && (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-indigo-50 z-50 flex flex-col items-center justify-center rounded-3xl overflow-hidden p-8">

              {/* Floating Icons Background */}
              <div className="absolute inset-0 pointer-events-none">
                {[
                  { icon: "📚", xA: 10, xB: 90, yA: -20, yB: 120, d: 20, rain: false },
                  { icon: "🎓", xA: 80, xB: 20, yA: 120, yB: -20, d: 25, rain: false },
                  { icon: "✨", xA: 30, xB: 70, yA: -10, yB: 110, d: 18, rain: false },
                  { icon: "🧠", xA: 70, xB: 30, yA: 110, yB: -10, d: 22, rain: false },
                  { icon: "💡", xA: 50, xB: 80, yA: -20, yB: 120, d: 15, rain: false },
                  { icon: "🚀", xA: 20, xB: 80, yA: 100, yB: -20, d: 12, rain: false },
                  { icon: "⭐", xA: 85, xB: 15, yA: -10, yB: 90, d: 28, rain: false }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ left: `${item.xA}%`, top: `${item.yA}%`, opacity: 0, scale: 0.5 }}
                    animate={{
                      left: `${item.xB}%`,
                      top: `${item.yB}%`,
                      opacity: [0, 1, 1, 0],
                      scale: [0.5, 1.2, 0.5],
                      rotate: 360
                    }}
                    transition={{
                      duration: item.d,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 2
                    }}
                    className="absolute text-5xl opacity-50"
                  >
                    {item.icon}
                  </motion.div>
                ))}
              </div>

              {/* Foreground Content */}
              <div className="relative z-10 flex flex-col items-center w-full max-w-2xl">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full mb-8"
                />

                <h3 className="text-2xl font-bold text-gray-800 mb-4">Creating Magic...</h3>

                {uploadProgress > 0 && (
                  <div className="w-full max-w-md mb-6">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                      />
                    </div>
                    <p className="text-sm text-gray-600 text-center mt-2">{uploadProgress}% Complete</p>
                  </div>
                )}

                <motion.div
                  key={Math.floor(Date.now() / 4000)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full text-center"
                >
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100 mx-auto">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <Sparkles className="text-white" size={20} />
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-gray-800 mb-2">
                      Did you know?
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      {[
                        "Spaced repetition increases retention by 200%!",
                        "Teaching others is the best way to learn.",
                        "Sleep consolidates memories effectively.",
                        "Active recall is superior to passive rereading.",
                        "Visual imagery boosts memory retention."
                      ][Math.floor(Date.now() / 4000) % 5]}
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {/* Template Gallery */}
          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {QUIZ_TEMPLATES.map((template) => (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template);
                    toast.success(`Selected ${template.title} template!`);
                    setActiveTab('manual');
                  }}
                  className="bg-white p-6 rounded-2xl border border-gray-200 text-left hover:border-indigo-500 hover:shadow-md transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${template.color}`}>
                    <template.icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2">
                    {template.description}
                  </p>
                </motion.button>
              ))}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('manual')}
                className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-300 text-left hover:border-indigo-500 hover:bg-white transition-all group flex flex-col items-center justify-center text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center mb-4 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <Plus size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Blank Quiz</h3>
                <p className="text-sm text-gray-500 mt-2">Start from scratch</p>
              </motion.button>
            </div>
          )}

          {/* AI Generator Tab */}
          {activeTab === 'ai' && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Generate with AI</h2>
                <p className="text-gray-500">Enter a topic and let our AI create the perfect quiz for you.</p>
              </div>
              <AIGenerator
                onGenerate={handleAIGenerate}
                loading={loading}
                setLoading={setLoading}
              />
            </div>
          )}

          {/* Manual Creator Tab */}
          {activeTab === 'manual' && (
            <QuizCreator
              onCreate={handleCreateAndHost}
              loading={loading}
              initialData={selectedTemplate ? {
                title: selectedTemplate.title,
                description: selectedTemplate.description,
                settings: selectedTemplate.settings
              } : null}
            />
          )}

          {/* PDF Upload Tab */}
          {activeTab === 'pdf' && (
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create from PDF</h2>

              <div
                className="border-3 border-dashed border-gray-200 rounded-3xl p-10 hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer group"
                onClick={() => document.getElementById('pdf-input').click()}
              >
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="text-purple-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-700">Click to Upload PDF</h3>
                <p className="text-gray-500 mb-6">Or drag and drop file here</p>
                <button className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold font-medium group-hover:shadow-lg transition-all">
                  Select Document
                </button>
                <input
                  id="pdf-input"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files[0]) handleFileUpload(e.target.files[0], 'pdf');
                  }}
                />
              </div>
              <p className="mt-6 text-sm text-gray-500">Supported formats: PDF (Text-selectable files work best)</p>
            </div>
          )}

          {/* Audio/Voice Tab */}
          {activeTab === 'audio' && (
            <div className="max-w-xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create from Audio</h2>

              <div className="grid grid-cols-1 gap-6">
                {/* Upload Box */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                    <Upload size={20} className="mr-2 text-blue-600" />
                    Upload Audio File
                  </h3>
                  <input
                    type="file"
                    accept="audio/*"
                    className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2.5 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100"
                    onChange={(e) => {
                      if (e.target.files[0]) handleFileUpload(e.target.files[0], 'audio');
                    }}
                  />
                  <p className="text-xs text-gray-400 mt-2">MP3, WAV, M4A supported</p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">OR</span>
                  </div>
                </div>

                {/* Record Box */}
                <div className={`border-2 ${isRecording ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'} rounded-2xl p-8 text-center transition-colors`}>
                  {!recordedAudio ? (
                    <>
                      {isRecording ? (
                        <div className="space-y-4">
                          <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse mx-auto"></div>
                          <div className="text-3xl font-mono font-bold text-gray-800">{formatTime(recordingTime)}</div>
                          <p className="text-red-500 font-medium">Recording in progress...</p>
                          <button
                            onClick={stopRecording}
                            className="px-8 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                          >
                            Stop Recording
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-500">
                            <Mic size={32} />
                          </div>
                          <h3 className="text-xl font-bold text-gray-800">Record Voice Note</h3>
                          <p className="text-gray-500 text-sm">Speak your questions or topic directly</p>
                          <button
                            onClick={startRecording}
                            className="px-8 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                          >
                            Start Recording
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 flex items-center justify-center gap-2">
                        <Zap size={20} />
                        <span className="font-bold">Audio Recorded!</span>
                      </div>
                      <audio src={recordedAudio.url} controls className="w-full" />
                      <div className="flex gap-4 justify-center">
                        <button
                          onClick={() => setRecordedAudio(null)}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                        >
                          Discard
                        </button>
                        <button
                          onClick={uploadRecordedAudio}
                          className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 shadow-md"
                        >
                          Generate Quiz
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateQuiz