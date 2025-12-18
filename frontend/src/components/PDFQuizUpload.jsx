import React, { useState } from 'react';
import { Upload, FileText, Loader, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function PDFQuizUpload({ onQuestionsGenerated }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === 'application/pdf') {
                setFile(droppedFile);
            } else {
                toast.error('Please upload a PDF file');
            }
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a PDF file first');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                const quiz = response.data.quiz;
                const questionCount = quiz.questions?.length || 0;
                toast.success(`Generated ${questionCount} questions from PDF!`);
                onQuestionsGenerated(quiz.questions);
                setFile(null); // Reset file
            }
        } catch (err) {
            console.error('PDF upload error:', err);

            // Extract detailed error information
            const errorData = err.response?.data;

            if (errorData?.code === 'AI_SERVICE_UNAVAILABLE') {
                toast.error('AI service is not running. Please start the Flask server.');
            } else if (errorData?.code === 'TIMEOUT') {
                toast.error(errorData.message || 'AI service timeout. The service is starting up, please try again in 30 seconds.', {
                    duration: 5000
                });
            } else if (errorData?.suggestions && Array.isArray(errorData.suggestions)) {
                // Show main error message
                toast.error(errorData.message || 'Failed to generate quiz from PDF', {
                    duration: 6000
                });

                // Show suggestions as info toast
                setTimeout(() => {
                    const suggestionText = errorData.suggestions.join('\n• ');
                    toast('💡 Suggestions:\n• ' + suggestionText, {
                        icon: '📝',
                        duration: 8000,
                        style: {
                            maxWidth: '500px',
                            whiteSpace: 'pre-line'
                        }
                    });
                }, 500);
            } else {
                toast.error(errorData?.message || errorData?.error || 'Failed to generate quiz from PDF', {
                    duration: 5000
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pdf-quiz-upload bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="text-purple-600" size={24} />
                <h3 className="text-xl font-bold text-gray-800">AI Quiz Generator</h3>
            </div>

            <p className="text-gray-600 mb-4">
                Upload a PDF and let AI generate quiz questions automatically
            </p>

            {/* Drag & Drop Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${dragActive
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-400'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                {file ? (
                    <div className="flex flex-col items-center space-y-2">
                        <FileText className="text-purple-600" size={48} />
                        <p className="font-medium text-gray-800">{file.name}</p>
                        <p className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                            onClick={() => setFile(null)}
                            className="text-sm text-red-600 hover:text-red-700"
                        >
                            Remove
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-3">
                        <Upload className="text-gray-400" size={48} />
                        <div>
                            <p className="text-gray-700 font-medium">
                                Drag and drop your PDF here
                            </p>
                            <p className="text-sm text-gray-500">or</p>
                        </div>
                        <label className="cursor-pointer">
                            <span className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition inline-block">
                                Browse Files
                            </span>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                        <p className="text-xs text-gray-400">Maximum file size: 10MB</p>
                    </div>
                )}
            </div>

            {/* Generate Button */}
            {file && (
                <button
                    onClick={handleUpload}
                    disabled={loading}
                    className={`w-full mt-4 py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 transition ${loading
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                        }`}
                >
                    {loading ? (
                        <>
                            <Loader className="animate-spin" size={20} />
                            <span>Generating Questions...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles size={20} />
                            <span>Generate Quiz from PDF</span>
                        </>
                    )}
                </button>
            )}

            {/* Info Box */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                    <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">How it works:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-700">
                            <li>AI extracts text from your PDF</li>
                            <li>Generates 10 fill-in-the-blank questions</li>
                            <li>Creates realistic multiple-choice options</li>
                            <li>Questions are ready to use immediately</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
