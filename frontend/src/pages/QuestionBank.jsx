// src/pages/QuestionBank.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    Plus,
    Copy,
    Trash2,
    Edit2,
    CheckCircle,
    BookOpen,
    Tag,
    Layers,
    MoreVertical,
    ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { quizService } from '../services';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const QuestionBank = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [filteredQuestions, setFilteredQuestions] = useState([]);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [selectedTag, setSelectedTag] = useState('all');

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        types: {},
        difficulties: {}
    });

    useEffect(() => {
        fetchQuestions();
    }, [user]);

    useEffect(() => {
        filterQuestions();
    }, [searchTerm, selectedType, selectedDifficulty, questions]);

    const fetchQuestions = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Fetch all quizzes created by user
            const myQuizzes = await quizService.getUserQuizzes(user._id || user.id);

            // Extract all questions
            let allQuestions = [];
            myQuizzes.forEach(quiz => {
                if (quiz.questions && Array.isArray(quiz.questions)) {
                    quiz.questions.forEach(q => {
                        allQuestions.push({
                            ...q,
                            sourceQuizId: quiz._id || quiz.id,
                            sourceQuizTitle: quiz.title,
                            _id: q._id || `temp_${Math.random().toString(36).substr(2, 9)}` // Ensure ID
                        });
                    });
                }
            });

            // Remove duplicates based on question text (optional, but good for a "bank")
            // For now, we keep all instances as they might vary slightly, but we could group them.

            setQuestions(allQuestions);
            calculateStats(allQuestions);

        } catch (error) {
            console.error("Failed to fetch questions:", error);
            toast.error("Failed to load question bank");
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const types = {};
        const difficulties = {};

        data.forEach(q => {
            // Type stats
            const type = q.type || 'multiple-choice';
            types[type] = (types[type] || 0) + 1;

            // Difficulty stats
            const diff = q.difficulty || 'medium';
            difficulties[diff] = (difficulties[diff] || 0) + 1;
        });

        setStats({
            total: data.length,
            types,
            difficulties
        });
    };

    const filterQuestions = () => {
        let filtered = [...questions];

        // Search
        if (searchTerm) {
            const lowerInfo = searchTerm.toLowerCase();
            filtered = filtered.filter(q =>
                (q.question && q.question.toLowerCase().includes(lowerInfo)) ||
                (q.sourceQuizTitle && q.sourceQuizTitle.toLowerCase().includes(lowerInfo))
            );
        }

        // Type Filter
        if (selectedType !== 'all') {
            filtered = filtered.filter(q => q.type === selectedType);
        }

        // Difficulty Filter
        if (selectedDifficulty !== 'all') {
            filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
        }

        setFilteredQuestions(filtered);
    };

    const copyQuestionText = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Question copied to clipboard");
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'bg-green-100 text-green-700';
            case 'hard': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <BookOpen className="text-indigo-600" />
                            Question Bank
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Manage and reuse questions from all your quizzes ({stats.total} total)
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Questions</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</h3>
                            </div>
                            <div className="p-3 bg-indigo-50 rounded-xl">
                                <Layers className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>
                    {/* Add more stats if needed */}
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search questions or quiz titles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <select
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        >
                            <option value="all">All Difficulties</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>

                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        >
                            <option value="all">All Types</option>
                            <option value="multiple-choice">Multiple Choice</option>
                            <option value="true-false">True/False</option>
                        </select>
                    </div>
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                    <AnimatePresence>
                        {filteredQuestions.map((q, idx) => (
                            <motion.div
                                key={q._id + idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(q.difficulty)}`}>
                                                {q.difficulty || 'Medium'}
                                            </span>
                                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                                                {q.type?.replace('-', ' ') || 'Multiple Choice'}
                                            </span>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                from <span className="font-medium text-gray-600">{q.sourceQuizTitle}</span>
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-3">{q.question}</h3>

                                        {/* Options Preview */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                            {q.options?.map((opt, i) => (
                                                <div
                                                    key={i}
                                                    className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${opt.isCorrect ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}
                                                >
                                                    {opt.isCorrect && <CheckCircle className="w-4 h-4 shrink-0" />}
                                                    <span className="truncate">{opt.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => copyQuestionText(q.question)}
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="Copy Question"
                                        >
                                            <Copy className="w-5 h-5" />
                                        </button>
                                        <button
                                            className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredQuestions.length === 0 && (
                        <div className="text-center py-12">
                            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="text-gray-400 w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">No questions found</h3>
                            <p className="text-gray-500">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestionBank;
