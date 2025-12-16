import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft as FiChevronLeft, CheckCircle as FiCheckCircle, Lock as FiLock, Play as FiPlay,
    Award as FiAward, Book as FiBook, Clock as FiClock, Star as FiStar, FileQuestion as MdQuiz
} from 'lucide-react';

const PathViewer = () => {
    const { pathId } = useParams();
    const navigate = useNavigate();
    const [selectedModule, setSelectedModule] = useState(0);

    const { learningPathService } = require('../services');

    const [pathData, setPathData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    React.useEffect(() => {
        const fetchPath = async () => {
            try {
                setLoading(true);
                const data = await learningPathService.getPathById(pathId);
                setPathData(data);
            } catch (err) {
                console.error("Failed to fetch path:", err);
                setError("Failed to load learning path.");
            } finally {
                setLoading(false);
            }
        };

        if (pathId) fetchPath();
    }, [pathId]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error || !pathData) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-600">
            <h2 className="text-xl font-bold mb-2">Oops!</h2>
            <p>{error || "Path not found"}</p>
            <button onClick={() => navigate('/learning-paths')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
                Go Back
            </button>
        </div>
    );

    const handleStepComplete = (moduleId, stepId) => {
        setPathData(prev => {
            const newModules = prev.modules.map(mod => {
                if (mod.id !== moduleId) return mod;

                const newSteps = mod.steps.map(step => {
                    if (step.id === stepId) {
                        return { ...step, status: 'completed', score: step.type === 'quiz' ? 100 : undefined };
                    }
                    return step;
                });

                // Check if next step needs unlocking
                const currentStepIndex = newSteps.findIndex(s => s.id === stepId);
                if (currentStepIndex < newSteps.length - 1) {
                    newSteps[currentStepIndex + 1].status = 'active';
                }

                return { ...mod, steps: newSteps };
            });

            return { ...prev, modules: newModules };
        });
    };

    const getIcon = (type) => {
        switch (type) {
            case 'quiz': return <MdQuiz />;
            case 'video': return <FiPlay />;
            case 'reading': return <FiBook />;
            case 'project': return <FiStar />;
            default: return <FiCheckCircle />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-80 bg-white border-r border-gray-200 flex-shrink-0 md:h-screen md:sticky md:top-0 overflow-y-auto">
                <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                    <button
                        onClick={() => navigate('/learning-paths')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FiChevronLeft />
                    </button>
                    <h2 className="font-bold text-gray-800 truncate">{pathData.title}</h2>
                </div>

                <div className="p-6 text-center border-b border-gray-100 bg-gradient-to-br from-blue-50 to-indigo-50">
                    <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center shadow-md mb-3 relative">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                        <div
                            className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin-slow"
                            style={{ transform: `rotate(${pathData.progress * 3.6}deg)` }} // Mock progress
                        />
                        <span className="text-xl font-bold text-blue-600">{pathData.progress}%</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">{pathData.earnedXP} / {pathData.totalXP} XP Earned</p>
                </div>

                <div className="p-2">
                    {pathData.modules.map((module, index) => (
                        <div
                            key={module.id}
                            onClick={() => module.status !== 'locked' && setSelectedModule(index)}
                            className={`p-4 rounded-xl mb-2 cursor-pointer transition-all ${selectedModule === index
                                ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-100'
                                : module.status === 'locked'
                                    ? 'opacity-50 bg-gray-50 cursor-not-allowed'
                                    : 'hover:bg-gray-50 border border-transparent'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-xs font-bold uppercase tracking-wider ${selectedModule === index ? 'text-blue-600' : 'text-gray-400'
                                    }`}>Module {index + 1}</span>
                                {module.status === 'completed' && <FiCheckCircle className="text-green-500" />}
                                {module.status === 'locked' && <FiLock className="text-gray-400" />}
                            </div>
                            <h3 className={`font-semibold text-sm mb-1 ${selectedModule === index ? 'text-gray-900' : 'text-gray-700'}`}>
                                {module.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{module.steps.length} Steps</span>
                                <span>•</span>
                                <span>{module.xp} XP</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 md:p-10">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        key={selectedModule}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="mb-8">
                            <span className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-2 block">
                                Module {selectedModule + 1}
                            </span>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                {pathData.modules[selectedModule].title}
                            </h1>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                {pathData.modules[selectedModule].description}
                            </p>
                        </div>

                        <div className="space-y-4">
                            {pathData.modules[selectedModule].steps.map((step, idx) => (
                                <div
                                    key={step.id}
                                    className={`bg-white rounded-2xl border p-5 flex items-center justify-between transition-all group ${step.status === 'locked'
                                        ? 'border-gray-100 opacity-60'
                                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm ${step.status === 'completed' ? 'bg-green-100 text-green-600' :
                                            step.status === 'active' ? 'bg-blue-100 text-blue-600' :
                                                'bg-gray-100 text-gray-400'
                                            }`}>
                                            {getIcon(step.type)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {step.title}
                                            </h4>
                                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                <span className="uppercase font-medium bg-gray-100 px-2 py-0.5 rounded text-[10px]">
                                                    {step.type}
                                                </span>
                                                {step.duration && <span>{step.duration}</span>}
                                                {step.questions && <span>{step.questions} Questions</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        {step.status === 'completed' ? (
                                            <div className="flex flex-col items-end">
                                                <span className="text-green-600 font-bold text-sm flex items-center gap-1">
                                                    Completed <FiCheckCircle />
                                                </span>
                                                {step.score && <span className="text-xs text-gray-400">Score: {step.score}%</span>}
                                            </div>
                                        ) : step.status === 'active' ? (
                                            <button
                                                onClick={() => handleStepComplete(pathData.modules[selectedModule].id, step.id)}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-blue-200"
                                            >
                                                Start
                                            </button>
                                        ) : (
                                            <FiLock className="text-gray-300 text-xl" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default PathViewer;
