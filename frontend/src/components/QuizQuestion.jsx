import React from 'react';
import PropTypes from 'prop-types';

const QuizQuestion = ({ 
  question, 
  selectedOption, 
  onOptionSelect, 
  disabled,
  showFeedback,
  correctOption,
  userAnswer
}) => {
  const handleOptionClick = (index) => {
    if (!disabled && onOptionSelect) {
      onOptionSelect(index);
    }
  };

  const getOptionClass = (index) => {
    let baseClass = "p-4 rounded-lg border transition-all duration-300 ";
    
    if (showFeedback) {
      const optionLetter = String.fromCharCode(65 + index);
      if (userAnswer === optionLetter) {
        if (correctOption === optionLetter) {
          baseClass += "bg-green-500/20 border-green-500 text-green-300";
        } else {
          baseClass += "bg-red-500/20 border-red-500 text-red-300";
        }
      } else if (correctOption === optionLetter) {
        baseClass += "bg-green-500/10 border-green-500/50 text-green-300";
      } else {
        baseClass += "bg-gray-800/30 border-gray-700 text-gray-400";
      }
    } else if (selectedOption === index) {
      baseClass += "bg-cyan-500/20 border-cyan-500 text-cyan-300";
    } else {
      baseClass += "bg-gray-800/30 border-gray-700 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-white";
    }
    
    if (!disabled && !showFeedback) {
      baseClass += " cursor-pointer hover:scale-[1.02]";
    } else {
      baseClass += " cursor-default";
    }
    
    return baseClass;
  };

  if (!question) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400">Loading question...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Question Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-400">
            {question.category && (
              <span className="px-3 py-1 bg-gray-700 rounded-full mr-2">
                {question.category}
              </span>
            )}
            {question.difficulty && (
              <span className={`px-3 py-1 rounded-full ${
                question.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                question.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                {question.difficulty}
              </span>
            )}
          </div>
        </div>
        
        {/* Question Text */}
        <h2 className="text-2xl md:text-3xl font-bold mb-6 leading-relaxed">
          {question.text}
        </h2>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {question.options && question.options.map((option, index) => (
          <div
            key={index}
            className={getOptionClass(index)}
            onClick={() => handleOptionClick(index)}
          >
            <div className="flex items-center gap-4">
              <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg font-bold ${
                showFeedback 
                  ? (userAnswer === String.fromCharCode(65 + index)
                      ? (correctOption === String.fromCharCode(65 + index)
                          ? 'bg-green-600 text-white'
                          : 'bg-red-600 text-white')
                      : (correctOption === String.fromCharCode(65 + index)
                          ? 'bg-green-600/30 text-green-300'
                          : 'bg-gray-700 text-gray-400'))
                  : (selectedOption === index
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-700 text-gray-300')
              }`}>
                {String.fromCharCode(65 + index)}
              </div>
              <div className="font-medium text-lg">{option.text}</div>
              {showFeedback && correctOption === String.fromCharCode(65 + index) && (
                <div className="ml-auto text-green-400 text-xl">✓</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className="p-6 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">
              {userAnswer === correctOption ? '🎉' : '💡'}
            </div>
            <div className="font-bold text-xl">
              {userAnswer === correctOption ? 'Correct!' : 'Incorrect!'}
            </div>
          </div>
          <div className="text-gray-300">
            {question.explanation || (
              userAnswer === correctOption 
                ? 'Great job! You got it right.'
                : `The correct answer is ${correctOption}.`
            )}
          </div>
        </div>
      )}
    </div>
  );
};

QuizQuestion.propTypes = {
  question: PropTypes.object,
  selectedOption: PropTypes.number,
  onOptionSelect: PropTypes.func,
  disabled: PropTypes.bool,
  showFeedback: PropTypes.bool,
  correctOption: PropTypes.string,
  userAnswer: PropTypes.string
};

export default QuizQuestion;