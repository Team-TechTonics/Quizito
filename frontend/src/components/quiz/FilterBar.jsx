// src/components/quiz/FilterBar.jsx
import { useState } from 'react';
import { Filter, X } from 'lucide-react';

const FilterBar = ({ onFilterChange, activeFilters }) => {
    const [isOpen, setIsOpen] = useState(false);

    const categories = [
        'All', 'Mathematics', 'Science', 'History', 'English',
        'Geography', 'Computer Science', 'Arts', 'Music'
    ];

    const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

    const durations = [
        { label: 'All', value: 'all' },
        { label: 'Quick (<10 min)', value: 'quick' },
        { label: 'Standard (10-30 min)', value: 'standard' },
        { label: 'Marathon (>30 min)', value: 'marathon' }
    ];

    const sortOptions = [
        { label: 'Newest First', value: 'newest' },
        { label: 'Oldest First', value: 'oldest' },
        { label: 'Most Popular', value: 'popular' },
        { label: 'Highest Rated', value: 'rating' },
        { label: 'A-Z', value: 'az' }
    ];

    const handleFilterChange = (filterType, value) => {
        onFilterChange({ ...activeFilters, [filterType]: value });
    };

    const clearFilters = () => {
        onFilterChange({
            category: 'All',
            difficulty: 'All',
            duration: 'all',
            sort: 'newest'
        });
    };

    const hasActiveFilters =
        activeFilters.category !== 'All' ||
        activeFilters.difficulty !== 'All' ||
        activeFilters.duration !== 'all';

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between p-3 bg-gray-100 rounded-xl"
                >
                    <div className="flex items-center space-x-2">
                        <Filter size={20} />
                        <span className="font-semibold">Filters</span>
                        {hasActiveFilters && (
                            <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
                                Active
                            </span>
                        )}
                    </div>
                    <span>{isOpen ? '▲' : '▼'}</span>
                </button>
            </div>

            {/* Filter Content */}
            <div className={`${isOpen ? 'block' : 'hidden'} lg:block space-y-6`}>
                {/* Category Filter */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => handleFilterChange('category', category)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeFilters.category === category
                                        ? 'bg-indigo-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Difficulty Filter */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Difficulty
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {difficulties.map((difficulty) => (
                            <button
                                key={difficulty}
                                onClick={() => handleFilterChange('difficulty', difficulty)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeFilters.difficulty === difficulty
                                        ? difficulty === 'Easy'
                                            ? 'bg-green-500 text-white'
                                            : difficulty === 'Medium'
                                                ? 'bg-amber-500 text-white'
                                                : difficulty === 'Hard'
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-indigo-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {difficulty}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Duration Filter */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Duration
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {durations.map((duration) => (
                            <button
                                key={duration.value}
                                onClick={() => handleFilterChange('duration', duration.value)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeFilters.duration === duration.value
                                        ? 'bg-indigo-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {duration.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sort Options */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Sort By
                    </label>
                    <select
                        value={activeFilters.sort}
                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                        className="w-full md:w-auto px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                    >
                        {sortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <div>
                        <button
                            onClick={clearFilters}
                            className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium"
                        >
                            <X size={18} />
                            <span>Clear All Filters</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FilterBar;
