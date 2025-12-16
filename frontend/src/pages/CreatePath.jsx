import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus as FiPlus, Trash2 as FiTrash2, Save as FiSave, ArrowLeft as FiArrowLeft, Move as FiMove } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CreatePath = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [modules, setModules] = useState([
        { id: 1, title: 'Module 1', steps: [] }
    ]);

    const addModule = () => {
        setModules([
            ...modules,
            { id: Date.now(), title: `Module ${modules.length + 1}`, steps: [] }
        ]);
    };

    const removeModule = (moduleId) => {
        setModules(modules.filter(m => m.id !== moduleId));
    };

    const updateModuleTitle = (id, newTitle) => {
        setModules(modules.map(m => m.id === id ? { ...m, title: newTitle } : m));
    };

    const addStep = (moduleId, type) => {
        setModules(modules.map(mod => {
            if (mod.id !== moduleId) return mod;
            return {
                ...mod,
                steps: [
                    ...mod.steps,
                    {
                        id: Date.now(),
                        type,
                        title: type === 'quiz' ? 'New Quiz' : 'New Content',
                        contentId: '' // Placeholder for linking to actual content
                    }
                ]
            };
        }));
    };

    const removeStep = (moduleId, stepId) => {
        setModules(modules.map(mod => {
            if (mod.id !== moduleId) return mod;
            return {
                ...mod,
                steps: mod.steps.filter(s => s.id !== stepId)
            };
        }));
    };

    const handleSave = () => {
        if (!title.trim()) {
            toast.error('Please enter a path title');
            return;
        }
        // Here we would save to backend
        toast.success('Learning Path saved successfully!');
        navigate('/learning-paths');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/learning-paths')}
                            className="p-2 hover:bg-white rounded-full transition-colors"
                        >
                            <FiArrowLeft size={24} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Create Learning Path</h1>
                            <p className="text-gray-500 text-sm">Design a structured curriculum for your students</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
                    >
                        <FiSave />
                        Save Path
                    </button>
                </div>

                {/* Main Settings */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Path Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Advanced Mathematics"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What will students learn in this path?"
                                rows="3"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Modules Builder */}
                <div className="space-y-6">
                    {modules.map((module, index) => (
                        <div key={module.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="cursor-move text-gray-400 hover:text-gray-600">
                                        <FiMove />
                                    </div>
                                    <input
                                        type="text"
                                        value={module.title}
                                        onChange={(e) => updateModuleTitle(module.id, e.target.value)}
                                        className="bg-transparent font-bold text-gray-800 focus:outline-none focus:bg-white focus:px-2 focus:py-1 rounded transition-all"
                                    />
                                </div>
                                <button
                                    onClick={() => removeModule(module.id)}
                                    className="text-red-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <FiTrash2 size={18} />
                                </button>
                            </div>

                            <div className="p-4 space-y-3">
                                {module.steps.length === 0 && (
                                    <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                                        <p className="text-gray-400 text-sm">No steps added yet</p>
                                    </div>
                                )}

                                {module.steps.map((step, stepIdx) => (
                                    <div key={step.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-blue-200 transition-colors group">
                                        <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-xs font-bold text-gray-500">
                                            {stepIdx + 1}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded uppercase font-bold tracking-wider ${step.type === 'quiz' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'
                                            }`}>
                                            {step.type}
                                        </span>
                                        <span className="flex-1 font-medium text-gray-700">{step.title}</span>
                                        <button
                                            onClick={() => removeStep(module.id, step.id)}
                                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                ))}

                                <div className="flex gap-2 mt-4 pt-2 border-t border-gray-50">
                                    <button
                                        onClick={() => addStep(module.id, 'quiz')}
                                        className="flex-1 py-2 border-2 border-dashed border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                    >
                                        <FiPlus /> Add Quiz
                                    </button>
                                    <button
                                        onClick={() => addStep(module.id, 'video')}
                                        className="flex-1 py-2 border-2 border-dashed border-green-200 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                    >
                                        <FiPlus /> Add Video
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={addModule}
                        className="w-full py-4 border-2 border-dashed border-gray-300 text-gray-500 rounded-2xl hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all font-medium flex items-center justify-center gap-2"
                    >
                        <FiPlus size={20} />
                        Add New Module
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePath;
