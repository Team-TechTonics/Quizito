import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'md', color = 'indigo', text = '', fullScreen = false }) => {

  // Inline Spinner for small components
  if (!fullScreen) {
    const sizeClasses = {
      xs: 'w-4 h-4', sm: 'w-6 h-6', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16'
    };

    return (
      <div className="flex flex-col items-center justify-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`${sizeClasses[size]} rounded-full border-2 border-slate-200 border-t-indigo-600`}
        />
        {text && <p className="mt-2 text-sm text-slate-500 font-medium">{text}</p>}
      </div>
    );
  }

  // Full Screen "Super Quizito" Loader
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center overflow-hidden font-sans">

      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-[20%] -right-[20%] w-[80vw] h-[80vw] bg-indigo-600/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -bottom-[20%] -left-[20%] w-[80vw] h-[80vw] bg-purple-600/20 rounded-full blur-[100px]"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">

        {/* Logo Icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="w-24 h-24 mb-8 relative"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20 blur-xl"
          />
          <div className="relative w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-2xl flex items-center justify-center transform rotate-3">
            <span className="text-5xl font-black text-white">Q</span>
          </div>

          {/* Floating Particles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [-10, 10, -10],
                x: [-5, 5, -5],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2 + i,
                repeat: Infinity,
                delay: i * 0.5
              }}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`
              }}
            />
          ))}
        </motion.div>

        {/* Text Logo */}
        <div className="flex items-center gap-1 mb-2 overflow-hidden">
          {['Q', 'U', 'I', 'Z', 'I', 'T', 'O'].map((letter, i) => (
            <motion.span
              key={i}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1, type: "spring" }}
              className="text-4xl md:text-5xl font-black text-white tracking-tight"
            >
              {letter}
            </motion.span>
          ))}
        </div>

        {/* Subtitle / Loading Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-indigo-200 font-medium tracking-wide uppercase text-sm mb-8"
        >
          {text || 'Loading Experience...'}
        </motion.p>

        {/* Loading Bar */}
        <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
