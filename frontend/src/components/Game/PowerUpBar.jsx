import React from 'react';
import { motion } from 'framer-motion';

const PowerUpBar = ({ powerUps, onUse, disabled }) => {
    const items = [
        { id: '50-50', label: '50/50', icon: '✂️', key: 'fiftyFifty', tooltip: 'Remove 2 wrong answers' },
        { id: 'time-freeze', label: 'Freeze', icon: '❄️', key: 'timeFreeze', tooltip: 'Stop timer for 10s' },
        { id: 'double-points', label: '2x', icon: '⚡', key: 'doublePoints', tooltip: 'Double points for this question' }
    ];

    return (
        <div className="flex gap-4 justify-center py-6 mt-4 border-t border-white/10">
            {items.map((item) => {
                const count = powerUps[item.key] || 0;
                return (
                    <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.1, translateY: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onUse(item.id)}
                        disabled={disabled || count <= 0}
                        title={item.tooltip}
                        className={`
              relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl
              ${count > 0 && !disabled
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg cursor-pointer hover:shadow-indigo-500/50 ring-2 ring-white/20'
                                : 'bg-slate-700/50 cursor-not-allowed opacity-50 grayscale ring-1 ring-white/5'}
              transition-all
            `}
                    >
                        <span className="text-2xl mb-1 filter drop-shadow-sm">{item.icon}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white shadow-black drop-shadow-md">{item.label}</span>

                        {/* Count Badge */}
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-sm z-10">
                            {count}
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
};

export default PowerUpBar;
