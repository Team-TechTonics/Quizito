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
  Cpu,
  Layers,
  Code,
  Share2,
  BarChart3,
  Linkedin
} from 'lucide-react'
import QuizCard from '../components/quiz/QuizCard'
import InteractiveCursor from '../components/ui/InteractiveCursor'
import QuantumQuizModel from '../components/3d/QuantumQuizModel'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'

// ISRO GSLV Mk III - Real Photo with Glow
// ISRO GSLV Mk III - Real Photo with Glow (Fixed Image)
const ISRORocket = ({ className = "" }) => {
  return (
    <motion.div
      initial={{ scale: 1.1 }}
      animate={{ scale: 1 }}
      transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      className={`relative group z-0 overflow-hidden ${className}`}
    >
      {/* Launch Photo Masked */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=800&auto=format&fit=crop"
          alt="ISRO Launch"
          className="w-full h-full object-cover transform opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
        />
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90"></div>

        {/* Text Overlay */}
        <div className="absolute bottom-10 left-0 right-0 text-center z-10">
          <p className="text-white font-bold text-3xl drop-shadow-md tracking-wider mb-2">LVM3-M4</p>
          <div className="flex justify-center items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <p className="text-orange-400 text-sm font-mono tracking-[0.2em] uppercase">Mission Successful</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// New Interactive Hero Model (Neural Network)
const NeuralHero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div onMouseMove={handleMouseMove} className="w-full h-[400px] lg:h-[500px] relative overflow-hidden bg-slate-900 rounded-[3rem] border border-blue-500/30 backdrop-blur-md shadow-2xl shadow-blue-500/10 group">

      {/* 1. Background Rocket Layer - Covers Whole Square */}
      <div className="absolute inset-0 z-0">
        <ISRORocket className="w-full h-full" />
      </div>

      {/* 2. Abstract Grid Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-grid-slate-700/30 [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)] z-10 pointer-events-none"></div>

      {/* 3. Interactive Neural Nodes */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <NeuralNode key={i} mousePos={mousePosition} index={i} />
        ))}
      </div>

      {/* 4. Status Indicator */}
      <div className="absolute top-6 right-8 text-right pointer-events-none z-30">
        <p className="text-xs font-mono text-blue-400 uppercase tracking-[0.3em] flex items-center justify-end gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          System Online
        </p>
      </div>
    </div>
  );
};

const NeuralNode = ({ mousePos, index }) => {
  const x = React.useMemo(() => Math.random() * 100, []);
  const y = React.useMemo(() => Math.random() * 100, []);
  const size = React.useMemo(() => Math.random() * 4 + 2, []);

  return (
    <motion.div
      className="absolute rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
      }}
      animate={{
        x: (mousePos.x - window.innerWidth / 2) * (Math.random() * 0.03),
        y: (mousePos.y - window.innerHeight / 2) * (Math.random() * 0.03),
        opacity: [0.3, 0.8, 0.3],
      }}
      transition={{
        x: { type: "spring", damping: 10 },
        y: { type: "spring", damping: 10 },
        opacity: { duration: Math.random() * 2 + 1, repeat: Infinity }
      }}
    />
  );
};

const TiltCard = ({ children, className }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 50 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 50 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative active:scale-95 transition-transform ${className}`}
    >
      <div style={{ transform: "translateZ(75px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  );
};


const WarpTunnel = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] bg-black flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"></div>

      {/* Hyperdrive Stars */}
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: 0,
            y: 0,
            z: 0,
            opacity: 0,
            scale: 0.1
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * window.innerWidth * 2],
            y: [0, (Math.random() - 0.5) * window.innerHeight * 2],
            opacity: [0, 1, 0],
            scale: [0.1, 5]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: Math.random() * 0.5,
            ease: "linear"
          }}
          className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white,0_0_20px_blue]"
          style={{
            left: '50%',
            top: '50%',
            boxShadow: `0 0 ${Math.random() * 20}px ${['#4f46e5', '#3b82f6', '#ffffff'][Math.floor(Math.random() * 3)]}`
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [0.5, 1.5, 50], opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, times: [0, 0.5, 1] }}
        className="absolute text-5xl md:text-9xl font-black text-white mix-blend-difference tracking-widest z-10"
      >
        WARP SPEED
      </motion.div>
    </motion.div>
  );
};

const MagneticButton = ({ children, onClick, className }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const xPos = clientX - (left + width / 2);
    const yPos = clientY - (top + height / 2);
    x.set(xPos * 0.3);
    y.set(yPos * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ x, y }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
    >
      {children}
    </motion.button>
  );
};

const InstructionModal = ({ onClose, isAuthenticated, onRegister }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[10005] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 relative"
    >
      <div className="h-40 bg-gradient-to-r from-orange-600 via-red-500 to-amber-500 relative flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg mb-2">Welcome to Quizito</h2>
        <p className="text-white/90 font-medium text-lg">Your AI-Powered Knowledge Universe</p>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-8 md:p-10">
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Step 1: Join / Register */}
          <div className="flex gap-4 items-start p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30">
            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-xl shrink-0 shadow-lg shadow-orange-500/30">1</div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Join the Revolution</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                New here? <span className="font-bold text-orange-600 dark:text-orange-400">Register now</span> to unlock your personal dashboard. It's free for students and educators!
              </p>
            </div>
          </div>

          {/* Step 2: Generation */}
          <div className="flex gap-4 items-start p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white font-black text-xl shrink-0 shadow-lg shadow-blue-500/30">2</div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Generate Anything</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Upload a <span className="font-bold text-blue-600 dark:text-blue-400">PDF, Audio file, or Text</span>. Our AI Guru transforms it into an interactive quiz.
              </p>
            </div>
          </div>

          {/* Step 3: Multiplayer & Social */}
          <div className="flex gap-4 items-start p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30">
            <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center text-white font-black text-xl shrink-0 shadow-lg shadow-purple-500/30">3</div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Host Live Battles</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Host real-time multiplayer quizzes. Join classes, make friends, and compete on the global leaderboard.
              </p>
            </div>
          </div>

          {/* Step 4: Analytics */}
          <div className="flex gap-4 items-start p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-xl shrink-0 shadow-lg shadow-emerald-500/30">4</div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Deep Analytics</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Get detailed performance insights. Perfect for educators tracking progress and students mastering topics.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-center pt-6 border-t border-slate-100 dark:border-slate-800">
          {!isAuthenticated && (
            <button
              onClick={onRegister}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black text-lg rounded-xl shadow-xl shadow-orange-500/20 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 fill-current" />
              Start Your Journey (Register)
            </button>
          )}
          <button onClick={onClose} className="w-full md:w-auto px-8 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
            Start Exploring <Rocket className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

const Home = () => {
  const { t } = useTranslation()
  const { isAuthenticated, loginWithToken, user } = useAuth()
  const { quizzes, fetchQuizzes } = useQuiz()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [featuredQuizzes, setFeaturedQuizzes] = useState([])
  const [scrolled, setScrolled] = useState(false)
  const [showThemePopup, setShowThemePopup] = useState(false)
  const [isLaunching, setIsLaunching] = useState(false);

  const { scrollY } = useScroll();
  const [gameCode, setGameCode] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowInstructions(true), 1500);
  }, []);

  const closeInstructions = () => {
    setShowInstructions(false);
  };

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setShowScrollTop(latest > 400);
    });
    return () => unsubscribe();
  }, [scrollY]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartMission = () => {
    setIsLaunching(true);
    setTimeout(() => {
      if (isAuthenticated) {
        navigate('/create-quiz');
      } else {
        navigate('/register');
      }
    }, 1500);
  };

  const handleJoinGame = (e) => {
    e.preventDefault();
    if (gameCode.trim()) {
      navigate(`/play/${gameCode}`);
    }
  };


  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const featuresRef = useRef(null)
  const statsRef = useRef(null)
  const hologramRef = useRef(null)

  // Force theme update on mount and change


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
    }, 5000)

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
      icon: <Brain className="w-8 h-8" />,
      title: 'AI-Powered Guru',
      description: 'Your personal digital mentor that adapts to your unique learning style.',
      gradient: 'from-orange-500 via-amber-500 to-yellow-500',
      delay: 0.1
    },
    {
      icon: <Flame className="w-8 h-8" />,
      title: 'Competitive Battles',
      description: 'Engage in righteous battles of intellect with real-time multiplayer quizzes.',
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      delay: 0.2
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Deep Analytics',
      description: 'Deep insights and pattern recognition to master every subject perfectly.',
      gradient: 'from-purple-500 via-violet-500 to-indigo-500',
      delay: 0.3
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Global Ranks',
      description: 'Climb the global leaderboard by earning Karma points through daily practice.',
      gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
      delay: 0.4
    },
  ]

  const stats = [
    { value: '5,000+', label: 'Active Scholars', icon: <Users className="w-6 h-6" />, gradient: 'from-orange-500 to-amber-600' },
    { value: '150+', label: 'Daily Battles', icon: <Award className="w-6 h-6" />, gradient: 'from-emerald-500 to-teal-600' },
    { value: '10k', label: 'Questions Solved', icon: <Lightbulb className="w-6 h-6" />, gradient: 'from-purple-500 to-indigo-600' },
    { value: '12', label: 'Countries Reached', icon: <Globe className="w-6 h-6" />, gradient: 'from-pink-500 to-rose-600' },
  ]

  const testimonials = [
    {
      quote: "A fantastic platform! The AI guru really understands my weak areas.",
      role: "Engineering Student",
      author: "Priya Sharma",
      avatar: "PS",
      gradient: "from-orange-400 to-amber-500"
    },
    {
      quote: "The live battles remind me of competitive exams but way more engaging!",
      role: "Medical Aspirant",
      author: "Arjun Patel",
      avatar: "AP",
      gradient: "from-emerald-400 to-teal-500"
    },
    {
      quote: "I use this every week for my classroom. It's revolutionizing how we teach.",
      role: "High School Teacher",
      author: "Sarah Jenkins",
      avatar: "SJ",
      gradient: "from-purple-400 to-indigo-500"
    }
  ]

  return (
    <div className="relative min-h-screen bg-orange-50/30 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors duration-500 font-sans">
      <InteractiveCursor />

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-[800px] h-[800px] bg-orange-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 -right-1/4 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
        </div>
      </div>

      {/* Improved Theme Toggle - Fixed Z-Index & Pointer Events */}
      <div className="fixed top-6 right-6 z-[9999] pointer-events-auto">
        <button
          onClick={(e) => {
            console.log("Theme Toggle Clicked!", theme);
            toggleTheme();
          }}
          className="relative group p-3 rounded-xl bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-700 hover:border-orange-500 transition-all duration-300 shadow-2xl cursor-pointer ml-auto"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-6 h-6 text-amber-400" /> : <Moon className="w-6 h-6 text-indigo-400" />}
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 font-bold text-sm mb-6 border border-orange-200 dark:border-orange-800/50">
              <span className="animate-pulse w-2 h-2 rounded-full bg-orange-500"></span>
              <span>{t('home.hero.badge', 'Proudly Made in India 🇮🇳')}</span>
            </div>

            <h1 className="text-6xl lg:text-8xl font-black mb-8 leading-[1.05] tracking-tight">
              <span className="block text-slate-900 dark:text-white mb-2">{t('home.hero.title_start', 'Launch Your')}</span>
              <span className="bg-gradient-to-r from-orange-500 via-amber-200 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl filter brightness-110">
                {t('home.hero.title_end', 'Success Journey')}
              </span>
            </h1>

            <div className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl leading-normal font-medium opacity-90">
              {t('home.hero.subtitle', 'Create, host, and play live AI-powered quizzes in seconds.')}
              <span className="block mt-4 text-lg font-serif italic text-slate-500 dark:text-slate-400">
                "{t('home.hero.quote', 'Where Vedic wisdom meets Warp-speed AI. Your mission control for mastery.')}"
              </span>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="relative group">
                <MagneticButton
                  onClick={handleStartMission}
                  className="relative px-12 py-6 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white rounded-2xl font-black text-2xl shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:shadow-[0_0_60px_rgba(249,115,22,0.6)] transition-all flex items-center gap-4 overflow-hidden border border-white/20 group-hover:scale-[1.02]"
                >
                  <motion.div
                    animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                  />

                  {/* Floating Particles */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -20, 0], opacity: [0, 1, 0] }}
                      transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      style={{ left: `${20 + i * 30}%`, top: '80%' }}
                    />
                  ))}

                  <div className="relative flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
                    </span>
                    <span className="tracking-wide drop-shadow-md">{t('home.cta.launch', 'START MISSION')}</span>
                    <Rocket className="w-6 h-6 animate-bounce-slow" />
                  </div>
                </MagneticButton>

                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-max px-4 py-2 bg-slate-900/90 text-white text-xs font-mono rounded-lg opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 pointer-events-none border border-white/10 backdrop-blur-md">
                  {t('home.hero.tooltip', 'Just like a launch, every quiz is a mission.')}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-white/10"></div>
                </div>
              </div>

              {isAuthenticated ? (
                <button onClick={() => navigate('/dashboard')} className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-xl font-bold text-lg transition-all flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  {t('nav.dashboard', 'Dashboard')}
                </button>
              ) : (
                <button onClick={() => scrollToSection(hologramRef)} className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:border-orange-500 rounded-xl font-bold text-lg transition-all">
                  {t('home.cta.explore', 'Explore Cosmos')}
                </button>
              )}
            </div>

            {/* Join Game Section */}



          </motion.div>

          {/* NEW Interactive Hologram Model with Schematic Rocket */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <NeuralHero />
          </motion.div>
        </div>
      </section>

      {/* JOIN GAME SECTION - Premium Card Design */}
      <section className="py-12 px-6 relative z-30 -mt-20 mb-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 text-center shadow-2xl overflow-hidden group">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] group-hover:bg-blue-500/30 transition-all"></div>
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] group-hover:bg-purple-500/30 transition-all"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

            <div className="relative z-10">
              {/* Live Battle Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm tracking-wider mb-8 uppercase animate-pulse">
                <Play className="w-4 h-4 fill-current" />
                <span>{t('home.join.title', 'LIVE BATTLE')}</span>
              </div>

              {/* Main Title */}
              <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-xl">
                {t('home.join.subtitle', 'Got a Game Code?')}
              </h2>
              <p className="text-slate-400 text-lg md:text-xl font-medium mb-12">
                {t('home.join.desc', 'Join your friends instantly')}
              </p>

              {/* Input Area */}
              <form onSubmit={handleJoinGame} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-50 blur transition duration-500"></div>
                  <input
                    type="text"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                    placeholder={t('home.join.placeholder', 'C O D E')}
                    className="relative w-full h-16 bg-slate-950/50 rounded-2xl border border-white/10 text-white text-center text-3xl font-black tracking-[0.2em] placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-all uppercase shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  className="h-16 px-10 bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white text-xl font-bold rounded-2xl shadow-lg shadow-orange-500/20 transform hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {t('home.join.button', 'JOIN')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>



      {/* Stats Section */}
      <section ref={statsRef} className="py-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-y border-orange-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center group"
            >
              <div className={`w-14 h-14 mx-auto rounded-full bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</div>
              <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t(`home.stats.${stat.label.toLowerCase().replace(' ', '_')}`, stat.label)}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section ref={featuresRef} className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold text-xs uppercase tracking-wider mb-4">
              {t('home.features.badge', 'Made for India')}
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-slate-900 dark:text-white">
              {t('home.features.title', 'Tech & Tradition Combined')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
              {t('home.features.subtitle', 'We blend cutting-edge AI with the timeless principles of Indian education.')}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <TiltCard key={i}>
                <div className="p-8 bg-white dark:bg-slate-800 rounded-[2rem] border border-orange-100 dark:border-slate-700/50 shadow-xl shadow-orange-500/5 hover:shadow-orange-500/10 relative overflow-hidden group h-full">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${feature.gradient} opacity-5 rounded-bl-[100px] transition-transform group-hover:scale-150`}></div>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-6 shadow-lg rotate-3 group-hover:rotate-6 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{t(`home.features.items.${i}.title`, feature.title)}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{t(`home.features.items.${i}.desc`, feature.description)}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* HUGE 3D Hologram Section */}
      <section ref={hologramRef} className="py-24 px-6 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-black"></div>
        {/* Stars */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-3 gap-16 items-center">
            <div className="lg:col-span-1">
              <div className="inline-flex items-center gap-2 text-blue-400 font-bold uppercase tracking-widest mb-6">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                <span>{t('home.hologram.badge', 'Deep Space Learning')}</span>
              </div>
              <h2 className="text-5xl font-black text-white mb-6">
                {t('home.hologram.explore', 'Explore the')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{t('home.hologram.cosmos', 'Knowledge Cosmos')}</span>
              </h2>
              <p className="text-slate-400 mb-10 text-lg leading-relaxed">
                {t('home.hologram.desc', 'Navigate through 3D constellations of questions. Just closer to the stars, farther from ignorance.')}
              </p>

              <div className="space-y-6">
                <div className="group flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-colors">
                  <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500 group-hover:text-white text-blue-400 transition-all">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-white font-bold">Universal Access</div>
                    <div className="text-slate-500 text-xs uppercase tracking-wide">Learn from anywhere</div>
                  </div>
                </div>
              </div>
            </div>

            {/* THE BIG MODEL */}
            <div className="lg:col-span-2 h-[600px] lg:h-[700px] rounded-[3rem] overflow-hidden border border-indigo-500/20 shadow-2xl shadow-indigo-900/20 bg-black relative group">
              <QuantumQuizModel />
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none">
                <span className="px-6 py-3 bg-white/5 backdrop-blur-xl rounded-full text-white/70 text-sm font-medium border border-white/10 flex items-center gap-3">
                  Drag to Rotate Cosmos
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community / Quizzes */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Popular Missions</h2>
              <p className="text-slate-600 dark:text-slate-400">Join fellow cadets in these top-rated challenges</p>
            </div>
            <Link to="/explore" className="text-orange-600 font-bold hover:text-orange-700 flex items-center gap-2 group transition-colors">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredQuizzes.length > 0 ? (
              featuredQuizzes.slice(0, 3).map((quiz, i) => (
                <motion.div key={quiz._id || i} whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
                  <QuizCard quiz={quiz} featured />
                </motion.div>
              ))
            ) : (
              [1, 2, 3].map(i => (
                <div key={i} className="h-[400px] bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 animate-pulse"></div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Voice of India's Future</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="p-8 bg-white dark:bg-slate-800 rounded-[2rem] shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-900 transition-colors">
                <div className="mb-6">
                  <div className="text-4xl text-orange-200 dark:text-slate-600 font-serif">"</div>
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-medium mb-2 text-lg">{t.quote}</p>
                <p className="text-sm text-slate-500 italic mb-8">{t.quoteEn}</p>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{t.author}</div>
                    <div className="text-xs font-bold text-orange-600 uppercase tracking-wide">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
              From <span className="text-orange-600">Zero</span> to <span className="text-blue-600">Infinity</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">The continuous thread of Indian innovation.</p>
          </div>

          <div className="relative">
            {/* Central Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 via-blue-500 to-green-500 rounded-full"></div>

            {[
              { title: "Vedic Era", sub: "Oral Tradition", icon: "🕉️", desc: "The preservation of knowledge through the ages.", color: "from-orange-500 to-red-500" },
              { title: "Ancient Math", sub: "Aryabhata (Zero)", icon: "0", desc: "Giving the world the power of 'Shunya'.", color: "from-orange-500 to-amber-500" },
              { title: "Golden Age", sub: "Takshashila", icon: "🏛️", desc: "The world's first global university.", color: "from-amber-500 to-yellow-500" },
              { title: "Medical Science", sub: "Sushruta", icon: "⚕️", desc: "Pioneering surgery and medicine.", color: "from-yellow-500 to-lime-500" },
              { title: "Scientific Reawakening", sub: "CV Raman", icon: "🔬", desc: "The Nobel Prize winning Raman Effect.", color: "from-lime-500 to-green-500" },
              { title: "Independence", sub: "1947", icon: "🇮🇳", desc: "A new beginning for a free nation.", color: "from-green-500 to-emerald-500" },
              { title: "Atomic Age", sub: "Homi Bhabha", icon: "⚛️", desc: "Building the foundation of nuclear power.", color: "from-emerald-500 to-teal-500" },
              { title: "Space Age", sub: "ISRO Formed", icon: "🛰️", desc: "Looking towards the stars.", color: "from-teal-500 to-cyan-500" },
              { title: "Digital Revolution", sub: "Digital India", icon: "💻", desc: "Connecting a billion minds.", color: "from-cyan-500 to-blue-500" },
              { title: "Viksit Bharat", sub: "Future & Beyond", icon: "🚀", desc: "Leading the world in AI and Space.", color: "from-blue-500 to-indigo-500" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`relative flex items-center gap-8 mb-16 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse text-left md:text-right'}`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 border-4 border-white dark:border-slate-800 z-10 flex items-center justify-center shadow-lg">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${item.color}`}></div>
                </div>

                {/* Content */}
                <div className={`ml-16 md:ml-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-shadow relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl ${item.color} opacity-10 rounded-bl-[50px] transition-transform group-hover:scale-150`}></div>
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} text-white text-2xl font-bold mb-4 shadow-lg`}>
                      {item.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{item.title}</h3>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">{item.sub}</p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Ashram - Creative Council of Coders */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-[#05050A] relative overflow-hidden border-t border-slate-200 dark:border-slate-900 transition-colors">
        {/* Mystical Background */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[100px] animate-pulse-slow"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="mb-20">
            <span className="inline-block p-1 px-3 border border-orange-500/30 rounded-full text-orange-600 dark:text-orange-400 text-xs font-mono uppercase tracking-widest mb-4">Core Team</span>
            <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-6">
              The Council of <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Creators</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400">Architects of the Digital Gurukul</p>
          </div>

          <div className="flex flex-wrap justify-center gap-10 md:gap-16 perspective-1000">
            {[
              { title: "Full Stack Developer", name: "Srijan Prakash", initials: "SP", color: "from-orange-500 to-red-600", icon: <Brain className="w-6 h-6" /> },
              { title: "Full Stack Developer", name: "A Ramanuj Patro", initials: "AR", color: "from-blue-500 to-indigo-600", icon: <Zap className="w-6 h-6" /> },
              { title: "Team Leader", name: "Prithish Misra", initials: "PM", color: "from-purple-500 to-violet-600", icon: <Target className="w-6 h-6" /> },
              { title: "AI ML Engineer", name: "Debomoy Patra", initials: "DP", color: "from-green-500 to-emerald-600", icon: <Sparkles className="w-6 h-6" /> }
            ].map((coder, i) => (
              <TiltCard key={i} className="w-72">
                <div className="relative group bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-2xl cursor-pointer">
                  {/* Glowing Orb */}
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${coder.color} blur-xl opacity-20 group-hover:opacity-60 transition-opacity duration-500`}></div>
                    <div className={`relative w-full h-full rounded-full bg-gradient-to-br ${coder.color} p-[2px]`}>
                      <div className="w-full h-full rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                        <span className={`text-2xl font-bold bg-gradient-to-br ${coder.color} bg-clip-text text-transparent`}>{coder.initials}</span>
                      </div>
                    </div>
                    {/* Orbit */}
                    <div className="absolute -inset-2 border border-slate-200 dark:border-white/5 rounded-full animate-spin-slow-reverse group-hover:border-slate-300 dark:group-hover:border-white/20"></div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 font-serif">{coder.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-mono mb-4 uppercase tracking-widest">{coder.title}</p>

                  <div className={`w-12 h-1 mx-auto rounded-full bg-gradient-to-r ${coder.color} mb-6`}></div>

                  <div className="flex justify-center gap-4">
                    <button className="p-2 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-white transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-white transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>

          <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center opacity-30 text-xs font-mono">
            <p>SYSTEM.VERSION: 2.0.5 // QUIZITO_CORE</p>
            <p className="mt-2 md:mt-0">MADE_IN_INDIA</p>
          </div>
        </div>
      </section>
      <AnimatePresence>
        {isLaunching && <WarpTunnel />}
      </AnimatePresence>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-500/30 transition-colors"
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronDown className="w-6 h-6 rotate-180" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInstructions && (
          <InstructionModal
            onClose={closeInstructions}
            isAuthenticated={isAuthenticated}
            onRegister={() => navigate('/register')}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default Home
