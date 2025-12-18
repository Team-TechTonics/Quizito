// src/components/layout/Navbar.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Home,
  Compass,
  PlusCircle,
  Trophy,
  User,
  LogOut,
  Menu,
  X,
  Zap
} from 'lucide-react'
import LanguageSwitcher from '../common/LanguageSwitcher'
import { useTranslation } from 'react-i18next'

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
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
    <nav className="glass-effect sticky top-0 z-50 w-full border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-primary-600 to-accent-600 p-2 rounded-lg">
              <Zap className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold gradient-text">{t('app.title', 'QUIZITO')}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                {link.icon}
                <span className="font-medium">{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Language Switcher & Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />

            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2">
                  <img
                    src={user?.profileImage}
                    alt={user?.username}
                    className="w-8 h-8 rounded-full border-2 border-primary-200"
                  />
                  <span className="font-medium text-gray-700">
                    {user?.username}
                  </span>
                </div>
                <Link
                  to="/profile"
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <User size={20} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-primary-600 font-medium hover:text-primary-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary px-6 py-2 text-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <div className="px-2">
                <LanguageSwitcher />
              </div>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {link.icon}
                  <span className="font-medium">{link.name}</span>
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2 p-2">
                    <img
                      src={user?.profileImage}
                      alt={user?.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-medium">{user?.username}</span>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <User size={20} />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 text-center text-primary-600 font-medium border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 text-center bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar