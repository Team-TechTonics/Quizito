// src/pages/ClassManagement.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Plus,
    BookOpen,
    Settings,
    MoreVertical,
    Search,
    UserPlus,
    Trash2,
    Copy,
    Loader,
    X,
    FileText,
    Calendar,
    Clock
} from 'lucide-react';
import { classService, quizService } from '../services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ClassManagement = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null); // If null, show list; if set, show details
    const [students, setStudents] = useState([]); // Students for the selected class
    const [assignments, setAssignments] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Assignment Modal State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [myQuizzes, setMyQuizzes] = useState([]);
    const [selectedQuizId, setSelectedQuizId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [loadingQuizzes, setLoadingQuizzes] = useState(false);

    // Form states
    const [newClassName, setNewClassName] = useState('');
    const [newClassSubject, setNewClassSubject] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const data = await classService.getClasses();
            setClasses(data || []);
        } catch (error) {
            console.error('Failed to fetch classes:', error);
            // toast.error('Failed to load classes');
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignments = async (classId) => {
        try {
            const data = await classService.getClassAssignments(classId);
            setAssignments(data || []);
        } catch (error) {
            console.error("Failed to fetch assignments", error);
        }
    }

    const handleCreateClass = async (e) => {
        e.preventDefault();
        try {
            await classService.createClass({ name: newClassName, subject: newClassSubject });
            toast.success('Class created successfully!');
            setShowCreateModal(false);
            setNewClassName('');
            setNewClassSubject('');
            fetchClasses();
        } catch (error) {
            console.error('Failed to create class:', error);
            toast.error('Failed to create class');
        }
    };

    const handleViewClass = async (cls) => {
        setSelectedClass(cls);
        setLoadingStudents(true);
        try {
            const [studentData, assignmentData] = await Promise.all([
                classService.getClassStudents(cls.id || cls._id),
                classService.getClassAssignments(cls.id || cls._id)
            ]);
            setStudents(studentData || []);
            setAssignments(assignmentData || []);
        } catch (error) {
            console.error('Failed to fetch class details:', error);
            toast.error('Failed to load class details');
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleInviteStudent = async (e) => {
        e.preventDefault();
        if (!inviteEmail) return;
        try {
            await classService.inviteStudent(selectedClass.id || selectedClass._id, inviteEmail);
            toast.success(`Invitation sent to ${inviteEmail}`);
            setInviteEmail('');
        } catch (error) {
            console.error('Failed to invite student:', error);
            toast.error('Failed to invite student');
        }
    };

    const handleOpenAssignModal = async () => {
        setShowAssignModal(true);
        setLoadingQuizzes(true);
        try {
            const quizzes = await quizService.getUserQuizzes(user._id || user.id);
            setMyQuizzes(quizzes || []);
        } catch (error) {
            toast.error("Failed to load your quizzes");
        } finally {
            setLoadingQuizzes(false);
        }
    };

    const handleAssignQuiz = async (e) => {
        e.preventDefault();
        if (!selectedQuizId || !dueDate) {
            toast.error("Please select a quiz and due date");
            return;
        }

        try {
            await classService.assignQuiz(selectedClass.id || selectedClass._id, {
                quizId: selectedQuizId,
                dueDate: new Date(dueDate),
                settings: { attempts: 1 }
            });
            toast.success("Quiz assigned successfully!");
            setShowAssignModal(false);
            setSelectedQuizId('');
            setDueDate('');
            // Refresh assignments
            fetchAssignments(selectedClass.id || selectedClass._id);
        } catch (error) {
            console.error("Failed to assign quiz:", error);
            toast.error("Failed to assign quiz");
        }
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        toast.success('Class code copied!');
    };

    const handleDeleteClass = async (classId) => {
        if (!window.confirm('Are you sure you want to delete this class? This cannot be undone.')) return;
        try {
            await classService.deleteClass(classId);
            toast.success('Class deleted');
            if (selectedClass && (selectedClass.id === classId || selectedClass._id === classId)) {
                setSelectedClass(null);
            }
            fetchClasses();
        } catch (error) {
            console.error('Failed to delete class:', error);
            toast.error('Failed to delete class');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
                <Loader className="animate-spin text-purple-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-8 px-4">
            <div className="container mx-auto max-w-6xl">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Class Management</h1>
                        <p className="text-gray-600">Manage your classes and students</p>
                    </div>
                    {!selectedClass && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
                        >
                            <Plus size={20} />
                            <span>Create Class</span>
                        </button>
                    )}
                    {selectedClass && (
                        <button
                            onClick={() => setSelectedClass(null)}
                            className="bg-white text-gray-700 px-6 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-gray-100 transition-colors border border-gray-200"
                        >
                            <span>Back to Classes</span>
                        </button>
                    )}
                </div>

                {/* Class List View */}
                {!selectedClass && (
                    <>
                        {classes.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
                                <Users size={64} className="mx-auto mb-4 text-gray-300" />
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">No Classes Yet</h2>
                                <p className="text-gray-600 mb-6">Create your first class to get started!</p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors"
                                >
                                    Create Class
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {classes.map((cls) => (
                                    <motion.div
                                        key={cls.id || cls._id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ y: -5 }}
                                        className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer group hover:shadow-xl transition-all border border-gray-100"
                                        onClick={() => handleViewClass(cls)}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-purple-100 rounded-xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                                <BookOpen size={24} />
                                            </div>
                                            <div className="dropdown relative" onClick={e => e.stopPropagation()}>
                                                <button className="text-gray-400 hover:text-gray-600 p-1">
                                                    <MoreVertical size={20} />
                                                </button>
                                                {/* Dropdown implementation could go here, for now using direct trash icon somewhere else or simple approach */}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-800 mb-1">{cls.name}</h3>
                                        <p className="text-gray-500 text-sm mb-4">{cls.subject} • {cls.studentCount || 0} Students</p>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div className="flex -space-x-2">
                                                {/* Avatars would go here */}
                                                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500">
                                                    <Users size={12} />
                                                </div>
                                            </div>
                                            <span className="text-sm font-semibold text-purple-600 group-hover:underline">View Details →</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Class Detail View */}
                {selectedClass && (
                    <div className="space-y-6">
                        {/* Class Info Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-800 mb-2">{selectedClass.name}</h2>
                                    <p className="text-gray-600 text-lg flex items-center">
                                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold mr-3">{selectedClass.subject}</span>
                                        {students.length} Students Enrolled
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500 mb-1">Class Code</p>
                                    <button
                                        onClick={() => handleCopyCode(selectedClass.code || 'XYZ123')}
                                        className="text-2xl font-mono font-bold text-gray-800 flex items-center hover:text-purple-600 transition-colors group"
                                    >
                                        {selectedClass.code || 'XYZ123'}
                                        <Copy size={18} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex space-x-4 mt-8">
                                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                    <Settings size={18} />
                                    <span>Settings</span>
                                </button>
                                <button
                                    onClick={() => handleDeleteClass(selectedClass.id || selectedClass._id)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 size={18} />
                                    <span>Delete Class</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Content Area: Students & Assignments */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* Assignments Section */}
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                            <FileText className="mr-2 text-purple-600" size={24} />
                                            Active Assignments
                                        </h3>
                                        <button
                                            onClick={handleOpenAssignModal}
                                            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200 transition-colors flex items-center"
                                        >
                                            <Plus size={18} className="mr-1" /> Assign Quiz
                                        </button>
                                    </div>

                                    {assignments.length === 0 ? (
                                        <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl">
                                            <p className="text-gray-500">No active assignments</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {assignments.map((assignment, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="p-2 bg-white rounded-lg shadow-sm text-purple-600">
                                                            <FileText size={20} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-800">{assignment.quiz?.title || 'Quiz'}</h4>
                                                            <p className="text-sm text-gray-500">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">Active</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Students Section */}
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-gray-800">Students</h3>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder="Search students..."
                                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                    </div>

                                    {loadingStudents ? (
                                        <div className="flex justify-center py-8">
                                            <Loader className="animate-spin text-purple-600" size={32} />
                                        </div>
                                    ) : students.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                            <Users size={48} className="mx-auto mb-3 text-gray-300" />
                                            <p className="text-gray-500 font-medium">No students enrolled yet</p>
                                            <p className="text-sm text-gray-400">Invite students to join utilizing the class code</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="text-left text-gray-500 text-sm border-b border-gray-100">
                                                    <tr>
                                                        <th className="pb-3 font-medium pl-4">Name</th>
                                                        <th className="pb-3 font-medium">Progress</th>
                                                        <th className="pb-3 font-medium">Last Active</th>
                                                        <th className="pb-3 font-medium text-right pr-4">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {students.map((student) => (
                                                        <tr key={student.id} className="group hover:bg-gray-50 transition-colors">
                                                            <td className="py-4 pl-4">
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                                                        {student.name?.charAt(0) || 'S'}
                                                                    </div>
                                                                    <span className="font-semibold text-gray-800">{student.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-4">
                                                                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-green-500" style={{ width: `${student.progress || 0}%` }}></div>
                                                                </div>
                                                                <span className="text-xs text-gray-500 mt-1 block">{student.progress || 0}% Complete</span>
                                                            </td>
                                                            <td className="py-4 text-sm text-gray-600">
                                                                {student.lastActive || 'Never'}
                                                            </td>
                                                            <td className="py-4 text-right pr-4">
                                                                <button className="text-gray-400 hover:text-red-500 transition-colors p-1">
                                                                    <X size={18} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sidebar Actions */}
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                        <UserPlus size={20} className="mr-2 text-purple-600" />
                                        Invite Student
                                    </h3>
                                    <form onSubmit={handleInviteStudent}>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                            <input
                                                type="email"
                                                required
                                                value={inviteEmail}
                                                onChange={(e) => setInviteEmail(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                placeholder="student@example.com"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full bg-purple-600 text-white py-2 rounded-xl font-bold hover:bg-purple-700 transition-colors"
                                        >
                                            Send Invitation
                                        </button>
                                    </form>
                                </div>

                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                                    <h3 className="text-lg font-bold mb-2">Quick Stats</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-white/10 rounded-lg p-3">
                                            <span>Quizzes Assigned</span>
                                            <span className="font-bold">{assignments.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-white/10 rounded-lg p-3">
                                            <span>Students</span>
                                            <span className="font-bold">{students.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-white/10 rounded-lg p-3">
                                            <span>Top Performer</span>
                                            <span className="font-bold">--</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Class Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold text-gray-800">Create New Class</h3>
                                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <form onSubmit={handleCreateClass} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newClassName}
                                    onChange={(e) => setNewClassName(e.target.value)}
                                    placeholder="e.g. Grade 10 Mathematics"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <select
                                    required
                                    value={newClassSubject}
                                    onChange={(e) => setNewClassSubject(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Select a Subject</option>
                                    <option value="Mathematics">Mathematics</option>
                                    <option value="Science">Science</option>
                                    <option value="History">History</option>
                                    <option value="Literature">Literature</option>
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="Art">Art</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
                                >
                                    Create Class
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Assign Quiz Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold text-gray-800">Assign Quiz</h3>
                                <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <form onSubmit={handleAssignQuiz} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Quiz</label>
                                {loadingQuizzes ? (
                                    <p className="text-sm text-gray-500">Loading your quizzes...</p>
                                ) : (
                                    <select
                                        required
                                        value={selectedQuizId}
                                        onChange={(e) => setSelectedQuizId(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Choose a quiz...</option>
                                        {myQuizzes.map(quiz => (
                                            <option key={quiz._id || quiz.id} value={quiz._id || quiz.id}>
                                                {quiz.title}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loadingQuizzes}
                                    className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 disabled:opacity-50"
                                >
                                    Assign to Class
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ClassManagement;
