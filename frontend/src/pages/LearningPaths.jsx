import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Map as FiMap, Lock as FiLock, CheckCircle as FiCheckCircle, Play as FiPlay, Star as FiStar, Clock as FiClock, Award as FiAward, Users as FiUsers } from 'lucide-react';

const LearningPaths = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('my-paths');

    const [myPaths, setMyPaths] = useState([]);
    const [explorePaths, setExplorePaths] = useState([]);
    const [loading, setLoading] = useState(true);

    const { learningPathService } = require('../services'); // Import service

    React.useEffect(() => {
        fetchPaths();
    }, []);

    const fetchPaths = async () => {
        try {
            setLoading(true);
            const data = await learningPathService.getAllPaths();
            // Separate into my paths and explore paths based on enrollment
            // For now, assuming API returns all and we filter, or API handles it.
            // Simplified: All paths in explore, "enrolled" ones in My Paths
            setExplorePaths(data || []);
            // setMyPaths(data.filter(p => p.enrolled)); // Logic to be refined
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Placeholder data for UI while backend populates
    const mockMyPaths = [
        {
            id: 'path_001',
            title: 'Python Mastery',
            description: 'Zero to Hero in Python programming including data structures and algorithms.',
            progress: 35,
            totalModules: 8,
            completedModules: 2,
            lastAccessed: '2 hours ago',
            image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=500&q=80',
            color: 'blue'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Paths</h1>
                <p className="text-gray-600">Structure your learning journey with guided curriculums.</p>
            </div>

            {/* Tabs */}
            <div className="max-w-7xl mx-auto mb-8 flex space-x-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('my-paths')}
                    className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === 'my-paths' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    My Paths
                    {activeTab === 'my-paths' && (
                        <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('explore')}
                    className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === 'explore' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Explore
                    {activeTab === 'explore' && (
                        <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto">
                {activeTab === 'my-paths' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myPaths.map((path) => (
                            <motion.div
                                key={path.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => navigate(`/learning-paths/${path.id}`)}
                            >
                                <div className="h-32 bg-gray-200 relative">
                                    <img src={path.image} alt={path.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/20" />
                                    <div className="absolute bottom-4 left-4">
                                        <span className={`px-2 py-1 bg-white/90 backdrop-blur rounded text-xs font-bold text-${path.color}-700 uppercase`}>
                                            In Progress
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{path.title}</h3>
                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{path.description}</p>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-medium text-gray-600">
                                            <span>{path.progress}% Completed</span>
                                            <span>{path.completedModules}/{path.totalModules} Modules</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-${path.color}-500 rounded-full transition-all duration-500`}
                                                style={{ width: `${path.progress}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 pt-2">Last accessed {path.lastAccessed}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Add New Path Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-6 text-center hover:bg-gray-100 transition-colors cursor-pointer min-h-[300px]"
                            onClick={() => setActiveTab('explore')}
                        >
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                <FiPlay className="text-blue-500 text-xl ml-1" />
                            </div>
                            <h3 className="font-bold text-gray-900">Start New Path</h3>
                            <p className="text-gray-500 text-sm mt-1">Browse our catalog to learn something new</p>
                        </motion.div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {explorePaths.map((path) => (
                            <motion.div
                                key={path.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer"
                                onClick={() => navigate(`/learning-paths/${path.id}`)}
                            >
                                <div className="h-40 bg-gray-200 relative">
                                    <img src={path.image} alt={path.title} className="w-full h-full object-cover" />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                        <FiStar className="text-yellow-400 fill-yellow-400 text-xs" />
                                        <span className="text-xs font-bold">{path.rating}</span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {path.tags.map(tag => (
                                            <span key={tag} className="text-[10px] px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-2 leading-tight">{path.title}</h3>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-4">
                                        <div className="flex items-center gap-1">
                                            <FiUsers />
                                            <span>{path.students}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <FiClock />
                                            <span>{path.duration}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-5 pb-5 pt-0">
                                    <button className="w-full py-2 bg-gray-50 hover:bg-blue-50 text-blue-600 font-semibold rounded-xl text-sm transition-colors border border-gray-100 hover:border-blue-100">
                                        View Details
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LearningPaths;
