// src/pages/Home.jsx
import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useQuiz } from '../context/QuizContext'
import { useTheme } from '../context/ThemeContext'
import {
  Zap,
  Rocket,
  Brain,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Target,
  Globe,
  BookOpen,
  Play,
  ChevronRight,
  ChevronDown,
  Sun,
  Moon,
  X,
  Award,
  Users,
  Lightbulb,
  Trophy,
  Star,
  Flame,
  GraduationCap,
  Sparkle,
  Cpu
} from 'lucide-react'
import QuizCard from '../components/quiz/QuizCard'
import Button from '../components/common/Button'
import InteractiveCursor from '../components/ui/InteractiveCursor'
import QuantumQuizModel from '../components/3d/QuantumQuizModel'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'

const Home = () => {
  const { t } = useTranslation()
  const { isAuthenticated, loginWithToken, user } = useAuth()
  const { quizzes, fetchQuizzes } = useQuiz()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [featuredQuizzes, setFeaturedQuizzes] = useState([])
  const [scrolled, setScrolled] = useState(false)
  const [userStats, setUserStats] = useState({ rank: '#42', streak: 5, points: 1250 })
  const [showThemePopup, setShowThemePopup] = useState(false)

  const featuresRef = useRef(null)
  const ctaRef = useRef(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (token) {
      loginWithToken(token);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      navigate('/login?error=' + error);
    }

    fetchQuizzes()

    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)

    const timer = setTimeout(() => {
      if (theme === 'dark' && !sessionStorage.getItem('themePromptDismissed')) {
        setShowThemePopup(true)
      }
    }, 3000)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(timer)
    }
  }, [theme])

  useEffect(() => {
    if (quizzes.length > 0) {
      setFeaturedQuizzes(quizzes.slice(0, 6))
    }
  }, [quizzes])

  const scrollToSection = (sectionRef) => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const dismissPopup = () => {
    setShowThemePopup(false);
    sessionStorage.setItem('themePromptDismissed', 'true');
  }

  const switchToLight = () => {
    if (theme === 'dark') {
      toggleTheme();
    }
    dismissPopup();
  }

  const features = [
    {
      icon: <Brain className="w-7 h-7" />,
      title: 'AI-Powered Intelligence',
      titleHindi: 'कृत्रिम बुद्धिमत्ता',
      description: 'Advanced algorithms adapt to your learning pace, just like a personal guru',
      gradient: 'from-orange-500 via-amber-500 to-yellow-500',
      delay: 0.1
    },
    {
      icon: <Flame className="w-7 h-7" />,
      title: 'Live Knowledge Battles',
      titleHindi: 'सीधा प्रतियोगिता',
      description: 'Compete in real-time quiz battles inspired by ancient scholarly debates',
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      delay: 0.2
    },
    {
      icon: <Target className="w-7 h-7" />,
      title: 'Deep Analytics',
      titleHindi: 'गहन विश्लेषण',
      description: 'Track your progress with insights as precise as Vedic mathematics',
      gradient: 'from-purple-500 via-violet-500 to-indigo-500',
      delay: 0.3
    },
    {
      icon: <Trophy className="w-7 h-7" />,
      title: 'Achievement System',
      titleHindi: 'उपलब्धि प्रणाली',
      description: 'Earn badges and climb ranks in your journey to become a scholar',
      gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
      delay: 0.4
    },
  ]

  const stats = [
    { value: '2.37L+', label: 'Active Scholars', labelHindi: 'सक्रिय विद्यार्थी', icon: <Users className="w-6 h-6" />, gradient: 'from-orange-500 to-amber-600' },
    { value: '94.2%', label: 'Success Rate', labelHindi: 'सफलता दर', icon: <Award className="w-6 h-6" />, gradient: 'from-emerald-500 to-teal-600' },
    { value: '42L', label: 'Questions Solved', labelHindi: 'प्रश्न हल', icon: <Lightbulb className="w-6 h-6" />, gradient: 'from-purple-500 to-indigo-600' },
    { value: '28', label: 'Indian States', labelHindi: 'भारतीय राज्य', icon: <Globe className="w-6 h-6" />, gradient: 'from-pink-500 to-rose-600' },
  ]

  const testimonials = [
    {
      quote: "एक शानदार मंच! AI से बनाए गए प्रश्न मेरी समझ को सच में परखते हैं।",
      quoteEn: "A fantastic platform! AI-generated questions truly test my understanding.",
      author: "Priya Sharma",
      role: "NEET Aspirant, Delhi",
      avatar: "PS",
      gradient: "from-orange-400 to-amber-500"
    },
    {
      quote: "Real-time multiplayer makes learning fun and competitive. Loving it!",
      quoteEn: "The live battles remind me of competitive exams but way more engaging!",
      author: "Arjun Patel",
      role: "JEE Preparation, Mumbai",
      avatar: "AP",
      gradient: "from-emerald-400 to-teal-500"
    },
    {
      quote: "मैं अपनी कक्षा के लिए हर हफ्ते इसका उपयोग करती हूं। बहुत उपयोगी!",
      quoteEn: "I use this every week for my classroom. Incredibly useful!",
      author: "Kavita Reddy",
      role: "School Teacher, Bangalore",
      avatar: "KR",
      gradient: "from-purple-400 to-indigo-500"
    }
  ]

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-white to-emerald-50 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors duration-700">
      <InteractiveCursor />

      {/* Indian Pattern Background - Mandala Inspired */}
      <div className="fixed inset-0 pointer-events-none opacity-5 dark:opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ibWFuZGFsYSIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iODAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjEiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjYwIiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIxIi8+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMSIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjbWFuZGFsYSkiLz48L3N2Zz4=')] opacity-30"></div>
      </div>

      {/* Gradient Orbs - Indian Flag Colors */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-orange-400/20 to-amber-500/20 dark:from-orange-500/10 dark:to-amber-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-emerald-400/20 to-teal-500/20 dark:from-emerald-500/10 dark:to-teal-600/10 rounded-full blur-3xl animate-float animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-br from-indigo-400/15 to-purple-500/15 dark:from-indigo-500/10 dark:to-purple-600/10 rounded-full blur-3xl animate-float animation-delay-4000"></div>
      </div>

      {/* Theme Notification */}
      <AnimatePresence>
        {showThemePopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm"
          >
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border-2 border-orange-200/50 dark:border-orange-500/20">
              <button onClick={dismissPopup} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30">
                  <Sun size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">दिन मोड आज़माएं?</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Try Day Mode?</p>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-sm mb-5 leading-relaxed">
                Switch to a brighter theme for enhanced focus during study sessions
              </p>

              <div className="flex gap-2">
                <button
                  onClick={switchToLight}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40"
                >
                  Switch Theme
                </button>
                <button
                  onClick={dismissPopup}
                  className="px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white rounded-xl font-semibold text-sm transition"
                >
                  Later
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Theme Toggle */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={toggleTheme}
        className="fixed top-24 right-6 z-40 group"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition"></div>
          <div className="relative bg-white dark:bg-slate-800 border-2 border-orange-200/50 dark:border-orange-500/30 p-3.5 rounded-2xl backdrop-blur-xl hover:scale-110 transition-all duration-300 shadow-xl">
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600" />
            )}
          </div>
        </div>
      </motion.button>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-emerald-500/10 border-2 border-orange-300/50 dark:border-orange-500/30 px-5 py-2.5 rounded-full mb-8 backdrop-blur-sm shadow-lg shadow-orange-200/50 dark:shadow-orange-500/20"
            >
              <Star className="w-5 h-5 text-orange-600 dark:text-orange-400 fill-current" />
              <span className="text-sm font-bold bg-gradient-to-r from-orange-600 to-emerald-600 dark:from-orange-400 dark:to-emerald-400 bg-clip-text text-transparent">
                भारत का अग्रणी AI शिक्षा मंच • India's Leading AI Learning Platform
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-[1.1]">
              <span className="block bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent mb-3">
                ज्ञान की यात्रा
              </span>
              <span className="block text-4xl md:text-6xl lg:text-7xl bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-600 dark:from-orange-400 dark:via-amber-400 dark:to-emerald-400 bg-clip-text text-transparent">
                Journey of Knowledge
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto mb-12 leading-relaxed font-medium">
              Transform your learning with AI-powered quizzes. Built for Indian students, inspired by ancient wisdom,
              <span className="block mt-2 text-orange-600 dark:text-orange-400 font-bold">
                powered by modern technology • आधुनिक तकनीक से संचालित
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/register')}
                className="group relative px-10 py-5 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 dark:from-orange-500 dark:via-amber-500 dark:to-orange-500 rounded-2xl font-black text-lg overflow-hidden shadow-2xl shadow-orange-500/40 text-white"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity"></div>
                <span className="relative flex items-center gap-3">
                  <GraduationCap className="w-6 h-6" />
                  शुरू करें • Start Free
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollToSection(featuresRef)}
                className="px-10 py-5 bg-white/80 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10 border-2 border-orange-200 dark:border-orange-500/30 rounded-2xl font-bold text-lg backdrop-blur-sm transition-all text-slate-800 dark:text-white shadow-lg"
              >
                <span className="flex items-center gap-3">
                  विशेषताएँ • Features
                  <Sparkle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </span>
              </motion.button>
            </div>
          </motion.div>

          {/* Stats with Indian Number Format */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative bg-white/70 dark:bg-white/5 border-2 border-orange-200/50 dark:border-white/10 rounded-3xl p-8 backdrop-blur-xl hover:border-orange-300 dark:hover:border-orange-500/30 transition-all shadow-lg hover:shadow-2xl hover:shadow-orange-200/50 dark:hover:shadow-orange-500/20"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/5 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition"></div>

                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-xl`}>
                  {React.cloneElement(stat.icon, { className: 'w-6 h-6 text-white' })}
                </div>

                <div className="text-4xl font-black mb-2 bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{stat.label}</div>
                <div className="text-xs font-semibold text-orange-600 dark:text-orange-400">{stat.labelHindi}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3D Hologram Section - RESTORED */}
      <section className="relative py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wider mb-4"
            >
              त्रि-आयामी • 3D Visualization
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
            >
              Interactive Holograms
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto"
            >
              Visualize complex concepts with our quantum 3D models
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-slate-900 to-indigo-900 dark:from-black dark:to-indigo-950 rounded-[3rem] overflow-hidden shadow-2xl border-2 border-indigo-500/20 min-h-[500px] flex items-center justify-center"
          >
            <div className="absolute inset-0 z-0">
              <QuantumQuizModel />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none z-10 backdrop-blur-sm">
              <div className="flex justify-center gap-8 text-white/70 font-medium text-sm">
                <span className="flex items-center gap-2">
                  <Cpu size={16} /> Neural Render
                </span>
                <span className="flex items-center gap-2">
                  <ArrowRight size={16} /> Drag to Rotate
                </span>
                <span className="flex items-center gap-2">
                  <Sparkles size={16} /> WebGL Powered
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="relative py-28 px-6 bg-gradient-to-b from-transparent via-orange-50/30 to-transparent dark:via-orange-950/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-orange-600 dark:text-orange-400 font-bold text-sm uppercase tracking-wider mb-4"
            >
              प्रमुख विशेषताएं • Premium Features
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
            >
              Why Quizito Stands Apart
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto"
            >
              Combining cutting-edge AI with time-tested educational principles
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: feature.delay }}
                whileHover={{ y: -12, scale: 1.03 }}
                className="group relative bg-white/80 dark:bg-white/5 border-2 border-orange-100 dark:border-white/10 rounded-3xl p-10 hover:border-orange-300 dark:hover:border-orange-500/30 transition-all overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-orange-200/50 dark:hover:shadow-orange-500/20"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>

                <div className={`relative w-20 h-20 rounded-3xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-2xl`}>
                  {React.cloneElement(feature.icon, { className: 'w-7 h-7 text-white' })}
                </div>

                <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-sm font-bold text-orange-600 dark:text-orange-400 mb-4">{feature.titleHindi}</p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">{feature.description}</p>

                <div className={`h-1.5 w-16 bg-gradient-to-r ${feature.gradient} rounded-full group-hover:w-full transition-all duration-500`}></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Quizzes */}
      <section className="relative py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-16">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-orange-600 dark:text-orange-400 mb-3 uppercase tracking-wider">
                <Flame className="w-5 h-5 fill-current" />
                ट्रेंडिंग अभी • Trending Now
              </div>
              <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-3">लोकप्रिय क्विज़ • Popular Quizzes</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">Top-rated challenges from our community</p>
            </div>
            <Link
              to="/explore"
              className="hidden md:flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-bold group transition text-lg"
            >
              सभी देखें • View All
              <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredQuizzes.length > 0 ? (
              featuredQuizzes.slice(0, 3).map((quiz, i) => (
                <motion.div
                  key={quiz._id || i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <QuizCard quiz={quiz} featured />
                </motion.div>
              ))
            ) : (
              [1, 2, 3].map(i => (
                <div key={i} className="h-96 bg-white/40 dark:bg-white/5 rounded-3xl animate-pulse border-2 border-orange-100 dark:border-white/10"></div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-28 px-6 bg-gradient-to-b from-transparent via-emerald-50/30 to-transparent dark:via-emerald-950/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-4">विद्यार्थियों की आवाज़ • Student Stories</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">From aspirants across India</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -8 }}
                className="group relative bg-white/80 dark:bg-white/5 border-2 border-orange-100 dark:border-white/10 p-10 rounded-3xl hover:border-orange-300 dark:hover:border-orange-500/30 transition-all backdrop-blur-sm shadow-xl hover:shadow-2xl"
              >
                <div className="absolute top-6 right-6 text-6xl font-serif text-orange-200/50 dark:text-orange-500/20">"</div>

                <p className="relative italic text-slate-700 dark:text-slate-300 mb-4 leading-relaxed font-medium z-10">
                  {t.quote}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 italic">{t.quoteEn}</p>

                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.gradient} flex items-center justify-center font-black text-lg text-white shadow-lg`}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-lg">{t.author}</div>
                    <div className="text-sm text-orange-600 dark:text-orange-400 font-semibold">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Code CTA */}
      <section className="relative py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-white/90 to-white/70 dark:from-white/10 dark:to-white/5 border-2 border-orange-200 dark:border-orange-500/20 rounded-[3rem] p-16 overflow-hidden backdrop-blur-xl shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-emerald-400/20 dark:from-orange-500/20 dark:to-emerald-500/20 rounded-full blur-3xl"></div>

            <div className="relative text-center">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-500/10 dark:to-teal-500/10 border-2 border-emerald-300 dark:border-emerald-500/20 px-5 py-2 rounded-full mb-8">
                <Play className="w-5 h-5 text-emerald-700 dark:text-emerald-400 fill-current" />
                <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">लाइव बैटल • LIVE BATTLE</span>
              </div>

              <h2 className="text-5xl font-black mb-5 text-slate-900 dark:text-white">गेम कोड है? • Got a Game Code?</h2>
              <p className="text-2xl text-slate-600 dark:text-slate-300 mb-10 font-medium">
                तुरंत शामिल हों • Join your friends instantly
              </p>

              <div className="flex gap-4 max-w-2xl mx-auto">
                <input
                  type="text"
                  placeholder="CODE"
                  maxLength={6}
                  className="flex-1 bg-white dark:bg-white/5 border-3 border-orange-300 dark:border-orange-500/30 focus:border-orange-500 dark:focus:border-orange-400 rounded-2xl px-8 py-6 text-center font-black text-3xl tracking-[0.3em] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 outline-none transition-all uppercase backdrop-blur-sm shadow-inner"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.length >= 4) {
                      navigate(`/join/${e.target.value.trim()}`)
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = e.target.previousSibling;
                    if (input.value.length >= 4) navigate(`/join/${input.value.trim()}`)
                  }}
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 px-12 py-6 rounded-2xl font-black text-xl transition-all shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/60 text-white"
                >
                  JOIN
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section ref={ctaRef} className="relative py-32 px-6 bg-gradient-to-b from-transparent via-orange-50/50 to-transparent dark:via-orange-950/20">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
              <span className="block bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
                तैयार हैं?
              </span>
              <span className="block bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-600 dark:from-orange-400 dark:via-amber-400 dark:to-emerald-400 bg-clip-text text-transparent">
                Ready to Excel?
              </span>
            </h2>
            <p className="text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
              Join 2.37 lakh+ students across 28 states conquering 42 lakh questions daily
            </p>

            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/register')}
              className="group relative px-14 py-6 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 rounded-3xl font-black text-2xl overflow-hidden shadow-2xl shadow-orange-500/50 text-white"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity"></div>
              <span className="relative flex items-center gap-4">
                <GraduationCap className="w-7 h-7" />
                अभी शुरू करें • Start Your Journey
                <Sparkles className="w-7 h-7" />
              </span>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Scroll to Top */}
      <AnimatePresence>
        {scrolled && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-orange-600 to-amber-600 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/40 hover:scale-110 transition-all group z-40"
          >
            <ChevronDown className="w-7 h-7 text-white rotate-180 group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -40px) rotate(3deg); }
          66% { transform: translate(-20px, 20px) rotate(-3deg); }
        }
        .animate-float {
          animation: float 20s infinite ease-in-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

export default Home
