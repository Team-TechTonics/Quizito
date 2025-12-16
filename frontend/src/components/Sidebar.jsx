// src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuiz } from './QuizContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home as FiHome, PlusSquare as FiPlusSquare, Users as FiUsers, TrendingUp as FiTrendingUp,
  Settings as FiSettings, User as FiUser, LogOut as FiLogOut, Award as FiAward, BarChart2 as FiBarChart2,
  Book as FiBook, Clock as FiClock, HelpCircle as FiHelpCircle, Zap as FiZap, ChevronLeft as FiChevronLeft,
  ChevronRight as FiChevronRight, Shield as FiShield, Database as FiDatabase, Globe as FiGlobe, Bell as FiBell, Map as FiMap,
  FileQuestion as MdQuiz, Trophy as MdLeaderboard, PieChart as MdAnalytics, ShieldAlert as MdAdminPanelSettings,
  GraduationCap as MdSchool, Layout as MdWorkspaces, Calendar as MdEventNote,
  Bot as AiFillRobot
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, variant = 'default' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, unreadNotifications } = useQuiz();
  const [activeItem, setActiveItem] = useState(location.pathname);
  const [expandedSections, setExpandedSections] = useState({});
  const [collapsed, setCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location]);

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const defaultMenuItems = [
    {
      section: 'Main',
      items: [
        {
          path: '/',
          icon: <FiHome size={20} />,
          label: 'Dashboard',
          badge: 'New'
        },
        {
          path: '/create-quiz',
          icon: <FiPlusSquare size={20} />,
          label: 'Create Quiz',
          sublabel: 'AI Powered'
        },
        {
          path: '/join-quiz',
          icon: <FiUsers size={20} />,
          label: 'Join Quiz'
        },
        {
          path: '/leaderboard',
          icon: <FiTrendingUp size={20} />,
          label: 'Leaderboard'
        },
        {
          path: '/learning-paths',
          icon: <FiMap size={20} />,
          label: 'Learning Paths',
          badge: 'New'
        },
      ]
    },
    {
      section: 'My Content',
      items: [
        {
          path: '/my-quizzes',
          icon: <MdQuiz size={20} />,
          label: 'My Quizzes',
          count: user?.stats?.quizzesCreated || 0
        },
        {
          path: '/history',
          icon: <FiClock size={20} />,
          label: 'Quiz History'
        },
        {
          path: '/achievements',
          icon: <FiAward size={20} />,
          label: 'Achievements',
          badge: `${user?.badges?.length || 0}`
        },
        {
          path: '/analytics',
          icon: <FiBarChart2 size={20} />,
          label: 'Analytics'
        },
      ]
    },
    {
      section: 'AI Tools',
      items: [
        {
          path: '/ai-generate',
          icon: <AiFillRobot size={20} />,
          label: 'AI Quiz Generator',
          premium: true
        },
        {
          path: '/pdf-to-quiz',
          icon: <FiBook size={20} />,
          label: 'PDF to Quiz'
        },
        {
          path: '/topic-analyzer',
          icon: <FiZap size={20} />,
          label: 'Topic Analyzer'
        },
      ]
    }
  ];

  const adminMenuItems = [
    {
      section: 'Admin Dashboard',
      items: [
        {
          path: '/admin',
          icon: <MdAdminPanelSettings size={20} />,
          label: 'Overview'
        },
        {
          path: '/admin/users',
          icon: <FiUsers size={20} />,
          label: 'User Management',
          count: '1.2K'
        },
        {
          path: '/admin/quizzes',
          icon: <MdQuiz size={20} />,
          label: 'Quiz Management',
          count: '456'
        },
        {
          path: '/admin/sessions',
          icon: <MdWorkspaces size={20} />,
          label: 'Live Sessions',
          badge: 'Live'
        },
      ]
    },
    {
      section: 'Analytics',
      items: [
        {
          path: '/admin/analytics',
          icon: <MdAnalytics size={20} />,
          label: 'Performance'
        },
        {
          path: '/admin/reports',
          icon: <FiBarChart2 size={20} />,
          label: 'Reports'
        },
        {
          path: '/admin/logs',
          icon: <FiDatabase size={20} />,
          label: 'System Logs'
        },
      ]
    },
    {
      section: 'System',
      items: [
        {
          path: '/admin/settings',
          icon: <FiSettings size={20} />,
          label: 'Settings'
        },
        {
          path: '/admin/security',
          icon: <FiShield size={20} />,
          label: 'Security'
        },
        {
          path: '/admin/ai-config',
          icon: <AiFillRobot size={20} />,
          label: 'AI Configuration'
        },
      ]
    }
  ];

  const menuItems = variant === 'dashboard' ? adminMenuItems : defaultMenuItems;

  const userStats = {
    level: user?.level || 1,
    xp: user?.xp || 0,
    nextLevelXP: 1000,
    rank: 'Gold',
    quizzesTaken: user?.stats?.quizzesTaken || 0,
    accuracy: user?.stats?.accuracy || 0,
    streak: user?.stats?.streak || 0,
  };

  const XPPercentage = (userStats.xp / userStats.nextLevelXP) * 100;

  const SidebarContent = () => (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      className="h-full flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 text-white overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3" onClick={onClose}>
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">Q</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                <FiZap size={8} />
              </div>
            </div>
            <div className={`transition-all duration-300 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Quizito
              </h1>
              <p className="text-xs text-gray-400">AI Quiz Platform</p>
            </div>
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* User Profile */}
      {variant === 'default' && user && (
        <div className={`p-4 border-b border-gray-700 ${collapsed ? 'px-2' : 'px-4'}`}>
          <div
            className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} cursor-pointer`}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className={`flex items-center ${collapsed ? '' : 'space-x-3'}`}>
              <div className="relative">
                <img
                  src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}&backgroundColor=4f46e5`}
                  alt={user.username}
                  className="w-10 h-10 rounded-full border-2 border-blue-500 shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </div>

              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{user.username}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs text-gray-400">Level {userStats.level}</span>
                    <span className="text-xs text-yellow-400">•</span>
                    <span className="text-xs text-yellow-400">{userStats.rank}</span>
                  </div>
                </div>
              )}
            </div>

            {!collapsed && (
              <div className="relative">
                <FiBell size={18} className="text-gray-400" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Profile Menu Dropdown */}
          <AnimatePresence>
            {showProfileMenu && !collapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                <div className="space-y-2">
                  <Link
                    to="/profile"
                    onClick={onClose}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <FiUser size={16} />
                    <span className="text-sm">Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={onClose}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <FiSettings size={16} />
                    <span className="text-sm">Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-red-900/20 text-red-400 transition-colors"
                  >
                    <FiLogOut size={16} />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* XP Progress Bar */}
          {!collapsed && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Level {userStats.level}</span>
                <span className="text-blue-400">{userStats.xp}/{userStats.nextLevelXP} XP</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(XPPercentage, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>{userStats.quizzesTaken} quizzes</span>
                <span>{userStats.accuracy}% accuracy</span>
                <span>🔥 {userStats.streak}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar">
        {menuItems.map((section, sectionIndex) => (
          <div key={section.section}>
            {!collapsed && (
              <button
                onClick={() => toggleSection(section.section)}
                className="flex items-center justify-between w-full px-2 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-300 transition-colors"
              >
                <span>{section.section}</span>
                <motion.div
                  animate={{ rotate: expandedSections[section.section] ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiChevronRight size={12} />
                </motion.div>
              </button>
            )}

            <AnimatePresence>
              {(expandedSections[section.section] || collapsed) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`space-y-1 ${collapsed ? 'mt-2' : ''}`}
                >
                  {section.items.map((item) => {
                    const isActive = activeItem === item.path;
                    const isSubActive = activeItem.startsWith(item.path) && item.path !== '/';

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={`flex items-center ${collapsed ? 'justify-center p-3' : 'justify-between px-3 py-2.5'} rounded-lg transition-all duration-200 group ${isActive || isSubActive
                          ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 text-white border-l-4 border-blue-500'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                          }`}
                        title={collapsed ? item.label : ''}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`relative ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-blue-400'}`}>
                            {item.icon}
                            {item.premium && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full"></div>
                            )}
                          </div>
                          {!collapsed && (
                            <span className="font-medium text-sm">{item.label}</span>
                          )}
                        </div>

                        {!collapsed && (
                          <div className="flex items-center space-x-2">
                            {item.count && (
                              <span className="text-xs px-1.5 py-0.5 bg-gray-700 rounded">
                                {item.count}
                              </span>
                            )}
                            {item.badge && (
                              <span className={`text-xs px-1.5 py-0.5 rounded ${item.badge === 'Live'
                                ? 'bg-red-900/30 text-red-400'
                                : 'bg-blue-900/30 text-blue-400'
                                }`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      {variant === 'default' && !collapsed && (
        <div className="p-4 border-t border-gray-700">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/create-quiz?ai=true')}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:opacity-90 transition-opacity"
            >
              <AiFillRobot size={16} />
              <span className="text-sm font-medium">AI Generate</span>
            </button>
            <button
              onClick={() => navigate('/join-quiz')}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FiGlobe size={16} />
              <span className="text-sm font-medium">Join Public Quiz</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        {variant === 'default' ? (
          <div className={`flex ${collapsed ? 'justify-center' : 'justify-between'} items-center`}>
            {!collapsed && (
              <div className="text-xs text-gray-500">
                <p>© {new Date().getFullYear()} Quizito</p>
                <p className="mt-1">v2.0.0</p>
              </div>
            )}
            <Link
              to="/help"
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-gray-700 transition-colors ${collapsed ? '' : 'ml-auto'}`}
              title="Help"
            >
              <FiHelpCircle size={collapsed ? 20 : 18} className="text-gray-400" />
            </Link>
          </div>
        ) : (
          <div className="text-center text-xs text-gray-500">
            <p>Admin Panel v2.0</p>
            <p className="mt-1">Restricted Access</p>
          </div>
        )}
      </div>
    </motion.div>
  );

  // For mobile overlay
  if (isOpen && variant !== 'dashboard') {
    return (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />

        <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
          <SidebarContent />
        </div>
      </>
    );
  }

  // For dashboard layout (always visible)
  if (variant === 'dashboard') {
    return (
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <SidebarContent />
      </div>
    );
  }

  // For desktop (collapsible)
  return (
    <div className={`hidden lg:flex h-full transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'
      }`}>
      <SidebarContent />
    </div>
  );
};

export default Sidebar;
