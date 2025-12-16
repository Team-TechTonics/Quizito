// src/components/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'indigo', text = '', fullScreen = false }) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    indigo: 'border-indigo-600',
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600',
    yellow: 'border-yellow-600',
    purple: 'border-purple-600',
    pink: 'border-pink-600',
    white: 'border-white',
    gray: 'border-gray-600'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`${sizeClasses[size]} ${colorClasses[color]} spinner border-t-transparent rounded-full`}
      ></div>
      {text && (
        <p className={`mt-3 text-${color}-600 font-medium`}>{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
