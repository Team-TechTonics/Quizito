import React from 'react';
import { motion } from 'framer-motion';

const ResponseFeedback = ({ isCorrect, points, streak }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${isCorrect ? 'bg-green-500' : 'bg-red-500'} text-white overflow-hidden`}
        >
            <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.5 }}
                className="text-8xl mb-6 drop-shadow-lg"
            >
                {isCorrect ? '🎉' : '❌'}
            </motion.div>

            <h1 className="text-6xl md:text-7xl font-extrabold mb-4 tracking-tight drop-shadow-md">
                {isCorrect ? 'Awesome!' : 'Oops!'}
            </h1>

            {isCorrect && points > 0 && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/20 backdrop-blur-md px-8 py-3 rounded-full border border-white/30 shadow-xl"
                >
                    <span className="text-4xl font-bold">+{points} pts</span>
                </motion.div>
            )}

            {streak > 1 && isCorrect && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.4 }}
                    className="mt-6 flex flex-col items-center"
                >
                    <span className="text-5xl mb-1">🔥</span>
                    <span className="text-xl font-bold uppercase tracking-widest text-orange-200">Streak {streak}</span>
                </motion.div>
            )}

            {!isCorrect && (
                <p className="text-2xl opacity-80 font-medium mt-4">Better luck next time!</p>
            )}
        </motion.div>
    );
};

export default ResponseFeedback;
