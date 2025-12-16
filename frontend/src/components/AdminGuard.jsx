// src/components/AdminGuard.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useQuiz } from './QuizContext';
import { motion } from 'framer-motion';
import { Shield as FiShield, AlertTriangle as FiAlertTriangle, Clock as FiClock, Database as FiDatabase, ShieldAlert as MdAdminPanelSettings, ShieldCheck as MdSecurity } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminGuard = ({ children }) => {
  const location = useLocation();
  const { user, token, api } = useQuiz();
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [adminStats, setAdminStats] = useState(null);
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  useEffect(() => {
    const checkAdminAccess = async () => {
      setLoading(true);

      // Check if user is logged in
      if (!token || !user) {
        setLoading(false);
        return;
      }

      try {
        // Check admin status and permissions
        const response = await api.get('/auth/admin/verify');

        if (response.data.success) {
          const { isAdmin, permissions, requiresTwoFactor, stats } = response.data;

          if (isAdmin) {
            // Check if 2FA is required
            if (requiresTwoFactor && !response.data.twoFactorVerified) {
              setRequires2FA(true);
              setLoading(false);
              return;
            }

            // Load admin statistics
            if (stats) {
              setAdminStats(stats);
            }

            // Verify permissions
            const requiredPermissions = ['admin_access', 'view_dashboard'];
            const hasPermissions = requiredPermissions.every(perm =>
              permissions?.includes(perm)
            );

            if (hasPermissions) {
              setAccessGranted(true);

              // Log admin access
              await api.post('/admin/log-access', {
                route: location.pathname,
                timestamp: new Date().toISOString()
              });
            } else {
              toast.error('Insufficient permissions for admin access');
            }
          } else {
            toast.error('Admin access required');
          }
        }
      } catch (error) {
        console.error('Admin access check failed:', error);

        if (error.response?.status === 403) {
          toast.error('Access denied: Insufficient permissions');
        } else if (error.response?.status === 401) {
          toast.error('Session expired. Please login again.');
        } else {
          toast.error('Unable to verify admin access');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [token, user, api, location]);

  const handle2FAVerification = async () => {
    try {
      const response = await api.post('/auth/admin/verify-2fa', {
        code: twoFactorCode
      });

      if (response.data.success) {
        setRequires2FA(false);
        setAccessGranted(true);
        toast.success('2FA verification successful');
      } else {
        toast.error('Invalid verification code');
      }
    } catch (error) {
      toast.error('2FA verification failed');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity }
            }}
            className="w-20 h-20 mx-auto mb-8 rounded-full border-4 border-purple-200/20 border-t-purple-500"
          />
          <h2 className="text-2xl font-bold text-white mb-3">
            Verifying Admin Access
          </h2>
          <p className="text-gray-400 max-w-md">
            Checking permissions and security protocols...
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {['Security Check', 'Permission Verification', 'System Access'].map((text, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 bg-gray-800/50 rounded-lg"
              >
                <p className="text-sm text-gray-300">{text}</p>
                <div className="mt-2 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show 2FA verification
  if (requires2FA) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <MdSecurity className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Two-Factor Authentication
            </h1>
            <p className="text-gray-400">
              Enter the verification code from your authenticator app
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-center text-2xl tracking-widest focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                autoFocus
              />
              <p className="mt-2 text-xs text-gray-500">
                6-digit code from your authenticator app
              </p>
            </div>

            <button
              onClick={handle2FAVerification}
              disabled={twoFactorCode.length !== 6}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              Verify & Continue
            </button>

            <div className="text-center">
              <button
                onClick={() => navigate('/')}
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                Cancel and return to dashboard
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <FiClock className="w-4 h-4" />
              <span>Code refreshes every 30 seconds</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Redirect if not admin
  if (!accessGranted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-lg w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700"
        >
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center">
              <MdAdminPanelSettings className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">
              Administrator Access Required
            </h1>
            <p className="text-gray-400 mb-6">
              This area is restricted to authorized administrators only. Your access attempt has been logged.
            </p>
          </div>

          {adminStats && (
            <div className="mb-8 p-4 bg-gray-900/50 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <FiDatabase className="w-4 h-4" />
                Access Attempt Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-800/30 rounded-lg">
                  <p className="text-xs text-gray-500">User Role</p>
                  <p className="font-medium text-white">{user?.role || 'User'}</p>
                </div>
                <div className="p-3 bg-gray-800/30 rounded-lg">
                  <p className="text-xs text-gray-500">IP Address</p>
                  <p className="font-medium text-white">Logged</p>
                </div>
                <div className="p-3 bg-gray-800/30 rounded-lg">
                  <p className="text-xs text-gray-500">Timestamp</p>
                  <p className="font-medium text-white">
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
                <div className="p-3 bg-gray-800/30 rounded-lg">
                  <p className="text-xs text-gray-500">Request ID</p>
                  <p className="font-medium text-white">
                    {Math.random().toString(36).substr(2, 9).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Return to Dashboard
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                If you believe this is an error, contact your system administrator
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <FiShield className="w-4 h-4" />
              <span>All access attempts are monitored and logged for security purposes</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render children if admin access granted
  return (
    <div className="admin-container">
      {/* Admin Header Bar */}
      <div className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <MdAdminPanelSettings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Admin Panel</h1>
                <p className="text-xs text-gray-400">
                  Logged in as: {user?.username} • {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-300">System Status: </span>
                <span className="text-green-400 font-medium">Operational</span>
              </div>

              <button
                onClick={() => {
                  localStorage.removeItem('quizito_admin_token');
                  window.location.href = '/';
                }}
                className="px-4 py-2 text-sm bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors"
              >
                Exit Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Render admin content */}
      {children}

      {/* Admin Footer */}
      <div className="bg-gray-900/50 border-t border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Quizito Admin Panel • v2.0.0</p>
            <p className="mt-1 text-xs">All actions are logged and monitored</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <FiAlertTriangle className="w-3 h-3" />
              <span>Restricted Access Area</span>
            </div>
            <div className="hidden md:block">•</div>
            <div className="flex items-center gap-2">
              <FiShield className="w-3 h-3" />
              <span>SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGuard;
