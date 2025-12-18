
import React, { useState, useEffect } from 'react';

const QuizTimer = ({
  duration,     // Legacy prop (optional)
  totalTime,    // New prop for max duration
  time,         // New prop for current time (controlled mode)
  onTimeUp,
  isPaused = false,
  isActive = true,
  size = 'md'
}) => {
  // Determine mode: Controlled (via 'time' prop) or Internal (via state)
  const isControlled = time !== undefined;

  // Internal state for standalone usage
  const maxTime = totalTime || duration || 60;
  const [internalTimeLeft, setInternalTimeLeft] = useState(maxTime);
  const [isRunning, setIsRunning] = useState(!isPaused && isActive);

  // Use either internal or controlled time
  const currentTime = isControlled ? time : internalTimeLeft;

  // Independent timer logic (only if not controlled)
  useEffect(() => {
    if (isControlled) return;

    let interval;
    if (isRunning && internalTimeLeft > 0) {
      interval = setInterval(() => {
        setInternalTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            if (onTimeUp) onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, internalTimeLeft, onTimeUp, isControlled]);

  // Sync internal state if duration changes (reset)
  useEffect(() => {
    if (!isControlled) {
      setInternalTimeLeft(maxTime);
    }
  }, [maxTime, isControlled]);

  const formatTime = (seconds) => {
    if (seconds === undefined || seconds === null) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return (currentTime / maxTime) * 100;
  };

  const getTimerColor = () => {
    const ratio = currentTime / maxTime;
    if (ratio > 0.5) return '#22c55e'; // green-500
    if (ratio > 0.25) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
  };

  // Size classes
  const sizeClasses = {
    sm: "w-10 h-10 text-xs",
    md: "w-20 h-20 text-lg",
    lg: "w-32 h-32 text-2xl"
  };

  return (
    <div className="flex items-center gap-4">
      <div className={`relative rounded-full flex items-center justify-center font-bold bg-white shadow-sm border-2 ${sizeClasses[size] || sizeClasses.md}`}
        style={{ borderColor: getTimerColor() }}
      >
        <span style={{ color: getTimerColor() }}>
          {formatTime(currentTime)}
        </span>

        {/* SVG Progress Circle (Optional visual flair) */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none opacity-20">
          <circle
            cx="50%"
            cy="50%"
            r="40%"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray="100 200"
            color={getTimerColor()}
          />
        </svg>
      </div>

      {/* Show detailed info only if not small */}
      {size !== 'sm' && (
        <div className="text-sm text-gray-600">
          <p className="font-medium">Remaining: {formatTime(currentTime)}</p>
          {!isControlled && (
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="text-xs text-blue-500 hover:underline mt-1"
            >
              {isRunning ? 'Pause' : 'Resume'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizTimer;
