// src/components/quiz/SearchBar.jsx
import { useState, useEffect } from 'react';
import { Search, X, Clock } from 'lucide-react';

const SearchBar = ({ onSearch, placeholder = "Search quizzes..." }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [recentSearches, setRecentSearches] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('recentQuizSearches');
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm) {
                onSearch(searchTerm);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, onSearch]);

    const handleSearch = (value) => {
        setSearchTerm(value);
        if (value.length > 0) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
            onSearch('');
        }
    };

    const handleSearchSubmit = (term) => {
        if (term.trim()) {
            // Add to recent searches
            const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
            setRecentSearches(updated);
            localStorage.setItem('recentQuizSearches', JSON.stringify(updated));

            setSearchTerm(term);
            setShowSuggestions(false);
            onSearch(term);
        }
    };

    const clearSearch = () => {
        setSearchTerm('');
        setShowSuggestions(false);
        onSearch('');
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentQuizSearches');
    };

    return (
        <div className="relative mb-6">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit(searchTerm)}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none text-lg"
                />
                {searchTerm && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Search Suggestions / Recent Searches */}
            {showSuggestions && recentSearches.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-700">Recent Searches</h3>
                            <button
                                onClick={clearRecentSearches}
                                className="text-xs text-red-600 hover:text-red-700"
                            >
                                Clear
                            </button>
                        </div>
                        <div className="space-y-2">
                            {recentSearches.map((search, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSearchSubmit(search)}
                                    className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                >
                                    <Clock size={16} className="text-gray-400" />
                                    <span className="text-gray-700">{search}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
