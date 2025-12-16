// src/components/quiz/QuestionNavigation.jsx
import { Check, Bookmark, Flag, Circle } from 'lucide-react';

const QuestionNavigation = ({
    questions,
    currentQuestion,
    answers,
    bookmarked,
    flagged,
    onNavigate
}) => {
    const getQuestionStatus = (index) => {
        if (answers[index] !== undefined && answers[index] !== null) {
            return 'answered';
        }
        if (bookmarked.includes(index)) {
            return 'bookmarked';
        }
        if (flagged.includes(index)) {
            return 'flagged';
        }
        return 'unanswered';
    };

    const getStatusColor = (status, isCurrent) => {
        if (isCurrent) {
            return 'bg-indigo-500 text-white ring-4 ring-indigo-200';
        }

        switch (status) {
            case 'answered':
                return 'bg-green-500 text-white hover:bg-green-600';
            case 'bookmarked':
                return 'bg-amber-500 text-white hover:bg-amber-600';
            case 'flagged':
                return 'bg-red-500 text-white hover:bg-red-600';
            default:
                return 'bg-gray-200 text-gray-700 hover:bg-gray-300';
        }
    };

    const getStatusIcon = (status, isCurrent) => {
        if (isCurrent) return null;

        switch (status) {
            case 'answered':
                return <Check size={14} />;
            case 'bookmarked':
                return <Bookmark size={14} />;
            case 'flagged':
                return <Flag size={14} />;
            default:
                return <Circle size={14} />;
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-lg mb-4">Questions</h3>

            {/* Progress */}
            <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold">
                        {Object.keys(answers).length}/{questions.length}
                    </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-gray-600">Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full" />
                    <span className="text-gray-600">Bookmarked</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="text-gray-600">Flagged</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-200 rounded-full" />
                    <span className="text-gray-600">Unanswered</span>
                </div>
            </div>

            {/* Question Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto">
                {questions.map((_, index) => {
                    const status = getQuestionStatus(index);
                    const isCurrent = index === currentQuestion;

                    return (
                        <button
                            key={index}
                            onClick={() => onNavigate(index)}
                            className={`
                relative aspect-square rounded-lg font-semibold text-sm
                transition-all flex items-center justify-center
                ${getStatusColor(status, isCurrent)}
              `}
                        >
                            {isCurrent ? (
                                <span>{index + 1}</span>
                            ) : (
                                <div className="flex flex-col items-center">
                                    {getStatusIcon(status, isCurrent)}
                                    <span className="text-xs mt-1">{index + 1}</span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Stats */}
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-gray-600">Answered</span>
                    <span className="font-semibold text-green-600">
                        {Object.keys(answers).length}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-600">Bookmarked</span>
                    <span className="font-semibold text-amber-600">
                        {bookmarked.length}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-600">Flagged</span>
                    <span className="font-semibold text-red-600">
                        {flagged.length}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default QuestionNavigation;
