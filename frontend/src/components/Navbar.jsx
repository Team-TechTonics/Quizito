// src/components/Navbar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Brain, Trophy, Home, UserPlus, Settings,
  LogIn, LogOut, Bell, User, Sparkles
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

// Default export - this is what App.jsx expects
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  // Get user from localStorage (temporary until QuizContext is fixed)
  const user = JSON.parse(localStorage.getItem('quizito_user')) || null;
  const token = localStorage.getItem('quizito_token') || null;

  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={20} /> },
    { path: '/create', label: 'Create', icon: <Brain size={20} /> },
    { path: '/join', label: 'Join', icon: <UserPlus size={20} /> },
    { path: '/admin', label: 'Dashboard', icon: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('quizito_token');
    localStorage.removeItem('quizito_user');
    setShowDropdown(false);
    toast.success('Logged out successfully');
    navigate('/');
    window.location.reload(); // Refresh to update state
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <Brain className="relative text-indigo-600" size={32} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Quizito
              </span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${token ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-xs text-gray-500">{token ? 'Connected' : 'Offline'}</span>
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 rounded-lg group ${location.pathname === item.path
                  ? 'text-indigo-600'
                  : 'text-gray-600 hover:text-indigo-500'
                  }`}
              >
                <div className="flex items-center space-x-2 transition-all duration-300">
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </div>
                {location.pathname === item.path && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <div className="space-y-1.5" aria-hidden="true">
                <span className={`block w-6 h-0.5 bg-current transition-transform ${showDropdown ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`block w-6 h-0.5 bg-current transition-opacity ${showDropdown ? 'opacity-0' : ''}`}></span>
                <span className={`block w-6 h-0.5 bg-current transition-transform ${showDropdown ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>

          {/* Right Section (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={22} aria-hidden="true" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <Link to="/leaderboard/global" className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200 hover:shadow-md transition-shadow">
              <Trophy className="text-yellow-600" size={20} />
              <span className="font-semibold text-yellow-700">Top 10</span>
            </Link>

            {/* User Section */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 hover:shadow-md transition-all"
                  aria-label="User menu"
                  aria-expanded={showDropdown}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800 text-sm">{user.name || 'User'}</p>
                    <p className="text-xs text-gray-500">Profile</p>
                  </div>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 font-semibold"
                >
                  <LogIn size={18} />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Dropdown (Desktop) */}
              {showDropdown && user && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="block w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-2"
                    onClick={() => setShowDropdown(false)}
                  >
                    <User size={18} />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/create"
                    className="block w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-2"
                    onClick={() => setShowDropdown(false)}
                  >
                    <Brain size={18} />
                    <span>Create Quiz</span>
                  </Link>
                  <Link
                    to="/admin"
                    className="block w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-2"
                    onClick={() => setShowDropdown(false)}
                  >
                    <Settings size={18} />
                    <span>Dashboard</span>
                  </Link>
                  <div className="border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {showDropdown && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-in slide-in-from-top-2">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowDropdown(false)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg ${location.pathname === item.path
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}

              <div className="border-t border-gray-100 my-2 pt-2">
                {user ? (
                  <>
                    <div className="px-4 py-2 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <Link to="/profile" onClick={() => setShowDropdown(false)} className="flex items-center space-x-2 px-4 py-3 text-gray-600 hover:bg-gray-50">
                      <User size={20} />
                      <span>Profile</span>
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50">
                      <LogOut size={20} />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center justify-center space-x-2 mx-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg"
                  >
                    <LogIn size={20} />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// ✅ CRITICAL: This is what makes it work with "import Navbar from './components/Navbar'"
export default Navbar;
