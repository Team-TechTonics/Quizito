// src/components/quiz/QuizCreator.jsx
import React, { useState } from 'react'
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Clock,
  Award,
  BarChart3,
  Hash,
  Type,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  GripVertical
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const QuizCreator = ({ onCreate, loading, initialData }) => {
  const [quizData, setQuizData] = useState(initialData || {
    title: '',
    description: '',
    category: '',
    difficulty: 'medium',
    questions: []
  })

  // Update state if initialData changes (e.g. re-selecting template)
  React.useEffect(() => {
    if (initialData) {
      setQuizData(prev => ({
        ...prev,
        ...initialData,
        // Ensure questions array exists if not provided
        questions: initialData.questions || []
      }));
    }
  }, [initialData]);

  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null)
  // Default new question state
  const defaultQuestionState = {
    question: '',
    type: 'multiple-choice',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    correctAnswer: '',
    points: 100,
    timeLimit: 30,
    difficulty: 'medium',
    explanation: ''
  };

  const [currentQuestion, setCurrentQuestion] = useState(defaultQuestionState)
  const [showQuestionForm, setShowQuestionForm] = useState(true)

  const categories = [
    'General Knowledge', 'Science', 'Technology', 'History', 'Geography',
    'Sports', 'Entertainment', 'Mathematics', 'Literature', 'Art', 'Music', 'Other'
  ]

  const difficulties = [
    { id: 'easy', label: 'Easy', color: 'bg-green-100 text-green-700 border-green-200' },
    { id: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { id: 'hard', label: 'Hard', color: 'bg-red-100 text-red-700 border-red-200' }
  ]

  const questionTypes = [
    { id: 'multiple-choice', label: 'Multiple Choice', icon: '📝', desc: 'Select one correct answer' },
    { id: 'true-false', label: 'True/False', icon: '🔘', desc: 'Binary choice' },
    { id: 'short-answer', label: 'Short Answer', icon: '✏️', desc: 'Type the exact answer' }
  ]

  const handleQuizInfoChange = (field, value) => {
    setQuizData(prev => ({ ...prev, [field]: value }))
  }

  const handleQuestionChange = (field, value) => {
    setCurrentQuestion(prev => ({ ...prev, [field]: value }))
  }

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...currentQuestion.options]
    updatedOptions[index] = { ...updatedOptions[index], [field]: value }
    setCurrentQuestion(prev => ({ ...prev, options: updatedOptions }))
  }

  const setCorrectAnswer = (index) => {
    const updatedOptions = currentQuestion.options.map((option, i) => ({
      ...option,
      isCorrect: i === index
    }))

    setCurrentQuestion(prev => ({
      ...prev,
      options: updatedOptions,
      correctAnswer: currentQuestion.options[index]?.text || ''
    }))
  }

  const addOption = () => {
    if (currentQuestion.options.length >= 6) {
      toast.error("Maximum 6 options allowed");
      return;
    }
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...prev.options, { text: '', isCorrect: false }]
    }))
  }

  const removeOption = (index) => {
    if (currentQuestion.options.length <= 2) {
      toast.error("Minimum 2 options required");
      return;
    }
    const updatedOptions = currentQuestion.options.filter((_, i) => i !== index)
    setCurrentQuestion(prev => ({ ...prev, options: updatedOptions }))
  }

  const validateQuestion = () => {
    if (!currentQuestion.question.trim()) {
      toast.error('Please enter a question text');
      return false;
    }
    if (currentQuestion.type === 'multiple-choice') {
      if (currentQuestion.options.some(opt => !opt.text.trim())) {
        toast.error('All options must have text');
        return false;
      }
      if (!currentQuestion.options.some(opt => opt.isCorrect)) {
        toast.error('Please mark one option as correct');
        return false;
      }
    }
    return true;
  }

  const addQuestion = () => {
    if (!validateQuestion()) return;

    const questionToAdd = { ...currentQuestion }

    // For true/false questions, ensure options are set correctly
    if (questionToAdd.type === 'true-false') {
      // Logic handled in UI, but ensure consistency here if needed
    }

    if (editingQuestionIndex !== null) {
      // Edit existing question
      const updatedQuestions = [...quizData.questions]
      updatedQuestions[editingQuestionIndex] = questionToAdd
      setQuizData(prev => ({ ...prev, questions: updatedQuestions }))
      setEditingQuestionIndex(null)
      toast.success("Question updated!");
    } else {
      // Add new question
      setQuizData(prev => ({
        ...prev,
        questions: [...prev.questions, questionToAdd]
      }))
      toast.success("Question added!");
    }

    // Reset form but keep some settings like time limit/points for convenience
    setCurrentQuestion({
      ...defaultQuestionState,
      timeLimit: currentQuestion.timeLimit,
      points: currentQuestion.points,
      difficulty: currentQuestion.difficulty
    })

    // Scroll to top of form or keep form open
    setShowQuestionForm(true);
  }

  const editQuestion = (index) => {
    const question = quizData.questions[index]
    setCurrentQuestion({ ...question })
    setEditingQuestionIndex(index)
    setShowQuestionForm(true)
    // Scroll logic could be added here
    document.getElementById('question-editor')?.scrollIntoView({ behavior: 'smooth' });
  }

  const deleteQuestion = (index) => {
    if (!window.confirm("Delete this question?")) return;
    const updatedQuestions = quizData.questions.filter((_, i) => i !== index)
    setQuizData(prev => ({ ...prev, questions: updatedQuestions }))
    toast.success("Question deleted");
  }

  const handleSubmit = () => {
    if (!quizData.title.trim()) {
      toast.error('Please enter a quiz title');
      document.getElementById('quiz-title')?.focus();
      return
    }

    if (quizData.questions.length === 0) {
      toast.error('Please add at least one question');
      return
    }

    onCreate(quizData)
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">

      {/* Quiz Information Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Type size={24} className="text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Quiz Details</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Quiz Title <span className="text-red-500">*</span>
            </label>
            <input
              id="quiz-title"
              type="text"
              value={quizData.title}
              onChange={(e) => handleQuizInfoChange('title', e.target.value)}
              placeholder="e.g. Advanced Mathematics Final"
              className="w-full px-4 py-3 text-lg font-medium border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:font-normal"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={quizData.description}
              onChange={(e) => handleQuizInfoChange('description', e.target.value)}
              placeholder="What is this quiz about?"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all min-h-[100px] resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Category
            </label>
            <select
              value={quizData.category}
              onChange={(e) => handleQuizInfoChange('category', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
            >
              <option value="">Select a category...</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Overall Difficulty
            </label>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {difficulties.map((diff) => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => handleQuizInfoChange('difficulty', diff.id)}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${quizData.difficulty === diff.id
                    ? 'bg-white text-gray-800 shadow-sm scale-100'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Added Questions List */}
      <AnimatePresence>
        {quizData.questions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                <Hash className="text-purple-500" size={20} />
                Questions Added ({quizData.questions.length})
              </h3>
              <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Total Points: {quizData.questions.reduce((sum, q) => sum + (q.points || 0), 0)}
              </div>
            </div>

            <div className="grid gap-4">
              {quizData.questions.map((question, index) => (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white p-5 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all group ${editingQuestionIndex === index ? 'border-purple-500 ring-2 ring-purple-100' : 'border-gray-300'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-gray-400">#{index + 1}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded uppercase tracking-wide">
                          {question.type.replace('-', ' ')}
                        </span>
                        {question.timeLimit && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={10} /> {question.timeLimit}s
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-800 line-clamp-2">{question.question}</h4>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => editQuestion(index)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteQuestion(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Form */}
      <AnimatePresence>
        {showQuestionForm && (
          <motion.div
            layout
            id="question-editor"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-8 py-4 border-b border-purple-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                {editingQuestionIndex !== null ? <Edit2 size={18} /> : <Plus size={18} />}
                {editingQuestionIndex !== null ? 'Edit Question' : 'Add New Question'}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingQuestionIndex(null);
                    setCurrentQuestion(defaultQuestionState);
                  }}
                  className="text-xs font-semibold text-purple-700 hover:text-purple-900 cursor-pointer"
                >
                  Clear Form
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8">

              {/* Question Text */}
              <div>
                <textarea
                  value={currentQuestion.question}
                  onChange={(e) => handleQuestionChange('question', e.target.value)}
                  placeholder="Type your question here..."
                  className="w-full px-5 py-4 text-lg border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all min-h-[140px] resize-y placeholder:text-gray-300"
                />
              </div>

              {/* Type Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {questionTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleQuestionChange('type', type.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${currentQuestion.type === type.id
                      ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500'
                      : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="font-bold text-gray-800 text-sm">{type.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{type.desc}</div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                {/* Points */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Points</label>
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={currentQuestion.points}
                      onChange={(e) => handleQuestionChange('points', parseInt(e.target.value) || 0)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>

                {/* Time Limit */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Time (Sec)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <select
                      value={currentQuestion.timeLimit}
                      onChange={(e) => handleQuestionChange('timeLimit', parseInt(e.target.value))}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white appearance-none"
                    >
                      {[10, 20, 30, 45, 60, 90, 120].map(t => (
                        <option key={t} value={t}>{t} seconds</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Difficulty */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Difficulty</label>
                  <div className="relative">
                    <TrendingUp className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" size={16} />
                    <select
                      value={currentQuestion.difficulty}
                      onChange={(e) => handleQuestionChange('difficulty', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white appearance-none"
                    >
                      {difficulties.map(d => (
                        <option key={d.id} value={d.id}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Answer Inputs */}
              <div className="space-y-4">
                {currentQuestion.type === 'multiple-choice' && (
                  <>
                    <h4 className="font-bold text-gray-700 mb-2">Answer Options</h4>
                    <div className="grid gap-3">
                      {currentQuestion.options.map((option, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white cursor-pointer transition-colors shadow-sm ${option.isCorrect ? 'bg-green-500 ring-2 ring-green-200' : 'bg-gray-300 hover:bg-gray-400'}`}
                            onClick={() => setCorrectAnswer(idx)}
                            title="Click to mark as correct"
                          >
                            {option.isCorrect ? <CheckCircle2 size={16} /> : String.fromCharCode(65 + idx)}
                          </div>
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => handleOptionChange(idx, 'text', e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                            className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${option.isCorrect
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 focus:border-purple-500'
                              }`}
                          />
                          <button
                            onClick={() => removeOption(idx)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={addOption}
                      className="mt-2 text-sm font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      <Plus size={16} /> Add Option
                    </button>
                  </>
                )}

                {currentQuestion.type === 'true-false' && (
                  <div className="grid grid-cols-2 gap-4">
                    {['True', 'False'].map(val => (
                      <button
                        key={val}
                        onClick={() => {
                          setCurrentQuestion(prev => ({
                            ...prev,
                            correctAnswer: val,
                            options: [
                              { text: 'True', isCorrect: val === 'True' },
                              { text: 'False', isCorrect: val === 'False' },
                            ]
                          }))
                        }}
                        className={`p-6 rounded-xl border-2 font-bold text-xl transition-all ${currentQuestion.correctAnswer === val
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'short-answer' && (
                  <div>
                    <h4 className="font-bold text-gray-700 mb-2">Correct Answer (Exact Match)</h4>
                    <input
                      type="text"
                      value={currentQuestion.correctAnswer}
                      onChange={(e) => handleQuestionChange('correctAnswer', e.target.value)}
                      placeholder="Type the correct answer..."
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none font-bold text-gray-800"
                    />
                  </div>
                )}
              </div>

              {/* Explanation Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <HelpCircle size={16} className="text-blue-500" />
                  Explanation (Shown after answering)
                </label>
                <textarea
                  value={currentQuestion.explanation || ''}
                  onChange={(e) => handleQuestionChange('explanation', e.target.value)}
                  placeholder="Explain why the answer is correct..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[80px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button
                  onClick={addQuestion}
                  className="flex-1 bg-purple-600 text-white py-4 rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
                >
                  {editingQuestionIndex !== null ? <Save size={20} /> : <Plus size={20} />}
                  {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
                </button>
                {editingQuestionIndex !== null && (
                  <button
                    onClick={() => {
                      setEditingQuestionIndex(null);
                      setCurrentQuestion(defaultQuestionState);
                    }}
                    className="px-6 py-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showQuestionForm && (
        <button
          onClick={() => setShowQuestionForm(true)}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-purple-500 hover:text-purple-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={24} /> Add Another Question
        </button>
      )}

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Total Questions</div>
            <div className="font-bold text-xl text-gray-800">{quizData.questions.length}</div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || quizData.questions.length === 0}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
          >
            {loading ? 'Creating Quiz...' : 'Create & Host Quiz 🚀'}
          </button>
        </div>
      </div>
      <div className="h-24"></div> {/* Spacer for fixed bottom bar */}

    </div>
  )
}

// Importing TrendingUp separately to avoid icon conflicts if needed, though Lucide exports it
import { TrendingUp } from 'lucide-react'

export default QuizCreator