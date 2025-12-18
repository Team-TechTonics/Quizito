// src/pages/Home.jsx
import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useQuiz } from '../context/QuizContext'
import {
  Zap,
  Users,
  Rocket,
  Brain,
  TrendingUp,
  Shield,
  Sparkles,
  ArrowRight,
  Crown,
  Trophy,
  Target,
  Star,
  Globe,
  CloudLightning,
  BarChart3,
  Clock,
  Users2,
  ChevronDown,
  Play,
  Award,
  Cpu,
  Eye,
  MessageSquare
} from 'lucide-react'
import QuizCard from '../components/quiz/QuizCard'
import Button from '../components/common/Button'
import QuizitoModel from '../components/3d/QuizitoModel'
import InteractiveCursor from '../components/ui/InteractiveCursor'
import QuantumQuizModel from '../components/3d/QuantumQuizModel';
import { useTranslation } from 'react-i18next'

const Home = () => {
  const { t } = useTranslation()
  const { isAuthenticated, loginWithToken } = useAuth()
  const { quizzes, fetchQuizzes } = useQuiz()
  const navigate = useNavigate()
  const [featuredQuizzes, setFeaturedQuizzes] = useState([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrolled, setScrolled] = useState(false)
  const [textRevealed, setTextRevealed] = useState(false)

  // Refs for smooth scrolling[citation:8]
  const featuresRef = useRef(null)
  const quizzesRef = useRef(null)
  const ctaRef = useRef(null)

  useEffect(() => {
    // Check for token in URL (OAuth callback)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (token) {
      loginWithToken(token);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      navigate('/login?error=' + error);
    }

    fetchQuizzes()

    // Handle scroll for navbar effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (quizzes.length > 0) {
      setFeaturedQuizzes(quizzes.slice(0, 6))
    }
  }, [quizzes])

  const handleMouseMove = (e) => {
    setMousePosition({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight
    })
  }

  // Smooth scroll function[citation:8]
  const scrollToSection = (sectionRef) => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  // Interactive text reveal effect inspired by[citation:7]
  useEffect(() => {
    const timer = setTimeout(() => {
      setTextRevealed(true)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // Full page background style[citation:1][citation:6]
  const heroBackgroundStyle = {
    backgroundImage: `url('/hero-gradient.jpg')`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    width: '100vw',
    minHeight: '100vh'
  }

  const features = [
    {
      icon: <Cpu className="text-white" size={28} />,
      title: t('home.features.neural_engine.title', 'Neural Quiz Engine'),
      description: t('home.features.neural_engine.desc', 'AI that understands context and adapts difficulty in real-time'),
      color: 'from-indigo-500 to-purple-600',
      gradient: 'bg-gradient-to-br from-indigo-500/10 to-purple-600/10',
      stats: 'IQ-Adjusted',
      delay: '100ms'
    },
    {
      icon: <CloudLightning className="text-white" size={28} />,
      title: t('home.features.zero_lag.title', 'Zero-Lag Sessions'),
      description: t('home.features.zero_lag.desc', 'Sub-50ms response time for seamless global competitions'),
      color: 'from-cyan-500 to-blue-600',
      gradient: 'bg-gradient-to-br from-cyan-500/10 to-blue-600/10',
      stats: '50ms Response',
      delay: '200ms'
    },
    {
      icon: <Eye className="text-white" size={28} />,
      title: t('home.features.analytics.title', 'Predictive Analytics'),
      description: t('home.features.analytics.desc', 'Anticipate learning gaps before they become obstacles'),
      color: 'from-emerald-500 to-green-600',
      gradient: 'bg-gradient-to-br from-emerald-500/10 to-green-600/10',
      stats: 'Pre-emptive Insights',
      delay: '300ms'
    },
    {
      icon: <MessageSquare className="text-white" size={28} />,
      title: t('home.features.collaborative.title', 'Collaborative Quizzing'),
      description: t('home.features.collaborative.desc', 'Team-based challenges with synchronized problem-solving'),
      color: 'from-amber-500 to-orange-600',
      gradient: 'bg-gradient-to-br from-amber-500/10 to-orange-600/10',
      stats: 'Synced Teams',
      delay: '400ms'
    },
  ]

  const stats = [
    { value: '237K+', label: t('home.stats.sessions', 'Knowledge Sessions'), icon: <Play />, color: 'text-cyan-300' },
    { value: '89.4%', label: t('home.stats.retention', 'Retention Boost'), icon: <Brain />, color: 'text-emerald-300' },
    { value: '4.2M', label: t('home.stats.questions', 'Questions Answered'), icon: <Target />, color: 'text-amber-300' },
    { value: '154', label: t('home.stats.countries', 'Countries Active'), icon: <Globe />, color: 'text-purple-300' },
  ]

  const testimonials = [
    {
      quote: "Quizito transformed our corporate training. Engagement tripled overnight.",
      author: "Dr. Elena Rodriguez",
      role: "Head of Learning, TechForward Inc.",
      avatar: "ER"
    },
    {
      quote: "The AI-generated quizzes adapt perfectly to my students' varying levels.",
      author: "Marcus Chen",
      role: "University Professor & EdTech Advisor",
      avatar: "MC"
    },
    {
      quote: "Our team competitions have never been more intense or educational.",
      author: "Sarah Johnson",
      role: "Product Lead, Horizon Games",
      avatar: "SJ"
    }
  ]

  return (
    <div
      className="relative overflow-hidden bg-gray-950"
      onMouseMove={handleMouseMove}
      style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {/* Custom cursor */}
      <InteractiveCursor />

      {/* Dynamic background layers */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
      </div>

      {/* Hero Section - Full page background[citation:1][citation:6] */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={heroBackgroundStyle}
      >
        {/* Animated particle overlay */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              {/* Animated entry badge */}
              <div className={`inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full mb-10 transition-all duration-1000 ${textRevealed ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-md animate-pulse" />
                  <Award className="relative text-cyan-300" size={20} />
                </div>
                <span className="text-sm font-semibold text-white tracking-wider">
                  🏆 EDUCATION REIMAGINED • REAL-TIME ANALYTICS • NEURAL LEARNING
                </span>
              </div>

              {/* Main headline with reveal effect inspired by[citation:7] */}
              <div className="relative mb-10">
                <h1 className={`text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter transition-all duration-1000 ${textRevealed ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-10 opacity-0 blur-sm'}`}>
                  <span className="block text-white bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                    {t('hero.title', 'Learn Anything through Quizzes')}
                  </span>
                </h1>

                <p className={`text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-300 ${textRevealed ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                  {t('hero.subtitle', 'The most engaging way to teach, learn, and assess.')}
                </p>
              </div>



              {/* Interactive CTA buttons */}
              <div className={`flex flex-col sm:flex-row gap-6 justify-center mb-16 transition-all duration-1000 delay-500 ${textRevealed ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                {isAuthenticated ? (
                  <>
                    <Button
                      onClick={() => navigate('/create-quiz')}
                      className="group relative overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-lg px-10 py-5 rounded-2xl shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transform hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <span className="relative flex items-center gap-3 font-bold tracking-wide">
                        <Zap className="animate-pulse" size={24} />
                        {t('home.cta.launch', 'LAUNCH NEURAL QUIZ')}
                      </span>
                    </Button>

                    <Button
                      onClick={() => scrollToSection(featuresRef)}
                      className="group relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/20 text-white text-lg px-10 py-5 rounded-2xl hover:bg-white/10 transform hover:-translate-y-1 transition-all duration-300"
                    >
                      <span className="relative flex items-center gap-3 font-bold tracking-wide">
                        <Brain className="group-hover:scale-110 transition-transform" size={24} />
                        {t('home.cta.explore', 'EXPLORE CAPABILITIES')}
                      </span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => navigate('/register')}
                      className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-lg px-10 py-5 rounded-2xl shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transform hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <span className="relative flex items-center gap-3 font-bold tracking-wide">
                        <Rocket className="group-hover:rotate-12 transition-transform" size={24} />
                        {t('home.cta.begin', 'BEGIN YOUR JOURNEY')}
                      </span>
                    </Button>

                    <Button
                      onClick={() => navigate('/explore')}
                      className="group relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/20 text-white text-lg px-10 py-5 rounded-2xl hover:bg-white/10 transform hover:-translate-y-1 transition-all duration-300"
                    >
                      <span className="relative flex items-center gap-3 font-bold tracking-wide">
                        {t('home.cta.witness', 'WITNESS THE IMPACT')}
                        <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
                      </span>
                    </Button>
                  </>
                )}
              </div>

              {/* Live metrics dashboard */}
              <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto transition-all duration-1000 delay-700 ${textRevealed ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 group cursor-pointer"
                    onClick={() => scrollToSection(featuresRef)}
                  >
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-white/5 to-white/10 group-hover:from-white/10 group-hover:to-white/15 transition-all">
                        {React.cloneElement(stat.icon, {
                          className: `${stat.color} group-hover:scale-110 transition-transform`,
                          size: 24
                        })}
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1 tracking-tight">{stat.value}</div>
                    <div className="text-sm text-gray-400 font-medium tracking-wide">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Animated scroll indicator[citation:8] */}
        <button
          onClick={() => scrollToSection(featuresRef)}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hover:animate-none group"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="text-gray-400 text-sm font-medium tracking-wide group-hover:text-cyan-300 transition-colors">
              DISCOVER MORE
            </div>
            <div className="w-6 h-10 border-2 border-cyan-500/30 rounded-full flex justify-center group-hover:border-cyan-400 transition-colors">
              <div className="w-1 h-3 bg-cyan-400 rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </button>
      </section>

      {/* Join with Code Section */}
      <section className="relative py-20 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 md:p-12 relative overflow-hidden">
              {/* Floating gradient orbs */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-3 bg-cyan-500/20 border border-cyan-500/30 px-6 py-3 rounded-full mb-6">
                    <Users className="text-cyan-300" size={20} />
                    <span className="text-sm font-semibold text-white tracking-wider">
                      QUICK JOIN
                    </span>
                  </div>

                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    {t('home.join.title', 'Join a Live Session')}
                  </h2>

                  <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    {t('home.join.subtitle', 'Have a room code? Enter it below to join an active quiz session instantly')}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                  <input
                    type="text"
                    placeholder={t('home.join.placeholder', 'Enter Room Code (e.g., ABC123)')}
                    className="flex-1 px-6 py-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-lg font-medium tracking-wider uppercase"
                    maxLength={6}
                    onChange={(e) => {
                      e.target.value = e.target.value.toUpperCase();
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const code = e.target.value.trim();
                        if (code.length >= 4) {
                          navigate(`/join/${code}`);
                        }
                      }
                    }}
                  />

                  <button
                    onClick={(e) => {
                      const input = e.target.closest('div').querySelector('input');
                      const code = input.value.trim();
                      if (code.length >= 4) {
                        navigate(`/join/${code}`);
                      } else {
                        // Show error feedback
                        input.classList.add('border-red-500');
                        setTimeout(() => input.classList.remove('border-red-500'), 1000);
                      }
                    }}
                    className="group relative overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300 font-bold text-lg whitespace-nowrap"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <span className="relative flex items-center gap-2">
                      <Play size={20} />
                      {t('home.join.button', 'JOIN NOW')}
                    </span>
                  </button>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-gray-500 text-sm">
                    Room codes are case-insensitive and typically 4-6 characters
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-white mb-4">
              Quantum <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">3D Neural</span> Experience
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Interact with our quantum-powered neural quiz network. Experience real-time particle physics,
              dynamic neural connections, and immersive 3D interactions.
            </p>
          </div>

          <div className="mb-8 rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm">
            <QuantumQuizModel />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 mb-4">
                <Cpu className="text-cyan-300" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Quantum Physics</h3>
              <p className="text-gray-400">Real-time particle simulations and neural networks</p>
            </div>

            <div className="text-center">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4">
                <Brain className="text-purple-300" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Neural AI</h3>
              <p className="text-gray-400">Dynamic learning networks that adapt in real-time</p>
            </div>

            <div className="text-center">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 mb-4">
                <Users className="text-emerald-300" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Multiplayer Sync</h3>
              <p className="text-gray-400">Live global competitions with zero latency</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features - Glassmorphism */}
      <section className="relative py-24 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-block mb-4">
              <span className="text-blue-400 font-semibold tracking-wider uppercase text-sm">
                ARCHITECTURAL INNOVATION
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Engineered for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Cognitive Impact
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              We rebuilt quiz technology from the neuron up. Every feature serves
              a specific neurological purpose in knowledge retention.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden"
                style={{ animationDelay: feature.delay }}
              >
                <div className={`absolute inset-0 ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl`} />

                <div className="relative bg-gray-900/30 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 h-full transform hover:-translate-y-2 transition-all duration-500 hover:border-cyan-500/50">
                  {/* Icon with animated gradient */}
                  <div className={`relative inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                    <div className="absolute inset-0 bg-white/10 rounded-2xl" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{feature.title}</h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">{feature.description}</p>

                  {/* Performance badge */}
                  <div className="inline-flex items-center gap-2 bg-black/30 border border-gray-700/50 rounded-full px-4 py-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm text-gray-300 font-medium">{feature.stats}</span>
                  </div>

                  {/* Animated progress line */}
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 group-hover:w-full transition-all duration-700" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Quizzes Section */}
      <section className="relative py-24" ref={quizzesRef}>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-950/50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <div className="inline-block mb-3">
                <span className="text-emerald-400 font-semibold tracking-wider uppercase text-sm">
                  ACTIVE KNOWLEDGE DOMAINS
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Explore{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  Neural Networks
                </span>
              </h2>
              <p className="text-gray-400 text-lg">Live cognitive challenges happening now</p>
            </div>
            <Link
              to="/explore"
              className="group mt-6 md:mt-0 inline-flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 hover:border-cyan-500/50 text-white px-8 py-4 rounded-2xl transition-all duration-300 hover:bg-white/10"
            >
              <span className="font-medium tracking-wide">ACCESS ALL NETWORKS</span>
              <ArrowRight className="group-hover:translate-x-2 transition-transform" size={20} />
            </Link>
          </div>

          {featuredQuizzes.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredQuizzes.map((quiz, index) => (
                <div
                  key={quiz._id}
                  className="group relative"
                  style={{
                    transform: `perspective(1000px) rotateY(${(mousePosition.x - 0.5) * 8}deg) rotateX(${(mousePosition.y - 0.5) * -8}deg)`,
                    transition: 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)'
                  }}
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-3xl blur opacity-0 group-hover:opacity-70 transition duration-500 group-hover:duration-200" />
                  <div className="relative bg-gray-900/30 backdrop-blur-xl border border-gray-800 rounded-3xl overflow-hidden group-hover:border-cyan-500/50 transition-all duration-500 h-full">
                    <QuizCard quiz={quiz} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex p-8 rounded-3xl bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800">
                <Brain className="text-gray-600" size={64} />
              </div>
              <h3 className="text-2xl font-bold text-white mt-8 mb-3">Neural Pathways Await</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Be the pioneer to establish the first knowledge network in this domain
              </p>
              <Button
                onClick={() => navigate('/create-quiz')}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-10 py-4 rounded-xl font-bold"
              >
                INITIATE NETWORK
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Transforming{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Learning Ecosystems
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Join forward-thinking organizations revolutionizing how knowledge is acquired and retained
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 hover:border-cyan-500/30 transition-all duration-500"
              >
                <div className="text-cyan-300 text-2xl mb-6">"</div>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">{testimonial.quote}</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-white font-bold">{testimonial.author}</div>
                    <div className="text-gray-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-32 overflow-hidden" ref={ctaRef}>
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-gray-950 to-blue-900/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="relative bg-gradient-to-br from-gray-900/30 to-gray-950/30 backdrop-blur-xl border border-gray-800 rounded-4xl p-12 md:p-16 overflow-hidden">
              {/* Floating elements */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

              <div className="text-center relative">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 px-6 py-3 rounded-full mb-8">
                  <Sparkles className="text-cyan-300" size={20} />
                  <span className="text-sm font-semibold text-white tracking-wider">
                    THE NEXT EVOLUTION OF LEARNING
                  </span>
                </div>

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
                  Ready to{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                    Redefine Cognitive
                  </span>{' '}
                  Engagement?
                </h2>

                <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                  Join 14,873 educational institutions, corporations, and innovators
                  who have transformed passive learning into active neural development.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Button
                    onClick={() => navigate(isAuthenticated ? '/create-quiz' : '/register')}
                    className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-lg px-12 py-6 rounded-2xl shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <span className="relative flex items-center gap-3 font-bold">
                      {isAuthenticated ? (
                        <>
                          <Cpu className="group-hover:rotate-12 transition-transform" size={24} />
                          DEPLOY NEURAL QUIZ
                        </>
                      ) : (
                        <>
                          <Rocket className="group-hover:rotate-12 transition-transform" size={24} />
                          ACTIVATE TRIAL
                        </>
                      )}
                    </span>
                  </Button>

                  <Button
                    onClick={() => navigate('/create-quiz')}
                    className="group relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 text-white text-lg px-12 py-6 rounded-2xl hover:bg-white/20 transform hover:scale-105 transition-all duration-300"
                  >
                    <span className="relative flex items-center gap-3 font-bold">
                      <Users className="group-hover:scale-110 transition-transform" size={24} />
                      SCHEDULE DEMO
                    </span>
                  </Button>
                </div>

                {/* Trust indicators */}
                <div className="mt-16 pt-16 border-t border-gray-800">
                  <p className="text-gray-400 mb-8 text-lg">Architects of modern learning infrastructure</p>
                  <div className="flex flex-wrap justify-center gap-12 opacity-70">
                    {[
                      { label: 'Universities', icon: '🏛️', count: '42' },
                      { label: 'Fortune 500', icon: '🏢', count: '89' },
                      { label: 'Research Labs', icon: '🔬', count: '156' },
                      { label: 'Governments', icon: '🌍', count: '7' }
                    ].map((item, index) => (
                      <div key={index} className="text-center">
                        <div className="text-3xl mb-2">{item.icon}</div>
                        <div className="text-2xl font-bold text-white mb-1">{item.count}</div>
                        <div className="text-gray-400 text-sm">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating navigation */}
      {scrolled && (
        <button
          onClick={() => window.scroll({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-4 rounded-full shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:scale-110 z-50"
        >
          <ChevronDown className="rotate-180" size={24} />
        </button>
      )}
    </div>
  )
}

export default Home