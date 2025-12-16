import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Crown, Zap, TrendingUp, Medal, Star, 
  Award, Flame, Target, Clock, Users, Rocket,
  RefreshCw, ChevronUp, ChevronDown, Sparkles,
  Filter, Gamepad2, BarChart3,
  Swords, Shield, Eye, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

const Leaderboard = ({ compact = false, sessionCode = null, userId = null }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPlayers: 0,
    averageAccuracy: 0,
    averageTime: 0,
    totalPoints: 0
  });
  const [viewMode, setViewMode] = useState('global'); // global, session, friends
  const [timeFilter, setTimeFilter] = useState('weekly'); // daily, weekly, monthly, all
  const [showFilters, setShowFilters] = useState(false);
  const [highlightedUser, setHighlightedUser] = useState(null);
  const [confettiTriggered, setConfettiTriggered] = useState(false);
  const [showStreaks, setShowStreaks] = useState(true);
  const [pulseRank, setPulseRank] = useState(null);
  const containerRef = useRef(null);

  // Mock data with enhanced properties
  const getMockLeaderboardData = () => [
    { id: 1, name: 'QuantumWizard', score: 9850, rank: 1, avatar: 'QW', streak: 8, accuracy: 94, level: 42, badges: ['legend', 'speedster', 'perfectionist'], powerups: 3, wins: 156, lastActive: '2 min ago', online: true },
    { id: 2, name: 'NeoMatrix', score: 9420, rank: 2, avatar: 'NM', streak: 5, accuracy: 89, level: 38, badges: ['strategist', 'consistent'], powerups: 2, wins: 128, lastActive: '5 min ago', online: true },
    { id: 3, name: 'CyberPunk', score: 9010, rank: 3, avatar: 'CP', streak: 12, accuracy: 96, level: 45, badges: ['unstoppable', 'accuracy'], powerups: 5, wins: 189, lastActive: 'Just now', online: true },
    { id: 4, name: 'StellarStorm', score: 8760, rank: 4, avatar: 'SS', streak: 3, accuracy: 82, level: 35, badges: ['rising'], powerups: 1, wins: 92, lastActive: '1 hour ago', online: false },
    { id: 5, name: 'PhantomBlade', score: 8450, rank: 5, avatar: 'PB', streak: 6, accuracy: 88, level: 37, badges: ['combatant'], powerups: 4, wins: 112, lastActive: '30 min ago', online: true },
    { id: 6, name: 'GalacticLord', score: 8120, rank: 6, avatar: 'GL', streak: 4, accuracy: 85, level: 33, badges: ['explorer'], powerups: 2, wins: 78, lastActive: '2 hours ago', online: false },
    { id: 7, name: 'You', score: 4250, rank: 7, avatar: 'ME', streak: 2, accuracy: 80, level: 25, badges: ['beginner', 'learner'], powerups: 1, wins: 34, lastActive: 'Active now', online: true, isCurrentUser: true },
    { id: 8, name: 'DigitalDragon', score: 7980, rank: 8, avatar: 'DD', streak: 1, accuracy: 79, level: 31, badges: [], powerups: 0, wins: 65, lastActive: '15 min ago', online: true },
    { id: 9, name: 'CodeNinja', score: 7650, rank: 9, avatar: 'CN', streak: 7, accuracy: 91, level: 39, badges: ['coder', 'quick'], powerups: 3, wins: 143, lastActive: '45 min ago', online: false },
    { id: 10, name: 'MythicMage', score: 7320, rank: 10, avatar: 'MM', streak: 0, accuracy: 76, level: 28, badges: [], powerups: 1, wins: 41, lastActive: '3 hours ago', online: false },
  ];

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Determine endpoint based on view mode
      let endpoint = '';
      let queryParams = '';
      
      if (sessionCode) {
        // Session leaderboard
        endpoint = `/api/sessions/${sessionCode}/leaderboard`;
      } else {
        // Global leaderboard
        endpoint = '/api/analytics/leaderboard';
        queryParams = `?period=${timeFilter.toLowerCase()}&limit=20`;
      }
      
      // Try to fetch from API
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`http://localhost:10000${endpoint}${queryParams}`, {
          headers,
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success) {
            setLeaderboardData(data.leaderboard || []);
            setStats(data.stats || {
              totalPlayers: data.leaderboard?.length || 0,
              averageAccuracy: 0,
              averageTime: 0,
              totalPoints: 0
            });
            return; // Success, exit early
          }
        }
      } catch (apiError) {
        console.log('API fetch failed, using mock data:', apiError.message);
        // Continue to mock data fallback
      }
      
      // Fallback to mock data if API fails or returns error
      const mockData = getMockLeaderboardData();
      setLeaderboardData(mockData);
      
      // Calculate stats from mock data
      const calculatedStats = {
        totalPlayers: mockData.length,
        averageAccuracy: Math.round(mockData.reduce((sum, user) => sum + user.accuracy, 0) / mockData.length),
        averageTime: 15.2,
        totalPoints: mockData.reduce((sum, user) => sum + user.score, 0),
        topScore: Math.max(...mockData.map(user => user.score)),
        activePlayers: mockData.filter(user => user.online).length
      };
      
      setStats(calculatedStats);
      
      // Trigger confetti if user moved up in rank
      const currentUser = mockData.find(user => user.isCurrentUser);
      if (currentUser && currentUser.rank <= 3 && !confettiTriggered) {
        triggerConfetti();
        setConfettiTriggered(true);
      }
      
      // Pulse animation for user's rank
      if (currentUser) {
        setPulseRank(currentUser.rank);
        setTimeout(() => setPulseRank(null), 2000);
      }
      
    } catch (err) {
      console.error('Error in fetchLeaderboard:', err);
      setError('Failed to load leaderboard. Using demo data.');
      
      // Ultimate fallback
      const mockData = getMockLeaderboardData();
      setLeaderboardData(mockData);
      setStats({
        totalPlayers: mockData.length,
        averageAccuracy: 84,
        averageTime: 15.2,
        totalPoints: 67830
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerConfetti = () => {
    if (typeof window === 'undefined') return;
    
    const end = Date.now() + 1000;
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
    
    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });
      
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  useEffect(() => {
    fetchLeaderboard();
    
    // Auto-refresh every 30 seconds
    const intervalId = setInterval(fetchLeaderboard, 30000);
    
    return () => clearInterval(intervalId);
  }, [viewMode, timeFilter, sessionCode]);

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'from-yellow-400 via-yellow-500 to-orange-500';
      case 2: return 'from-gray-300 via-gray-400 to-gray-600';
      case 3: return 'from-amber-600 via-amber-700 to-amber-800';
      case 4: return 'from-purple-500 via-purple-600 to-purple-700';
      case 5: return 'from-blue-500 via-blue-600 to-blue-700';
      default: return 'from-gray-700 via-gray-800 to-gray-900';
    }
  };

  const getRankGlow = (rank) => {
    switch (rank) {
      case 1: return 'shadow-[0_0_30px_rgba(255,215,0,0.5)]';
      case 2: return 'shadow-[0_0_20px_rgba(192,192,192,0.4)]';
      case 3: return 'shadow-[0_0_20px_rgba(205,127,50,0.4)]';
      default: return '';
    }
  };

  const getBadgeIcon = (badge) => {
    switch (badge) {
      case 'legend': return <Crown className="w-4 h-4" />;
      case 'speedster': return <Zap className="w-4 h-4" />;
      case 'perfectionist': return <Target className="w-4 h-4" />;
      case 'strategist': return <Swords className="w-4 h-4" />;
      case 'consistent': return <TrendingUp className="w-4 h-4" />;
      case 'unstoppable': return <Rocket className="w-4 h-4" />;
      case 'accuracy': return <Target className="w-4 h-4" />;
      case 'rising': return <ChevronUp className="w-4 h-4" />;
      case 'combatant': return <Shield className="w-4 h-4" />;
      case 'explorer': return <Eye className="w-4 h-4" />;
      case 'beginner': return <Star className="w-4 h-4" />;
      case 'learner': return <Gamepad2 className="w-4 h-4" />;
      case 'coder': return <Gamepad2 className="w-4 h-4" />;
      case 'quick': return <Zap className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'legend': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'speedster': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'perfectionist': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'strategist': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'unstoppable': return 'bg-gradient-to-r from-red-500 to-rose-500';
      default: return 'bg-gradient-to-r from-gray-600 to-gray-700';
    }
  };

  const renderAvatar = (user) => {
    const isTop3 = user.rank <= 3;
    const isCurrentUser = user.isCurrentUser;
    
    return (
      <div className="relative">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center ${
            isCurrentUser 
              ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
              : isTop3
                ? getRankColor(user.rank)
                : 'bg-gradient-to-r from-gray-700 to-gray-900'
          } ${getRankGlow(user.rank)}`}
        >
          <span className="text-white font-bold text-xl">
            {user.avatar}
          </span>
          
          {isTop3 && (
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
          )}
          
          {user.online && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
          )}
        </motion.div>
        
        {user.streak >= 5 && showStreaks && (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-2 py-1 rounded-full flex items-center space-x-1">
              <Flame className="w-3 h-3 text-white" />
              <span className="text-xs font-bold text-white">{user.streak}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRankBadge = (rank) => {
    if (rank <= 3) {
      return (
        <motion.div
          animate={{ 
            scale: pulseRank === rank ? [1, 1.2, 1] : 1,
            rotate: pulseRank === rank ? [0, 5, -5, 0] : 0
          }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            rank === 1 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
            rank === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
            'bg-gradient-to-r from-amber-700 to-amber-900'
          } ${getRankGlow(rank)}`}>
            {rank === 1 && <Crown className="w-6 h-6 text-white" />}
            {rank === 2 && <Medal className="w-6 h-6 text-white" />}
            {rank === 3 && <Medal className="w-6 h-6 text-white" />}
          </div>
          {rank <= 3 && (
            <div className="absolute -top-1 -right-1 animate-ping w-4 h-4 bg-yellow-400 rounded-full opacity-75"></div>
          )}
        </motion.div>
      );
    }
    
    return (
      <motion.div 
        whileHover={{ scale: 1.1 }}
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
          pulseRank === rank 
            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse' 
            : 'bg-gray-800'
        }`}
      >
        <span className={`font-bold ${
          pulseRank === rank ? 'text-white' : 'text-gray-400'
        }`}>
          {rank}
        </span>
      </motion.div>
    );
  };

  // Loading state
  if (loading && leaderboardData.length === 0) {
    return (
      <div className={`bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl border border-gray-700/50 ${compact ? 'p-4' : 'p-6'} overflow-hidden relative`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-800/20 to-transparent animate-shimmer"></div>
        <div className="flex flex-col items-center justify-center h-96">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-gray-700 border-t-yellow-500 rounded-full animate-spin"></div>
            <Trophy className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-yellow-500" size={32} />
          </div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="mt-6 text-lg font-semibold text-gray-300"
          >
            Loading epic leaderboard...
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl border border-gray-700/50 ${compact ? 'p-4' : 'p-6'} overflow-hidden relative`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/3 to-cyan-500/3 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative mb-8">
        <div className="flex items-center justify-between">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center space-x-4"
          >
            <div className="relative">
              <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl backdrop-blur-sm">
                <Trophy className="text-yellow-400" size={28} />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full animate-ping"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                {sessionCode ? 'Session Leaderboard' : 'Quantum Leaderboard'}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400 font-semibold">LIVE</span>
                </div>
                <span className="text-sm text-gray-400">• Updated just now</span>
                <span className="text-sm text-gray-400">• {stats.activePlayers || 0} online</span>
              </div>
            </div>
          </motion.div>

          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl backdrop-blur-sm border border-gray-700"
            >
              <Filter className="text-gray-300" size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchLeaderboard}
              className="p-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-xl backdrop-blur-sm border border-blue-500/30"
            >
              <RefreshCw className="text-cyan-400" size={20} />
            </motion.button>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['daily', 'weekly', 'monthly', 'all'].map((period) => (
                    <motion.button
                      key={period}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setTimeFilter(period)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        timeFilter === period
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                      }`}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </motion.button>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700/50">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowStreaks(!showStreaks)}
                      className={`p-2 rounded-lg ${showStreaks ? 'bg-green-500/20 text-green-400' : 'bg-gray-800/50 text-gray-400'}`}
                    >
                      <Flame className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-400">Show Streaks</span>
                  </div>
                  {!sessionCode && (
                    <div className="flex space-x-2">
                      {['global', 'friends'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setViewMode(mode)}
                          className={`px-3 py-1 rounded-full text-xs ${
                            viewMode === mode
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Display */}
      {error && !compact && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl backdrop-blur-sm"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-500/20 rounded-xl">
              <AlertCircle className="text-yellow-400" size={20} />
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold">Demo Mode Active</div>
              <div className="text-gray-400 text-sm">Using demo data. Real leaderboard will connect when backend is ready.</div>
            </div>
            <button
              onClick={fetchLeaderboard}
              className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold text-sm"
            >
              Retry
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      {!compact && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { icon: <Users className="w-5 h-5" />, label: 'Players', value: stats.totalPlayers, color: 'from-blue-500 to-cyan-500', change: '+12%' },
            { icon: <Target className="w-5 h-5" />, label: 'Avg Accuracy', value: `${stats.averageAccuracy}%`, color: 'from-green-500 to-emerald-500', change: '+3.2%' },
            { icon: <Clock className="w-5 h-5" />, label: 'Avg Time', value: `${stats.averageTime}s`, color: 'from-purple-500 to-pink-500', change: '-1.4s' },
            { icon: <BarChart3 className="w-5 h-5" />, label: 'Total Points', value: `${(stats.totalPoints / 1000).toFixed(1)}K`, color: 'from-orange-500 to-red-500', change: '+8.7K' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50 group hover:border-gray-600/50 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 bg-gradient-to-r ${stat.color} rounded-xl`}>
                  {stat.icon}
                </div>
                <span className="text-xs px-2 py-1 bg-gray-800 rounded-full text-green-400">
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Top 3 Podium - Epic Version */}
      {!compact && leaderboardData.slice(0, 3).length > 0 && (
        <div className="relative mb-12">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
          <div className="grid grid-cols-3 gap-6 relative">
            {leaderboardData.slice(0, 3).map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                className={`relative ${
                  player.rank === 1 
                    ? 'order-2 -mt-8' 
                    : player.rank === 2 
                      ? 'order-1 mt-4' 
                      : 'order-3 mt-6'
                }`}
                onMouseEnter={() => setHighlightedUser(player.id)}
                onMouseLeave={() => setHighlightedUser(null)}
              >
                {/* Podium Base */}
                <div className={`absolute bottom-0 left-0 right-0 h-${
                  player.rank === 1 ? '12' : player.rank === 2 ? '8' : '10'
                } bg-gradient-to-t ${
                  player.rank === 1 ? 'from-yellow-600/30 to-yellow-400/10' :
                  player.rank === 2 ? 'from-gray-500/30 to-gray-400/10' :
                  'from-amber-800/30 to-amber-600/10'
                } rounded-t-2xl backdrop-blur-sm`}></div>
                
                {/* Player Card */}
                <div className={`relative bg-gradient-to-b ${getRankColor(player.rank)} rounded-3xl p-6 border-2 ${
                  player.rank === 1 ? 'border-yellow-500/50' : 
                  player.rank === 2 ? 'border-gray-400/50' : 
                  'border-amber-600/50'
                } ${getRankGlow(player.rank)} transform ${
                  highlightedUser === player.id ? 'scale-105' : 'scale-100'
                } transition-all duration-300`}>
                  
                  {/* Crown for #1 */}
                  {player.rank === 1 && (
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Crown className="w-10 h-10 text-yellow-400" />
                      </motion.div>
                    </div>
                  )}
                  
                  {/* Avatar */}
                  <div className="flex justify-center mb-4">
                    {renderAvatar(player)}
                  </div>
                  
                  {/* Player Info */}
                  <div className="text-center">
                    <h3 className="font-bold text-white text-lg mb-2 truncate">
                      {player.name}
                    </h3>
                    
                    {/* Score */}
                    <div className="text-3xl font-bold text-white mb-3">
                      {player.score.toLocaleString()}
                      <span className="text-lg text-yellow-300"> pts</span>
                    </div>
                    
                    {/* Badges */}
                    {player.badges.length > 0 && (
                      <div className="flex justify-center space-x-1 mb-3">
                        {player.badges.slice(0, 2).map((badge, idx) => (
                          <div
                            key={idx}
                            className={`${getBadgeColor(badge)} p-1.5 rounded-full`}
                            title={badge}
                          >
                            {getBadgeIcon(badge)}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-center p-2 bg-black/20 rounded-lg">
                        <div className="text-green-400 font-bold">{player.accuracy}%</div>
                        <div className="text-gray-300 text-xs">Accuracy</div>
                      </div>
                      <div className="text-center p-2 bg-black/20 rounded-lg">
                        <div className="text-yellow-400 font-bold">{player.streak}</div>
                        <div className="text-gray-300 text-xs">Streak</div>
                      </div>
                    </div>
                    
                    {/* Level */}
                    <div className="mt-3">
                      <div className="text-xs text-gray-300 mb-1">Level {player.level}</div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-cyan-500 rounded-full h-1.5"
                          style={{ width: `${(player.level % 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-3 relative">
        <AnimatePresence>
          {leaderboardData.slice(compact ? 0 : 3).map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ delay: (compact ? index : index + 3) * 0.03 }}
              whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.05)' }}
              className={`relative flex items-center justify-between p-4 rounded-2xl backdrop-blur-sm border ${
                player.isCurrentUser
                  ? 'bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-indigo-500/30'
                  : 'bg-gray-800/20 border-gray-700/30'
              } hover:border-gray-600/50 transition-all group`}
              onMouseEnter={() => setHighlightedUser(player.id)}
              onMouseLeave={() => setHighlightedUser(null)}
            >
              {/* Animated border on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-gray-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Left Section */}
              <div className="flex items-center space-x-4 relative z-10">
                {/* Rank Badge */}
                {renderRankBadge(player.rank)}
                
                {/* Avatar */}
                {renderAvatar(player)}
                
                {/* Player Info */}
                <div>
                  <div className="flex items-center space-x-3">
                    <span className={`font-bold text-lg ${
                      player.isCurrentUser 
                        ? 'bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent'
                        : 'text-white'
                    }`}>
                      {player.name}
                    </span>
                    
                    {/* Online Status */}
                    {player.online && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-400">Online</span>
                      </div>
                    )}
                    
                    {/* Current User Badge */}
                    {player.isCurrentUser && (
                      <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-full">
                        YOU
                      </span>
                    )}
                  </div>
                  
                  {/* Stats Row */}
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <Target className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-300">{player.accuracy}% acc</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-yellow-400">{player.streak} streak</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-300">Lvl {player.level}</span>
                    </div>
                  </div>
                  
                  {/* Badges */}
                  {player.badges.length > 0 && (
                    <div className="flex items-center space-x-1 mt-2">
                      {player.badges.map((badge, idx) => (
                        <div
                          key={idx}
                          className="tooltip"
                          data-tip={badge.charAt(0).toUpperCase() + badge.slice(1)}
                        >
                          <div className={`${getBadgeColor(badge)} p-1 rounded-lg`}>
                            {getBadgeIcon(badge)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right Section */}
              <div className="text-right relative z-10">
                <div className="text-2xl font-bold text-white mb-1">
                  {player.score.toLocaleString()}
                  <span className="text-sm text-gray-400 ml-1">pts</span>
                </div>
                
                {/* Progress Indicator */}
                {player.rank > 1 && index > 0 && (
                  <div className="flex items-center justify-end space-x-2">
                    {player.score > leaderboardData[index + (compact ? 0 : 2)]?.score ? (
                      <div className="flex items-center text-green-400 text-sm">
                        <ChevronUp className="w-4 h-4" />
                        <span>↑ Trending</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-400 text-sm">
                        <ChevronDown className="w-4 h-4" />
                        <span>↓ Falling</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Last Active */}
                <div className="text-xs text-gray-500 mt-1">
                  {player.lastActive}
                </div>
              </div>
              
              {/* Hover Effect Line */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {!compact && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 pt-6 border-t border-gray-700/50"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing <span className="text-white font-semibold">{leaderboardData.length}</span> players
              <span className="mx-2">•</span>
              <span className="text-green-400">{stats.activePlayers || 0} active</span>
              <span className="mx-2">•</span>
              <span className="text-yellow-400">Period: {timeFilter}</span>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const currentUser = leaderboardData.find(u => u.isCurrentUser);
                if (currentUser && containerRef.current) {
                  const element = document.querySelector(`[data-rank="${currentUser.rank}"]`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                  setPulseRank(currentUser.rank);
                  setTimeout(() => setPulseRank(null), 1000);
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold flex items-center space-x-2 hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
            >
              <Rocket className="w-4 h-4" />
              <span>Find Me</span>
            </motion.button>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 mt-6 text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"></div>
              <span>Top 3</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
              <span>You</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <Flame className="w-3 h-3 text-orange-500" />
              <span>Hot Streak</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Add data-rank attributes for Find Me button */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .tooltip {
          position: relative;
        }
        .tooltip:hover::before {
          content: attr(data-tip);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          z-index: 100;
        }
      `}</style>
    </div>
  );
};

export default Leaderboard;