// src/components/quiz/QuizPreviewModal.jsx
import { X, Clock, BookOpen, Star, Users, Play, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const QuizPreviewModal = ({ quiz, isOpen, onClose }) => {
    if (!quiz) return null;

    const {
        _id,
        title,
        description,
        category,
        difficulty,
        questions = [],
        duration,
        rating = 4.5,
        ratingCount = 0,
        plays = 0,
        topics = []
    } = quiz;

    const getDifficultyColor = (diff) => {
        switch (diff?.toLowerCase()) {
            case 'easy': return 'text-green-600 bg-green-100';
            case 'medium': return 'text-amber-600 bg-amber-100';
            case 'hard': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    // Sample questions for preview (first 3)
    const sampleQuestions = questions.slice(0, 3);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                            >
                                {/* Header */}
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-6 text-white">
                                    <button
                                        onClick={onClose}
                                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                                    >
                                        <X size={24} />
                                    </button>

                                    <div className="mb-4">
                                        <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-semibold mb-3">
                                            {category || 'General'}
                                        </span>
                                        <h2 className="text-3xl font-bold mb-2">{title}</h2>
                                        {description && (
                                            <p className="text-white/90">{description}</p>
                                        )}
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="flex items-center space-x-6 text-sm">
                                        <div className="flex items-center space-x-2">
                                            <Star size={18} className="fill-yellow-300 text-yellow-300" />
                                            <span>{rating.toFixed(1)} ({ratingCount} reviews)</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Users size={18} />
                                            <span>{plays.toLocaleString()} plays</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Clock size={18} />
                                            <span>{duration || 15} min</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <BookOpen size={18} />
                                            <span>{questions.length} questions</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 overflow-y-auto max-h-[calc(90vh-300px)]">
                                    {/* Quiz Info */}
                                    <div className="grid grid-cols-2 gap-6 mb-8">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Difficulty</h3>
                                            <span className={`inline-block px-4 py-2 rounded-xl font-medium ${getDifficultyColor(difficulty)}`}>
                                                {difficulty || 'Medium'}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Estimated Time</h3>
                                            <p className="text-lg font-bold text-gray-800">{duration || 15} minutes</p>
                                        </div>
                                    </div>

                                    {/* Topics */}
                                    {topics && topics.length > 0 && (
                                        <div className="mb-8">
                                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Topics Covered</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {topics.map((topic, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
                                                    >
                                                        {topic}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Sample Questions */}
                                    <div className="mb-8">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4">Sample Questions</h3>
                                        <div className="space-y-4">
                                            {sampleQuestions.length > 0 ? (
                                                sampleQuestions.map((question, index) => (
                                                    <div key={index} className="p-4 bg-gray-50 rounded-xl">
                                                        <p className="font-semibold text-gray-800 mb-2">
                                                            {index + 1}. {question.question || question.text}
                                                        </p>
                                                        {question.options && (
                                                            <div className="space-y-2 ml-4">
                                                                {question.options.map((option, optIndex) => (
                                                                    <div key={optIndex} className="flex items-center space-x-2">
                                                                        <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-xs">
                                                                            {String.fromCharCode(65 + optIndex)}
                                                                        </div>
                                                                        <span className="text-gray-700">{option}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 text-center py-4">No preview available</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Difficulty Distribution */}
                                    <div className="mb-8">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4">Question Distribution</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm text-gray-600">Easy</span>
                                                    <span className="text-sm font-semibold">30%</span>
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-green-500 rounded-full" style={{ width: '30%' }} />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm text-gray-600">Medium</span>
                                                    <span className="text-sm font-semibold">50%</span>
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '50%' }} />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm text-gray-600">Hard</span>
                                                    <span className="text-sm font-semibold">20%</span>
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-red-500 rounded-full" style={{ width: '20%' }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Student Reviews (Mock) */}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-4">Student Reviews</h3>
                                        <div className="space-y-4">
                                            <div className="p-4 bg-gray-50 rounded-xl">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <div className="flex">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                                                        ))}
                                                    </div>
                                                    <span className="text-sm font-semibold">Great quiz!</span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Really helped me understand the concepts better. Highly recommend!
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="border-t border-gray-200 px-8 py-6 bg-gray-50">
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={onClose}
                                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                                        >
                                            Close
                                        </button>
                                        <Link
                                            to={`/play/${_id}`}
                                            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                                        >
                                            <Play size={20} />
                                            <span>Start Quiz</span>
                                            <ArrowRight size={20} />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default QuizPreviewModal;
