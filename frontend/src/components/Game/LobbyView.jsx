import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LobbyView = ({ roomCode, player, settings, quizInfo, currentTip }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="z-10 flex flex-col items-center text-center space-y-8"
            >
                <div className="relative">
                    <motion.div
                        animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 4 }}
                        className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden"
                    >
                        {/* Avatar placeholder or user image */}
                        <span className="text-6xl">{player?.avatar || '😎'}</span>
                    </motion.div>
                    <div className="absolute -bottom-4 w-full flex justify-center">
                        <span className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold border border-white/20 shadow-lg truncate max-w-[150px]">
                            {player?.username || "You"}
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-5xl font-extrabold tracking-tight drop-shadow-sm">You're In!</h1>
                    <p className="text-xl text-indigo-100 font-medium">Waiting for host to start...</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl w-full max-w-xs transform hover:scale-105 transition-transform duration-300">
                    <p className="text-xs text-indigo-200 uppercase font-bold tracking-widest mb-2">ROOM CODE</p>
                    <p className="text-5xl font-mono font-bold tracking-wider drop-shadow-md">{roomCode}</p>
                </div>

                {quizInfo && (
                    <div className="flex flex-col gap-2 w-full max-w-xs">
                        <div className="bg-black/20 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                            <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-1">Playing</h3>
                            <p className="font-bold text-lg truncate">{quizInfo.title}</p>
                            <p className="text-xs text-indigo-200">{quizInfo.totalQuestions} Questions • {quizInfo.difficulty || 'Mixed'} Difficulty</p>
                        </div>

                        {settings && (
                            <div className="flex gap-2 justify-center">
                                <span className={`px-2 py-1 rounded text-xs font-bold border ${settings.showLeaderboard ? 'bg-green-500/20 border-green-400/30 text-green-200' : 'bg-red-500/20 border-red-400/30 text-red-200'}`}>
                                    {settings.showLeaderboard ? '🏆 Leaderboard On' : '🚫 Leaderboard Off'}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-bold border ${settings.allowLateJoin ? 'bg-blue-500/20 border-blue-400/30 text-blue-200' : 'bg-red-500/20 border-red-400/30 text-red-200'}`}>
                                    {settings.allowLateJoin ? '👐 Late Join' : '🔒 Locked'}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <div className="pt-12 max-w-sm">
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                        className="flex gap-2 justify-center"
                    >
                        <span className="w-2 h-2 bg-white rounded-full"></span>
                        <span className="w-2 h-2 bg-white rounded-full animation-delay-200"></span>
                        <span className="w-2 h-2 bg-white rounded-full animation-delay-400"></span>
                    </motion.div>

                    {/* Animated Tips Section */}
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={currentTip || "default"}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5 }}
                            className="mt-4 text-sm opacity-80 italic font-medium bg-black/20 p-3 rounded-lg border border-white/10"
                        >
                            "{currentTip || "Get ready to play!"}"
                        </motion.p>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default LobbyView;
