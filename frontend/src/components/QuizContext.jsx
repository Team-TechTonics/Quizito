// src/components/QuizContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const QuizContext = createContext();

// Create axios instances for different services
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://quizito-backend.onrender.com/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const aiApi = axios.create({
  baseURL: import.meta.env.VITE_AI_URL || 'http://localhost:5001',
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('quizito_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('quizito_token');
      localStorage.removeItem('quizito_user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export const QuizProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('quizito_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('quizito_token') || null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const navigate = useNavigate();

  // Initialize socket connection
  useEffect(() => {
    if (!token) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'https://quizito-backend.onrender.com';
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Socket event handlers
    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Socket connected');

      // Join user's personal room for notifications
      if (user) {
        newSocket.emit('join-user-room', user.id || user._id);
      }
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('❌ Socket disconnected:', reason);

      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        newSocket.connect();
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error('Connection error. Please refresh.');
    });

    newSocket.on('quiz-started', (data) => {
      setCurrentQuiz(data.quiz);
      setActiveSession(data.session);
      toast.success('Quiz has started! Get ready!');
    });

    newSocket.on('leaderboard-update', (data) => {
      setLeaderboard(data);
    });

    newSocket.on('quiz-ended', (results) => {
      setQuizResults(results);
      setCurrentQuiz(null);
      setActiveSession(null);
      toast.success('Quiz completed! Check your results');

      // Save results to localStorage for analytics
      const pastResults = JSON.parse(localStorage.getItem('quizito_results') || '[]');
      pastResults.push(results);
      localStorage.setItem('quizito_results', JSON.stringify(pastResults));
    });

    newSocket.on('participant-joined', (data) => {
      toast(`${data.username} joined the quiz`);
    });

    newSocket.on('participant-left', (data) => {
      toast(`${data.username} left the quiz`);
    });

    newSocket.on('new-question', (data) => {
      setCurrentQuiz(prev => ({
        ...prev,
        currentQuestion: data.questionIndex,
        question: data.question
      }));
    });

    newSocket.on('session-update', (data) => {
      setActiveSession(data);
    });

    newSocket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadNotifications(prev => prev + 1);
      toast(notification.message, {
        icon: '🔔',
        duration: 4000,
      });
    });

    newSocket.on('quiz-invite', (invite) => {
      const notification = {
        id: Date.now(),
        type: 'invite',
        title: 'Quiz Invitation',
        message: `You're invited to join "${invite.quizTitle}"`,
        data: invite,
        timestamp: new Date(),
        read: false
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadNotifications(prev => prev + 1);

      toast.custom((t) => (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">🎯 Quiz Invitation</p>
              <p className="text-sm opacity-90">Join "{invite.quizTitle}"</p>
            </div>
            <button
              onClick={() => {
                navigate(`/join-quiz?code=${invite.roomCode}`);
                toast.dismiss(t.id);
              }}
              className="ml-4 px-4 py-1 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100"
            >
              Join
            </button>
          </div>
        </div>
      ), { duration: 6000 });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user, navigate]);

  // AI Quiz Generation Functions
  const generateQuizWithAI = useCallback(async (data) => {
    setAiGenerating(true);
    try {
      const response = await aiApi.post('/generate-quiz', {
        topic: data.topic,
        difficulty: data.difficulty || 'medium',
        numQuestions: data.numQuestions || 10,
        quizType: data.quizType || 'multiple-choice',
        context: data.context || '',
      });

      if (response.data.success) {
        const quizData = response.data.data;

        // Enhance quiz with additional metadata
        const enhancedQuiz = {
          ...quizData,
          createdBy: user.id || user._id,
          aiGenerated: true,
          aiModel: response.data.data.metadata?.ai_provider || 'openai',
          generatedAt: new Date().toISOString(),
        };

        toast.success('Quiz generated successfully with AI!');
        return { success: true, quiz: enhancedQuiz };
      } else {
        throw new Error(response.data.error || 'Failed to generate quiz');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error(error.response?.data?.error || 'AI service unavailable. Using fallback.');

      // Fallback: Generate simple quiz
      const fallbackQuiz = await generateFallbackQuiz(data);
      return { success: true, quiz: fallbackQuiz, note: 'Using fallback generation' };
    } finally {
      setAiGenerating(false);
    }
  }, [user]);

  const extractTextFromPDF = useCallback(async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await aiApi.post('/extract-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        return {
          success: true,
          text: response.data.data.text,
          analysis: response.data.data.analysis
        };
      }
    } catch (error) {
      console.error('PDF extraction error:', error);
    }

    return { success: false, text: '' };
  }, []);

  const analyzeTopic = useCallback(async (topic, context = '') => {
    try {
      const response = await aiApi.post('/analyze-topic', {
        topic,
        context
      });

      if (response.data.success) {
        return { success: true, analysis: response.data.data };
      }
    } catch (error) {
      console.error('Topic analysis error:', error);
    }

    return { success: false, analysis: null };
  }, []);

  // Fallback quiz generation
  const generateFallbackQuiz = useCallback(async (data) => {
    const categories = [
      'Technology', 'Science', 'History', 'Mathematics', 'Language',
      'Art', 'Sports', 'Entertainment', 'Business', 'Health', 'General'
    ];

    const difficulties = ['easy', 'medium', 'hard'];
    const pointsMap = { easy: 100, medium: 150, hard: 200 };
    const timeMap = { easy: 30, medium: 45, hard: 60 };

    const questions = Array.from({ length: data.numQuestions || 10 }, (_, i) => ({
      question: `Question ${i + 1}: What is a key concept about "${data.topic}"?`,
      type: data.quizType || 'multiple-choice',
      options: [
        `Primary concept of ${data.topic}`,
        `Secondary aspect of ${data.topic}`,
        `Common misconception about ${data.topic}`,
        `Advanced topic in ${data.topic}`
      ],
      correctAnswer: 0,
      explanation: `This covers fundamental knowledge about ${data.topic}.`,
      points: pointsMap[data.difficulty] || 100,
      timeLimit: timeMap[data.difficulty] || 30,
      difficulty: data.difficulty || 'medium',
      category: data.category || categories[Math.floor(Math.random() * categories.length)],
      tags: [data.topic.toLowerCase().replace(/\s+/g, '-'), data.difficulty || 'medium', 'quiz'],
      educationalTip: `To learn more about ${data.topic}, try researching related concepts and applications.`
    }));

    return {
      title: `${data.topic} Quiz`,
      description: `Test your knowledge about ${data.topic}. This quiz covers various aspects and concepts.`,
      category: data.category || 'General',
      difficulty: data.difficulty || 'medium',
      questions,
      estimatedTime: (data.numQuestions || 10) * 0.8,
      totalPoints: (data.numQuestions || 10) * (pointsMap[data.difficulty] || 100),
      tags: [data.topic.toLowerCase().replace(/\s+/g, '-'), data.difficulty || 'medium', 'ai-generated'],
      learningObjectives: [
        `Understand basic concepts of ${data.topic}`,
        `Identify key components in ${data.topic}`,
        `Apply knowledge of ${data.topic} to solve problems`
      ],
      metadata: {
        aiGenerated: true,
        aiProvider: 'fallback',
        generatedAt: new Date().toISOString(),
        note: 'Generated using fallback method'
      }
    };
  }, []);

  // Authentication functions
  const register = useCallback(async (userData) => {
    setAuthLoading(true);
    try {
      const response = await api.post('/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;

      localStorage.setItem('quizito_token', newToken);
      localStorage.setItem('quizito_user', JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);

      toast.success('Account created successfully! Welcome to Quizito!');
      return { success: true, user: newUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    setAuthLoading(true);
    try {
      const response = await api.post('/auth/login', credentials);
      const { token: newToken, user: newUser } = response.data;

      localStorage.setItem('quizito_token', newToken);
      localStorage.setItem('quizito_user', JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);

      // Update user stats
      const stats = {
        lastLogin: new Date().toISOString(),
        loginCount: (newUser.stats?.loginCount || 0) + 1
      };

      toast.success(`Welcome back, ${newUser.username}!`);
      return { success: true, user: newUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('quizito_token');
    localStorage.removeItem('quizito_user');
    setToken(null);
    setUser(null);
    setCurrentQuiz(null);
    setActiveSession(null);
    setLeaderboard([]);

    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    toast.success('Logged out successfully');
    navigate('/auth');
  }, [socket, navigate]);

  const updateProfile = useCallback(async (profileData) => {
    setAuthLoading(true);
    try {
      const response = await api.put('/auth/profile', profileData);
      const updatedUser = response.data.user;

      localStorage.setItem('quizito_user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success('Profile updated successfully!');
      return { success: true, user: updatedUser };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
      return { success: false, error: error.response?.data };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Quiz functions
  const createQuiz = useCallback(async (quizData) => {
    setLoading(true);
    try {
      let quizToCreate = quizData;

      // If AI generation is requested
      if (quizData.generateWithAI) {
        const aiResult = await generateQuizWithAI(quizData);
        if (aiResult.success) {
          quizToCreate = {
            ...quizData,
            ...aiResult.quiz,
            aiGenerated: true
          };
        }
      }

      const response = await api.post('/api/quizzes', quizToCreate);

      if (response.data.success) {
        toast.success('Quiz created successfully!');
        return { success: true, quiz: response.data.data };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create quiz');
      return { success: false, error: error.response?.data };
    } finally {
      setLoading(false);
    }
  }, [generateQuizWithAI]);

  const joinQuiz = useCallback(async (sessionId, username) => {
    setLoading(true);
    try {
      const response = await api.post(`/sessions/${sessionId}/join`, { username });
      const data = response.data;

      if (data.success && socket) {
        socket.emit('join-room', sessionId, user?.id || user?._id);
        toast.success(`Joined quiz as ${username}!`);
        return data;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join quiz');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [socket, user]);

  const submitAnswer = useCallback((questionId, selectedOption, timeTaken) => {
    if (!socket || !activeSession) {
      toast.error('Not connected or not in a quiz');
      return;
    }

    socket.emit('submit-answer', {
      sessionId: activeSession.roomCode,
      userId: user.id || user._id,
      questionId,
      selectedOption,
      timeTaken,
    });
  }, [socket, activeSession, user]);

  const startQuiz = useCallback((sessionId) => {
    if (socket) {
      socket.emit('start-quiz', sessionId);
    }
  }, [socket]);

  const getLeaderboard = useCallback(async (quizId = null) => {
    try {
      const url = quizId
        ? `/leaderboard/quiz/${quizId}`
        : '/leaderboard/global';

      const response = await api.get(url);
      setLeaderboard(response.data.data || []);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      return [];
    }
  }, []);

  const getQuizAnalytics = useCallback(async (quizId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}/analytics`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      return null;
    }
  }, []);

  const getUserStats = useCallback(async () => {
    try {
      const response = await api.get('/auth/stats');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      return null;
    }
  }, []);

  const markNotificationsAsRead = useCallback(() => {
    setUnreadNotifications(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const value = {
    // State
    socket,
    user,
    token,
    currentQuiz,
    leaderboard,
    isConnected,
    loading,
    authLoading,
    quizResults,
    aiGenerating,
    activeSession,
    notifications,
    unreadNotifications,

    // API instances
    api,
    aiApi,

    // Authentication
    register,
    login,
    logout,
    updateProfile,

    // AI Functions
    generateQuizWithAI,
    extractTextFromPDF,
    analyzeTopic,

    // Quiz Functions
    createQuiz,
    joinQuiz,
    submitAnswer,
    startQuiz,
    getLeaderboard,
    getQuizAnalytics,
    getUserStats,

    // Notification Functions
    markNotificationsAsRead,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within QuizProvider');
  }
  return context;
};
