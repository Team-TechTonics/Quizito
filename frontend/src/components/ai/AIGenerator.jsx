// src/components/ai/AIGenerator.jsx
import React, { useState } from 'react'
import { Sparkles, Hash, TrendingUp, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { quizService } from '../../services'

const AIGenerator = ({ onGenerate, loading, setLoading }) => {
  const [topic, setTopic] = useState('')
  const [numQuestions, setNumQuestions] = useState(10)
  const [difficulty, setDifficulty] = useState('medium')
  const [useFallback, setUseFallback] = useState(false)

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

  // Generate fallback questions locally
  const generateFallbackQuestions = () => {
    const questions = [];
    for (let i = 1; i <= numQuestions; i++) {
      const options = [
        { text: `Correct Answer for Q${i}`, isCorrect: true },
        { text: `Wrong Option 1`, isCorrect: false },
        { text: `Wrong Option 2`, isCorrect: false },
        { text: `Wrong Option 3`, isCorrect: false },
      ];

      // Shuffle options simply
      options.sort(() => Math.random() - 0.5);

      const correctOption = options.find(o => o.isCorrect);

      questions.push({
        question: `Sample Question ${i}: What is a key fact about ${topic}?`,
        type: 'multiple-choice',
        options: options,
        correctAnswer: correctOption.text,
        explanation: `This is the explanation for question ${i} regarding ${topic}.`,
        difficulty: difficulty,
        points: 100,
        timeLimit: 30,
        tags: [topic.toLowerCase().replace(/\s+/g, '-'), 'fallback'],
      });
    }

    return {
      title: `Quiz: ${topic}`,
      description: `Auto-generated fallback quiz about ${topic}`,
      category: topic,
      difficulty: difficulty,
      questions: questions,
      aiGenerated: false,
      fallback: true,
    };
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!topic.trim()) {
      toast.error('Please enter a topic')
      return
    }

    setLoading(true)

    try {
      console.log('Generating quiz for topic:', topic)
      let quizData;

      if (useFallback) {
        toast.loading('Generating fallback questions...', { id: 'ai-generate' });
        // Simulate delay for realism
        await new Promise(resolve => setTimeout(resolve, 800));
        quizData = generateFallbackQuestions();
        toast.success('Fallback questions generated!', { id: 'ai-generate' });
      } else {
        // Use real AI service
        try {
          quizData = await quizService.generateAIQuiz(topic, {
            numQuestions,
            difficulty,
            category: topic,
            includeExplanations: true
          });
          toast.success('AI quiz generated successfully!');
        } catch (aiError) {
          console.warn('AI service failed, asking for fallback:', aiError);
          const errorMessage = aiError.message || 'AI service unavailable';

          // Check for specific error types if needed
          if (window.confirm(`AI Error: ${errorMessage}\n\nWould you like to generate a fallback quiz instead?`)) {
            setUseFallback(true);
            quizData = generateFallbackQuestions();
          } else {
            throw new Error('AI generation cancelled');
          }
        }
      }

      if (onGenerate && quizData) {
        onGenerate(
          topic,
          numQuestions,
          difficulty,
          {
            quiz: quizData,
            model: quizData.aiModel || 'fallback',
            fallback: !!quizData.fallback
          }
        )
      }

    } catch (error) {
      console.error('Quiz Generation Error:', error)
      if (error.message !== 'AI generation cancelled') {
        toast.error(error.message || 'Failed to generate quiz');
      }
    } finally {
      setLoading(false)
    }
  }

  const handleQuickGenerate = (sampleTopic) => {
    setTopic(sampleTopic);
    // Don't auto-submit, let user review settings
    // Or we could auto-submit if desired, but user might want to change difficulty
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
          <p className="text-sm text-gray-600 mb-2">Quick suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {sampleTopics.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => handleQuickGenerate(sample)}
                disabled={loading}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
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
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
            <div className="text-2xl font-bold text-primary-600 min-w-[60px]">
              {numQuestions}
            </div>
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
                className={`flex-1 py-3 rounded-lg font-medium transition-all disabled:opacity-50 ${difficulty === diff.id
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
      <div className="pt-8 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading || !topic.trim()}
          className={`w-full text-lg py-4 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${useFallback
            ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white'
            : 'bg-gradient-to-r from-primary-600 to-accent-600 text-white'
            }`}
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
                <span>
                  {useFallback ? 'Generate Fallback Quiz' : 'Generate Quiz with AI'}
                </span>
                <Zap className="group-hover:scale-110 transition-transform" />
              </>
            )}
          </div>
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          {useFallback
            ? `Will generate ${numQuestions} ${difficulty} sample questions about "${topic}"`
            : `AI will generate ${numQuestions} ${difficulty} questions about "${topic}"`
          }
        </p>
      </div>

    </form>
  )
}

export default AIGenerator