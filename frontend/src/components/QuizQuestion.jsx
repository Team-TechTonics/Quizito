import React from 'react';
import PropTypes from 'prop-types';

const QuizQuestion = ({
  question,
  selectedOption,
  onOptionSelect,
  // flexible support for either prop name
  onAnswerSelect,
  onSubmit,
  disabled,
  showFeedback,
  answerSubmitted,
  correctOption,
  userAnswer
}) => {
  // Handle prop mismatch
  const handleSelect = onOptionSelect || onAnswerSelect;

  // DEBUG LOGGING
  React.useEffect(() => {
    console.log('QuizQuestion Props:', {
      questionId: question?._id || 'unknown',
      onOptionSelect: !!onOptionSelect,
      onAnswerSelect: !!onAnswerSelect,
      handleSelect: !!handleSelect,
      disabled,
      answerSubmitted
    });
  }, [question, onOptionSelect, onAnswerSelect, disabled, answerSubmitted]);

  const handleOptionClick = (index) => {
    console.log(`Option clicked: ${index}`, {
      disabled,
      answerSubmitted,
      hasHandler: !!handleSelect
    });

    if ((!disabled && !answerSubmitted) && handleSelect) {
      handleSelect(index);
    } else {
      console.warn('Click ignored due to disabled state or missing handler');
    }
  };

  const getOptionClass = (index) => {
    let baseClass = "p-4 rounded-lg border transition-all duration-300 ";

    if (showFeedback || answerSubmitted) {
      const optionLetter = String.fromCharCode(65 + index);
      // If we have detailed feedback props
      if (userAnswer && correctOption) {
        if (userAnswer === optionLetter) {
          if (correctOption === optionLetter) {
            baseClass += "bg-green-500/20 border-green-500 text-green-700";
          } else {
            baseClass += "bg-red-500/20 border-red-500 text-red-700";
          }
        } else if (correctOption === optionLetter) {
          baseClass += "bg-green-500/10 border-green-500/50 text-green-700";
        } else {
          baseClass += "bg-gray-100 border-gray-200 text-gray-400";
        }
      } else {
        // Simple selected state if waiting for results
        if (selectedOption === index) {
          baseClass += "bg-blue-600 text-white border-blue-600";
        } else {
          baseClass += "bg-gray-100 border-gray-200 text-gray-400";
        }
      }
    } else if (selectedOption === index) {
      baseClass += "bg-blue-600 border-blue-600 text-white shadow-md scale-[1.02]";
    } else {
      baseClass += "bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-700";
    }

    if (!disabled && !answerSubmitted && !showFeedback) {
      baseClass += " cursor-pointer hover:shadow-sm";
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
          <div className="text-sm text-gray-500">
            {question.category && (
              <span className="px-3 py-1 bg-gray-100 rounded-full mr-2">
                {question.category}
              </span>
            )}
            {question.difficulty && (
              <span className={`px-3 py-1 rounded-full ${question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                {question.difficulty}
              </span>
            )}
          </div>
        </div>

        {/* Question Text */}
        <h2 className="text-2xl md:text-3xl font-bold mb-6 leading-relaxed text-gray-800">
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
              <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors ${(showFeedback || answerSubmitted)
                ? (userAnswer === String.fromCharCode(65 + index)
                  ? (correctOption === String.fromCharCode(65 + index)
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 text-white')
                  : (correctOption === String.fromCharCode(65 + index)
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-500'))
                : (selectedOption === index
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-500')
                }`}>
                {String.fromCharCode(65 + index)}
              </div>
              <div className="font-medium text-lg">{option.text || option}</div> {/* Handle both object and string options */}
              {(showFeedback || answerSubmitted) && correctOption === String.fromCharCode(65 + index) && (
                <div className="ml-auto text-green-500 text-xl">✓</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      {!showFeedback && !answerSubmitted && (
        <div className="flex justify-end mt-6">
          <button
            onClick={onSubmit}
            disabled={selectedOption === null || disabled}
            className={`px-8 py-3 rounded-xl font-bold text-lg transition-all transform ${selectedOption !== null && !disabled
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-1'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            Submit Answer
          </button>
        </div>
      )}

      {/* Feedback */}
      {(showFeedback || (answerSubmitted && !onSubmit)) && (
        <div className="p-6 rounded-xl bg-blue-50 border border-blue-100 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">
              {userAnswer === correctOption ? '🎉' : '💡'}
            </div>
            <div className="font-bold text-xl text-gray-800">
              {userAnswer === correctOption ? 'Correct!' : 'Incorrect!'}
            </div>
          </div>
          <div className="text-gray-600">
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
  onAnswerSelect: PropTypes.func, // Added fallback
  onSubmit: PropTypes.func, // Added
  disabled: PropTypes.bool,
  showFeedback: PropTypes.bool,
  answerSubmitted: PropTypes.bool, // Added
  correctOption: PropTypes.string,
  userAnswer: PropTypes.string
};

export default QuizQuestion;