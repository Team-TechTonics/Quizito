// src/components/auth/Login.jsx
import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const { login, isAuthenticated, user, getDashboardRoute } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isSubmitting) {
      if (user?.role === 'admin') {
        navigate('/admin')
      } else {
        const redirectTo = location.state?.from || '/'
        navigate(redirectTo)
      }
    }
  }, [isAuthenticated, navigate, location, isSubmitting, user])

  // Demo credentials
  const demoAccounts = [
    { email: 'student@quizito.com', password: 'student123', role: 'Student', status: 'active' },
    { email: 'educator@quizito.com', password: 'educator123', role: 'Educator', status: 'active' },
    { email: 'admin@quizito.com', password: 'Admin@07', role: 'Admin', status: 'active' }
  ]

  const validateForm = () => {
    const newErrors = {}

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleDemoLogin = async (demoAccount) => {
    if (demoAccount.status !== 'active') return;

    try {
      setIsSubmitting(true)
      setFormData({
        email: demoAccount.email,
        password: demoAccount.password
      })

      const result = await login(demoAccount.email, demoAccount.password)

      if (result.success) {
        toast.success(`Welcome back, ${demoAccount.role}!`)
        // Redirect to role-specific dashboard
        const dashboardRoute = getDashboardRoute(result.user.role)
        navigate(dashboardRoute)
      }
    } catch (error) {
      toast.error('Demo login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const result = await login(formData.email, formData.password)

      if (result.success) {
        setShowSuccess(true)
        setTimeout(() => {
          // Redirect to role-specific dashboard
          const dashboardRoute = getDashboardRoute(result.user.role)
          navigate(dashboardRoute)
        }, 1500)
      } else {
        toast.error(result.error || 'Login failed')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Column - Brand & Info */}
            <div className="hidden lg:block">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Logo */}
                <Link to="/" className="inline-flex items-center space-x-3 mb-12">
                  <div className="bg-gradient-to-r from-primary-600 to-accent-600 p-3 rounded-2xl">
                    <Zap className="text-white" size={32} />
                  </div>
                  <span className="text-3xl font-bold gradient-text">QUIZITO</span>
                </Link>

                {/* Hero Content */}
                <div className="space-y-8">
                  <h1 className="text-5xl font-bold leading-tight">
                    Welcome Back to
                    <span className="block gradient-text">Learning Adventure</span>
                  </h1>

                  <p className="text-xl text-gray-600">
                    Continue your journey with interactive quizzes, live competitions,
                    and AI-powered learning experiences.
                  </p>

                  {/* Features List */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                        <Sparkles className="text-primary-600" size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold">AI-Powered Quizzes</h4>
                        <p className="text-gray-600 text-sm">Generate quizzes in seconds</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                        <Zap className="text-green-600" size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold">Live Multiplayer</h4>
                        <p className="text-gray-600 text-sm">Compete in real-time with others</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                        <CheckCircle className="text-purple-600" size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold">Progress Tracking</h4>
                        <p className="text-gray-600 text-sm">Monitor your learning journey</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-8 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">10K+</div>
                      <div className="text-sm text-gray-600">Active Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">50K+</div>
                      <div className="text-sm text-gray-600">Quizzes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">99%</div>
                      <div className="text-sm text-gray-600">Satisfaction</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Login Form */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
                {/* Mobile Logo */}
                <div className="lg:hidden mb-8">
                  <Link to="/" className="inline-flex items-center space-x-2">
                    <div className="bg-gradient-to-r from-primary-600 to-accent-600 p-2 rounded-xl">
                      <Zap className="text-white" size={24} />
                    </div>
                    <span className="text-2xl font-bold gradient-text">QUIZITO</span>
                  </Link>
                </div>

                {/* Form Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 mb-4">
                    <LogIn className="text-primary-600" size={32} />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                  <p className="text-gray-600">
                    Sign in to your account to continue
                  </p>
                </div>

                {/* Demo Accounts */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Try demo accounts:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {demoAccounts.map((account, index) => (
                      <button
                        key={index}
                        onClick={() => handleDemoLogin(account)}
                        disabled={isSubmitting || account.status !== 'active'}
                        className={`p-3 border-2 border-gray-200 rounded-xl transition-all relative overflow-hidden text-left
                          ${account.status === 'active'
                            ? 'hover:border-primary-300 hover:bg-primary-50 cursor-pointer'
                            : 'bg-gray-50 border-gray-100 opacity-70 cursor-not-allowed'
                          }
                        `}
                      >
                        {account.status === 'coming_soon' && (
                          <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                            Coming Soon
                          </div>
                        )}
                        {account.status === 'restricted' && (
                          <div className="absolute top-0 right-0 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                            Restricted
                          </div>
                        )}

                        <div className="text-sm font-medium">{account.role}</div>
                        <div className="text-xs text-gray-500 truncate">{account.email}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or sign in with credentials</span>
                  </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={`input-field pl-12 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
                        disabled={isSubmitting}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 text-sm text-red-600 flex items-center space-x-1"
                        >
                          <AlertCircle size={14} />
                          <span>{errors.email}</span>
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                        Password
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className={`input-field pl-12 pr-12 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <AnimatePresence>
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 text-sm text-red-600 flex items-center space-x-1"
                        >
                          <AlertCircle size={14} />
                          <span>{errors.password}</span>
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remember-me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me for 30 days
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary py-4 text-lg font-semibold relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In</span>
                          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[length:200%_100%] animate-shimmer" />
                  </button>

                  {/* OAuth Section */}
                  <div className="mt-8 pt-8 border-t">
                    <p className="text-center text-sm text-gray-600 mb-4">
                      Or sign in with
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:10000'}/api/auth/google`}
                        className="p-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="font-medium">Google</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:10000'}/api/auth/github`}
                        className="p-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        <span className="font-medium">GitHub</span>
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">Don't have an account?</span>
                    </div>
                  </div>

                  {/* Register Link */}
                  <div className="text-center">
                    <Link
                      to="/register"
                      className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold"
                    >
                      <span>Create a free account</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </form>

                {/* Terms & Privacy */}
                <p className="text-center text-xs text-gray-500 mt-8">
                  By signing in, you agree to our{' '}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-700">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-700">
                    Privacy Policy
                  </Link>
                </p>
              </div>

              {/* Success Animation */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-3xl flex items-center justify-center"
                  >
                    <div className="text-center">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 360, 0]
                        }}
                        transition={{ duration: 1 }}
                        className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center"
                      >
                        <CheckCircle className="text-white" size={48} />
                      </motion.div>
                      <h3 className="text-2xl font-bold mb-2">Login Successful!</h3>
                      <p className="text-gray-600">Redirecting to dashboard...</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  )
}

export default Login
