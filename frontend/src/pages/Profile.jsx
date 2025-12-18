import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { quizService } from '../services';
import {
  User, Mail, Lock, Camera, Globe, Award, Trophy,
  Edit, Save, X, Calendar, TrendingUp, Shield, Bell,
  CreditCard, Settings, LogOut, Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout, changePassword, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  const [profileData, setProfileData] = useState({
    name: user?.username || user?.name || '',
    email: user?.email || '',
    avatar: user?.profileImage || '',
    bio: user?.bio || 'Quiz enthusiast and lifelong learner',
    location: user?.location || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user?._id || user?.id) {
      setProfileData({
        name: user.username || user.name || '',
        email: user.email || '',
        avatar: user.profileImage || '',
        bio: user.bio || 'Quiz enthusiast and lifelong learner',
        location: user.location || '',
      });
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const userId = user._id || user.id;
      const data = await quizService.getUserAnalytics(userId);
      setAnalytics(data.analytics);
    } catch (err) {
      console.error("Failed to load analytics:", err);
      // Toast suppressed to avoid annoyance on load
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: 'Quizzes Taken',
      value: analytics?.overview?.totalQuizzesTaken || 0,
      icon: <Award />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Average Score',
      value: `${analytics?.overview?.averageScore || 0}%`,
      icon: <TrendingUp />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Current Streak',
      value: analytics?.overview?.currentStreak || 0,
      icon: <Trophy />,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      label: 'Rank',
      value: analytics?.overview?.rank > 0 ? `#${analytics.overview.rank}` : '-',
      icon: <Globe />,
      color: 'from-purple-500 to-pink-500'
    },
  ];

  // Use real data or empty array if none
  const recentActivities = analytics?.recentPerformance || [];

  const handleProfileUpdate = async () => {
    const result = await updateProfile(profileData);
    if (result.success) {
      setEditMode(false);
      toast.success('Profile updated successfully!');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const result = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });

    if (result.success) {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please login to view profile</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">My Profile</h1>
              <p className="text-gray-600 mt-2">Manage your account and track your progress</p>
            </div>
            <button
              onClick={logout}
              className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-lg flex items-center"
            >
              <LogOut className="mr-2" size={20} />
              Logout
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-32"></div>
                <div className="px-8 pb-8 -mt-16">
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="w-32 h-32 bg-white rounded-full p-1 shadow-lg">
                        {profileData.avatar ? (
                          <img
                            src={profileData.avatar}
                            alt="Profile"
                            className="w-full h-full rounded-full object-cover border-4 border-indigo-100"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="w-full h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center border-4 border-indigo-100"
                          style={{ display: profileData.avatar ? 'none' : 'flex' }}
                        >
                          <User className="text-white" size={48} />
                        </div>
                      </div>
                      {editMode && (
                        <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg text-gray-700 hover:text-indigo-600">
                          <Camera size={20} />
                        </button>
                      )}
                    </div>

                    {editMode ? (
                      <div className="w-full space-y-4 mt-6">
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                          placeholder="Full Name"
                        />
                        <textarea
                          value={profileData.bio}
                          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                          rows="3"
                          placeholder="About you..."
                        />
                      </div>
                    ) : (
                      <div className="text-center mt-6">
                        <h2 className="text-2xl font-bold text-gray-800">{profileData.name}</h2>
                        <p className="text-gray-600 mt-2">{profileData.bio}</p>
                        <div className="flex items-center justify-center space-x-2 mt-4">
                          <Globe size={16} className="text-gray-400" />
                          <span className="text-gray-500">{profileData.location || 'Location not set'}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-4 mt-6">
                      {editMode ? (
                        <>
                          <button
                            onClick={handleProfileUpdate}
                            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold flex items-center"
                          >
                            <Save className="mr-2" size={18} />
                            Save
                          </button>
                          <button
                            onClick={() => setEditMode(false)}
                            className="px-6 py-2 bg-gray-100 text-gray-600 rounded-xl font-semibold flex items-center"
                          >
                            <X className="mr-2" size={18} />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setEditMode(true)}
                          className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold flex items-center transition-transform hover:scale-105"
                        >
                          <Edit className="mr-2" size={18} />
                          Edit Profile
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg p-4 text-center hover:shadow-xl transition-shadow"
                  >
                    <div className={`inline-flex p-3 bg-gradient-to-r ${stat.color} rounded-xl mb-3 shadow-sm`}>
                      <div className="text-white">{stat.icon}</div>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Column - Tabs */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
                <div className="flex border-b border-gray-100 bg-gray-50/50 overflow-x-auto">
                  {['profile', 'security', 'notifications', 'billing'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 px-6 py-4 text-sm font-medium capitalize whitespace-nowrap transition-colors ${activeTab === tab
                        ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                        }`}
                    >
                      {tab === 'profile' && <User className="inline mr-2" size={16} />}
                      {tab === 'security' && <Shield className="inline mr-2" size={16} />}
                      {tab === 'notifications' && <Bell className="inline mr-2" size={16} />}
                      {tab === 'billing' && <CreditCard className="inline mr-2" size={16} />}
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'profile' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded-xl border border-gray-200">
                            <User className="text-gray-400 ml-2" size={20} />
                            <input
                              type="text"
                              value={profileData.name}
                              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                              className="flex-1 px-2 py-1 bg-transparent border-none focus:ring-0"
                              disabled={!editMode}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <div className="flex items-center space-x-3 bg-gray-100 p-2 rounded-xl border border-gray-200">
                            <Mail className="text-gray-400 ml-2" size={20} />
                            <input
                              type="email"
                              value={profileData.email}
                              disabled
                              className="flex-1 px-2 py-1 bg-transparent border-none text-gray-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                          </label>
                          <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded-xl border border-gray-200">
                            <Globe className="text-gray-400 ml-2" size={20} />
                            <input
                              type="text"
                              value={profileData.location}
                              onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                              className="flex-1 px-2 py-1 bg-transparent border-none focus:ring-0"
                              placeholder="City, Country"
                              disabled={!editMode}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Member Since
                          </label>
                          <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded-xl border border-gray-200">
                            <Calendar className="text-gray-400 ml-2" size={20} />
                            <span className="px-2 py-1 text-gray-600">
                              {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div className="mt-8">
                        <h4 className="text-lg font-bold text-gray-800 mb-4">Recent Quiz History</h4>
                        {recentActivities.length > 0 ? (
                          <div className="space-y-3">
                            {recentActivities.map((activity, index) => (
                              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div>
                                  <div className="font-medium text-gray-800">Completed "{activity.quizTitle}"</div>
                                  <div className="text-sm text-gray-600">Score: {activity.score} ({activity.percentage}%)</div>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {new Date(activity.date).toLocaleDateString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">No recent quiz activity found.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-800">Security Settings</h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="flex items-center space-x-3">
                            <Lock className="text-gray-400" size={20} />
                            <input
                              type="password"
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                              placeholder="Enter current password"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <div className="flex items-center space-x-3">
                            <Lock className="text-gray-400" size={20} />
                            <input
                              type="password"
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                              placeholder="Enter new password"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <div className="flex items-center space-x-3">
                            <Lock className="text-gray-400" size={20} />
                            <input
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                              placeholder="Confirm new password"
                            />
                          </div>
                        </div>

                        <button
                          onClick={handlePasswordChange}
                          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-transform hover:scale-105"
                        >
                          Change Password
                        </button>
                      </div>

                      <div className="pt-6 border-t border-gray-100">
                        <h4 className="text-lg font-bold text-gray-800 mb-4">Security Tips</h4>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-center space-x-2">
                            <Shield className="text-green-500" size={16} />
                            <span>Use a strong, unique password</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <Shield className="text-green-500" size={16} />
                            <span>Enable two-factor authentication (Coming Soon)</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === 'notifications' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-800">Notification Preferences</h3>
                      <div className="space-y-4">
                        {[
                          { label: 'Quiz invitations', desc: 'When someone invites you to a quiz', default: true },
                          { label: 'Quiz results', desc: 'When your quiz results are ready', default: true },
                          { label: 'Leaderboard updates', desc: 'When your rank changes', default: true },
                        ].map((setting, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                              <div className="font-medium text-gray-800">{setting.label}</div>
                              <div className="text-sm text-gray-600">{setting.desc}</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                defaultChecked={setting.default}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'billing' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-800">Billing Information</h3>
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h4 className="text-lg font-bold text-gray-800">Free Plan</h4>
                            <p className="text-gray-600">Current subscription</p>
                          </div>
                          <div className="text-3xl font-bold text-gray-800">$0<span className="text-lg text-gray-600">/month</span></div>
                        </div>

                        <div className="space-y-3 mb-6">
                          {[
                            'Create up to 5 quizzes per month',
                            'Join unlimited quizzes',
                            'Basic analytics',
                            'Community support',
                          ].map((feature, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <Check className="text-green-500" size={20} />
                              <span className="text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-transform hover:scale-105">
                          Upgrade to Pro
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
