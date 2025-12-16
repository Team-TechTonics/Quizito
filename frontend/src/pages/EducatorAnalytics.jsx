// src/pages/EducatorAnalytics.jsx
import { useState, useEffect } from 'react';
import {
    Users,
    TrendingUp,
    Clock,
    Target,
    BarChart3,
    AlertCircle,
    CheckCircle,
    Activity,
    Loader
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { progressService, classService } from '../services';
import toast from 'react-hot-toast';

const EducatorAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClassId) {
            fetchAnalytics(selectedClassId);
        }
    }, [selectedClassId]);

    const fetchClasses = async () => {
        try {
            const classList = await classService.getClasses();
            if (classList && classList.length > 0) {
                setClasses(classList);
                setSelectedClassId(classList[0].id || classList[0]._id);
            } else {
                setLoading(false); // No classes to fetch analytics for
            }
        } catch (error) {
            console.error('Failed to fetch classes:', error);
            // toast.error('Failed to load classes'); // Optional: don't spam error if just no classes
            setLoading(false);
        }
    };

    const fetchAnalytics = async (classId) => {
        setLoading(true);
        try {
            const analyticsData = await progressService.getEducatorAnalytics(classId);
            setData(analyticsData);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
                <Loader className="animate-spin text-purple-600" size={48} />
            </div>
        );
    }

    if (!classes || classes.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-8 px-4 flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
                    <Users size={64} className="mx-auto mb-4 text-purple-200" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No Classes Found</h2>
                    <p className="text-gray-600 mb-6">Create a class to start tracking student performance.</p>
                    <button className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors">
                        Create Your First Class
                    </button>
                    {/* Note: Button would navigate to Class Management page when built */}
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-8 px-4">
            <div className="container mx-auto max-w-7xl">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex justify-between items-center"
                >
                    <div>
                        {/* Class Selector if multiple classes */}
                        {classes.length > 1 ? (
                            <select
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                                className="text-4xl font-bold text-gray-800 bg-transparent border-none focus:ring-0 cursor-pointer mb-2"
                            >
                                {classes.map(c => (
                                    <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
                                ))}
                            </select>
                        ) : (
                            <h1 className="text-4xl font-bold text-gray-800 mb-2">{data.className || classes[0]?.name} Analytics</h1>
                        )}
                        <p className="text-gray-600">Track class performance and student progress</p>
                    </div>
                </motion.div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl shadow-lg p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-gray-600 text-sm">Average Score</p>
                                <p className="text-3xl font-bold text-indigo-600">{data.averageScore || 0}%</p>
                            </div>
                            <div className="p-3 bg-indigo-100 rounded-xl">
                                <Target className="text-indigo-600" size={24} />
                            </div>
                        </div>
                        <div className="flex items-center text-sm">
                            <TrendingUp className="text-green-600 mr-1" size={16} />
                            <span className="text-green-600 font-semibold">+{data.improvement || 0}%</span>
                            <span className="text-gray-600 ml-1">this week</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-lg p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-gray-600 text-sm">Active Students</p>
                                <p className="text-3xl font-bold text-green-600">{data.activeStudents || 0}/{data.students || 0}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-xl">
                                <Users className="text-green-600" size={24} />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">
                            {data.students > 0 ? Math.round(((data.activeStudents || 0) / data.students) * 100) : 0}% participation
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl shadow-lg p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-gray-600 text-sm">Avg Completion</p>
                                <p className="text-3xl font-bold text-blue-600">{data.avgCompletion || 0} min</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Clock className="text-blue-600" size={24} />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">
                            Per quiz average
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-2xl shadow-lg p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-gray-600 text-sm">Engagement</p>
                                <p className="text-3xl font-bold text-purple-600">{data.engagement?.participationRate || 0}%</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <Activity className="text-purple-600" size={24} />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">
                            Participation rate
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Class Performance Trend */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-2xl shadow-lg p-6"
                    >
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <TrendingUp className="mr-2 text-indigo-600" size={24} />
                            Class Performance Trend
                        </h2>
                        {data.performanceHistory && data.performanceHistory.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={data.performanceHistory}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="avgScore"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        name="Average Score"
                                        dot={{ fill: '#6366f1', r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-400">
                                Not enough data for trend analysis
                            </div>
                        )}
                    </motion.div>

                    {/* Score Distribution */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white rounded-2xl shadow-lg p-6"
                    >
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <BarChart3 className="mr-2 text-purple-600" size={24} />
                            Score Distribution
                        </h2>
                        {data.scoreDistribution && data.scoreDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data.scoreDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="range" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#8b5cf6" name="Students" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-400">
                                No score data available
                            </div>
                        )}
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Weekly Activity */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="bg-white rounded-2xl shadow-lg p-6"
                    >
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Weekly Activity</h2>
                        {data.engagement?.weeklyActivity && data.engagement.weeklyActivity.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={data.engagement.weeklyActivity}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="quizzes" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[250px] flex items-center justify-center text-gray-400">
                                No activity data available
                            </div>
                        )}
                    </motion.div>

                    {/* Student List */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6"
                    >
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Top Students</h2>
                        <div className="space-y-3">
                            {data.studentList && data.studentList.length > 0 ? (
                                data.studentList.map((student, index) => (
                                    <div
                                        key={student.id}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                                        onClick={() => setSelectedStudent(student)}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">{student.name}</p>
                                                <p className="text-sm text-gray-600">{student.quizzes} quizzes completed</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-indigo-600">{student.score}%</p>
                                                <p className="text-xs text-gray-500">Last active: {student.lastActive}</p>
                                            </div>
                                            {student.trend === 'up' && <TrendingUp className="text-green-600" size={20} />}
                                            {student.trend === 'down' && <TrendingUp className="text-red-600 rotate-180" size={20} />}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-400 py-8">No student data available</p>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Question Analysis */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="bg-white rounded-2xl shadow-lg p-6 mb-8"
                >
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Question Analysis</h2>
                    <div className="space-y-4">
                        {data.questionAnalysis && data.questionAnalysis.length > 0 ? (
                            data.questionAnalysis.map((question) => (
                                <div key={question.questionId} className="p-4 border border-gray-200 rounded-xl">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800 mb-1">{question.text}</p>
                                            <div className="flex items-center space-x-4 text-sm">
                                                <span className={`px-2 py-1 rounded-full ${question.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                                    question.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {question.difficulty}
                                                </span>
                                                <span className="text-gray-600">Avg time: {question.avgTime}s</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-2xl font-bold ${question.accuracy >= 80 ? 'text-green-600' :
                                                question.accuracy >= 60 ? 'text-amber-600' :
                                                    'text-red-600'
                                                }`}>
                                                {question.accuracy}%
                                            </p>
                                            <p className="text-xs text-gray-500">Accuracy</p>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${question.accuracy >= 80 ? 'bg-green-500' :
                                                question.accuracy >= 60 ? 'bg-amber-500' :
                                                    'bg-red-500'
                                                }`}
                                            style={{ width: `${question.accuracy}%` }}
                                        />
                                    </div>
                                    {question.accuracy < 60 && (
                                        <div className="mt-2 flex items-start space-x-2 text-sm text-amber-700 bg-amber-50 p-2 rounded">
                                            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                            <span>Consider reviewing this topic with students</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-400 py-8">No question analysis data available</p>
                        )}
                    </div>
                </motion.div>

                {/* Engagement Metrics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                >
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Engagement Metrics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-green-50 rounded-xl">
                            <CheckCircle className="mx-auto mb-3 text-green-600" size={32} />
                            <p className="text-3xl font-bold text-green-600">{data.engagement?.participationRate || 0}%</p>
                            <p className="text-sm text-gray-600 mt-1">Participation Rate</p>
                        </div>
                        <div className="text-center p-6 bg-blue-50 rounded-xl">
                            <Clock className="mx-auto mb-3 text-blue-600" size={32} />
                            <p className="text-3xl font-bold text-blue-600">{data.engagement?.avgCompletionTime || 0} min</p>
                            <p className="text-sm text-gray-600 mt-1">Avg Completion Time</p>
                        </div>
                        <div className="text-center p-6 bg-purple-50 rounded-xl">
                            <Activity className="mx-auto mb-3 text-purple-600" size={32} />
                            <p className="text-3xl font-bold text-purple-600">{data.engagement?.dropOffRate || 0}%</p>
                            <p className="text-sm text-gray-600 mt-1">Drop-off Rate</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default EducatorAnalytics;
