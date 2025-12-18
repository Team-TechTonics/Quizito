import React, { useState } from 'react';
import { Upload, Code, CheckCircle, XCircle, Loader } from 'lucide-react';

export default function PDFServiceTester() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [testing, setTesting] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setResult(null);
            setError(null);
        }
    };

    const testDirectly = async () => {
        if (!selectedFile) {
            setError("Please select a PDF file first");
            return;
        }

        setTesting(true);
        setError(null);
        setResult(null);

        try {
            console.log("📤 Testing direct connection to Python service...");
            console.log("📄 File:", selectedFile.name, selectedFile.size, "bytes");

            const formData = new FormData();
            formData.append("file", selectedFile);

            const startTime = Date.now();

            const response = await fetch("https://clone-quizito.onrender.com/api/upload", {
                method: "POST",
                body: formData
            });

            const elapsed = Date.now() - startTime;
            console.log(`⏱️ Response time: ${elapsed}ms`);

            const data = await response.json();

            console.log("📦 Response status:", response.status);
            console.log("📦 Response data:", data);

            setResult({
                status: response.status,
                statusText: response.statusText,
                elapsed: elapsed,
                data: data,
                dataType: Array.isArray(data) ? 'array' : typeof data,
                questionCount: Array.isArray(data) ? data.length : (data.questions?.length || 0)
            });

        } catch (err) {
            console.error("❌ Test failed:", err);
            setError(err.message);
        } finally {
            setTesting(false);
        }
    };

    const testViaBackend = async () => {
        if (!selectedFile) {
            setError("Please select a PDF file first");
            return;
        }

        setTesting(true);
        setError(null);
        setResult(null);

        try {
            console.log("📤 Testing via Node backend...");

            const formData = new FormData();
            formData.append("file", selectedFile);

            const startTime = Date.now();

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });

            const elapsed = Date.now() - startTime;
            const data = await response.json();

            console.log("📦 Backend response:", data);

            setResult({
                status: response.status,
                statusText: response.statusText,
                elapsed: elapsed,
                data: data,
                dataType: typeof data,
                questionCount: data.quiz?.questions?.length || 0,
                viaBackend: true
            });

        } catch (err) {
            console.error("❌ Backend test failed:", err);
            setError(err.message);
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <Code className="w-8 h-8 text-indigo-600" />
                    <h2 className="text-3xl font-bold text-gray-800">Python Service Tester</h2>
                </div>

                <p className="text-gray-600 mb-6">
                    Test the Python AI service directly and via the Node backend to debug PDF quiz generation
                </p>

                {/* File Upload */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Select PDF File
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                        />
                        {selectedFile && (
                            <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle size={20} />
                                <span className="font-medium">{selectedFile.name}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Test Buttons */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                        onClick={testDirectly}
                        disabled={testing || !selectedFile}
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {testing ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Testing...
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                Test Python Service Directly
                            </>
                        )}
                    </button>

                    <button
                        onClick={testViaBackend}
                        disabled={testing || !selectedFile}
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {testing ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Testing...
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                Test Via Node Backend
                            </>
                        )}
                    </button>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-2 text-red-700 font-bold mb-2">
                            <XCircle size={20} />
                            Error
                        </div>
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {/* Result Display */}
                {result && (
                    <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-300 pb-3">
                            <h3 className="text-xl font-bold text-gray-800">
                                {result.viaBackend ? "Node Backend Result" : "Direct Python Service Result"}
                            </h3>
                            {result.status === 200 ? (
                                <div className="flex items-center gap-2 text-green-600 font-bold">
                                    <CheckCircle size={20} />
                                    Success
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-red-600 font-bold">
                                    <XCircle size={20} />
                                    Status {result.status}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <div className="text-sm text-gray-600 mb-1">Status</div>
                                <div className="text-lg font-bold">{result.status} {result.statusText}</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <div className="text-sm text-gray-600 mb-1">Response Time</div>
                                <div className="text-lg font-bold">{result.elapsed}ms</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <div className="text-sm text-gray-600 mb-1">Data Type</div>
                                <div className="text-lg font-bold">{result.dataType}</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <div className="text-sm text-gray-600 mb-1">Questions Found</div>
                                <div className="text-lg font-bold">{result.questionCount}</div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                            <div className="text-sm font-bold text-gray-700 mb-2">Raw Response Data:</div>
                            <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96 text-xs font-mono">
                                {JSON.stringify(result.data, null, 2)}
                            </pre>
                        </div>

                        {/* Analysis */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="text-sm font-bold text-blue-900 mb-2">🔍 Analysis:</div>
                            <ul className="text-sm text-blue-800 space-y-1">
                                {result.dataType === 'array' && (
                                    <li>✅ Response is an array (expected format)</li>
                                )}
                                {result.dataType === 'object' && !Array.isArray(result.data) && (
                                    <li>⚠️ Response is an object, not an array</li>
                                )}
                                {result.data?.question?.includes('Failed') && (
                                    <li>❌ Python service returned an error: {result.data.question}</li>
                                )}
                                {result.questionCount > 0 && (
                                    <li>✅ Found {result.questionCount} questions</li>
                                )}
                                {result.questionCount === 0 && (
                                    <li>❌ No questions generated</li>
                                )}
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* Code Sample */}
            <div className="bg-slate-900 text-gray-100 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold mb-3 text-white">Sample Code Being Used:</h3>
                <pre className="text-green-400 text-sm overflow-auto">
                    {`const formData = new FormData();
formData.append("file", selectedFile);

fetch("https://clone-quizito.onrender.com/api/upload", {
  method: "POST",
  body: formData
})
.then(res => res.json())
.then(data => console.log(data));`}
                </pre>
            </div>
        </div>
    );
}
