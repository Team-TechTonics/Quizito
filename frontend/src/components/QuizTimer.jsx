
import React, { useState, useEffect } from 'react';

const QuizTimer = ({ duration = 60, onTimeUp, isPaused = false }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(!isPaused);

  useEffect(() => {
    let interval;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
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
  }, [isRunning, timeLeft, onTimeUp]);

  useEffect(() => {
    setIsRunning(!isPaused);
  }, [isPaused]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return (timeLeft / duration) * 100;
  };

  const getTimerColor = () => {
    if (timeLeft > duration / 2) return 'green';
    if (timeLeft > duration / 4) return 'orange';
    return 'red';
  };

  return (
    <div className="quiz-timer-container">
      <div className="timer-display">
        <div 
          className="timer-circle"
          style={{
            borderColor: getTimerColor(),
            background: `conic-gradient(${getTimerColor()} ${getProgress()}%, #eee ${getProgress()}%)`
          }}
        >
          <span className="timer-text">{formatTime(timeLeft)}</span>
        </div>
      </div>
      
      <div className="timer-controls">
        <button 
          onClick={() => setIsRunning(!isRunning)}
          className="control-button"
        >
          {isRunning ? 'Pause' : 'Resume'}
        </button>
        <button 
          onClick={() => {
            setTimeLeft(duration);
            setIsRunning(true);
          }}
          className="control-button reset-button"
        >
          Reset
        </button>
      </div>
      
      <div className="timer-info">
        <p>Time Remaining: {formatTime(timeLeft)}</p>
        <p>Total Duration: {formatTime(duration)}</p>
      </div>
    </div>
  );
};

export default QuizTimer;
