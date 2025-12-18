// src/components/layout/Navbar.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import {
  Home,
  Compass,
  PlusCircle,
  Trophy,
  User,
  LogOut,
  Menu,
  X,
  Zap,
  Moon,
  Sun
} from 'lucide-react'
import LanguageSwitcher from '../common/LanguageSwitcher'
import { useTranslation } from 'react-i18next'

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMenuOpen(false)
  }

  const { t } = useTranslation()

  const navLinks = [
    { name: t('nav.home', 'Home'), path: '/', icon: <Home size={20} /> },
    { name: t('nav.features', 'Features'), path: '/explore', icon: <Compass size={20} /> },
    { name: t('nav.create_quiz', 'Create'), path: '/create-quiz', icon: <PlusCircle size={20} /> },
    { name: t('nav.host', 'Host'), path: '/create-quiz', icon: <Trophy size={20} /> },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#05050A]/80 backdrop-blur-md transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <Zap className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-cyan-400 dark:to-blue-500">
              {t('app.title', 'QUIZITO')}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="flex items-center space-x-2 text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors font-medium"
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Right Section: Theme, Language, Auth */}
          <div className="hidden md:flex items-center space-x-4">

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all hover:scale-110"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-700" />}
            </button>

            <LanguageSwitcher />

            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 pl-4 border-l border-slate-200 dark:border-white/10">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.username}
                      className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-cyan-500/30 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-600 dark:to-blue-600 flex items-center justify-center text-white font-bold border-2 border-white dark:border-cyan-500/30 shadow-sm"
                    style={{ display: user?.profileImage ? 'none' : 'flex' }}
                  >
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-slate-700 dark:text-gray-300">
                    {user?.username}
                  </span>
                </div>
                <Link
                  to="/profile"
                  className="p-2 rounded-lg text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                >
                  <User size={20} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-white/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-2"></div>
                <Link
                  to="/login"
                  className="px-4 py-2 text-slate-600 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-slate-900 dark:bg-gradient-to-r dark:from-cyan-600 dark:to-blue-600 hover:bg-slate-800 dark:hover:from-cyan-500 dark:hover:to-blue-500 text-white text-sm font-bold rounded-lg transition-all hover:scale-105 shadow-md shadow-slate-900/10 dark:shadow-cyan-500/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            {/* Theme Toggle Mobile */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-700" />}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#05050A]">
            <div className="flex flex-col space-y-4 px-2">
              <div className="flex justify-between items-center px-2">
                <LanguageSwitcher />
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-cyan-400 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors font-medium"
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2 p-3 border-t border-slate-100 dark:border-white/10 mt-2">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-white/10"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="w-10 h-10 rounded-full bg-blue-600 dark:bg-cyan-600 flex items-center justify-center text-white font-bold text-lg"
                      style={{ display: user?.profileImage ? 'none' : 'flex' }}
                    >
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{user?.username}</div>
                      <div className="text-xs text-slate-500 dark:text-gray-400">Student Account</div>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-cyan-400 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <User size={20} />
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-red-600 dark:text-red-400 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-white/5 transition-colors text-left w-full"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 mt-4">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full px-4 py-3 text-center text-slate-700 dark:text-gray-300 font-bold border-2 border-slate-200 dark:border-white/10 rounded-xl hover:border-blue-600 dark:hover:border-cyan-500 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full px-4 py-3 text-center bg-blue-600 dark:bg-gradient-to-r dark:from-cyan-600 dark:to-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar