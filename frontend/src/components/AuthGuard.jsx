// src/components/AuthGuard.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useQuiz } from './QuizContext';
import { motion } from 'framer-motion';
import { Loader as FiLoader, Lock as FiLock, AlertCircle as FiAlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AuthGuard = ({ children, requireAdmin = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, api } = useQuiz();
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      setLoading(true);

      // Check if token exists
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Verify token with backend
        const response = await api.get('/auth/verify');

        if (response.data.success) {
          // Check admin requirement
          if (requireAdmin && response.data.user?.role !== 'admin') {
            toast.error('Admin access required');
            navigate('/');
            return;
          }

          setIsValid(true);
        } else {
          // Token invalid
          localStorage.removeItem('quizito_token');
          localStorage.removeItem('quizito_user');
          toast.error('Session expired. Please login again.');
        }
      } catch (error) {
        // Network error or invalid token
        localStorage.removeItem('quizito_token');
        localStorage.removeItem('quizito_user');

        if (error.response?.status !== 401) {
          toast.error('Unable to verify session. Please login again.');
        }
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();

    // Set up periodic token refresh
    const refreshInterval = setInterval(() => {
      if (token) {
        api.get('/auth/refresh').catch(() => {
          // Silent refresh failure
        });
      }
    }, 15 * 60 * 1000); // Refresh every 15 minutes

    return () => clearInterval(refreshInterval);
  }, [token, requireAdmin, navigate, api]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-blue-200 border-t-blue-600"
          />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Verifying Session
          </h2>
          <p className="text-gray-600 max-w-md">
            Please wait while we verify your authentication...
          </p>
          <div className="mt-6 w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!token || !isValid) {
    // Save the attempted location for redirect after login
    const redirectTo = location.pathname + location.search;
    localStorage.setItem('quizito_redirect', redirectTo);

    return (
      <Navigate
        to="/auth"
        state={{ from: location }}
        replace
      />
    );
  }

  // Check admin access if required
  if (requireAdmin && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-red-50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <FiLock className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Access Restricted
          </h1>
          <p className="text-gray-600 mb-6">
            This area requires administrator privileges. Please contact your system administrator if you believe this is an error.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render children if authenticated
  return children;
};

export default AuthGuard;
