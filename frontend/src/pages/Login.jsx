import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LogIn, Mail, Lock, Eye, EyeOff, User, Brain,
  Sparkles, ArrowRight, AlertCircle, Chrome as ChromeIcon, Github
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 🟢 Use AuthContext instead of QuizContext
  const { login, authLoading, githubLogin } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const from = location.state?.from?.pathname || '/';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // 🟢 Login with correct signature
    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success('Welcome back! 🎉');
      navigate(from, { replace: true });
    }
  };

  const handleDemoLogin = async () => {
    const result = await login('demo@quizito.com', 'demopass123');
    if (result.success) {
      toast.success('Demo login successful! 🎉');
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">

          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-3 group">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl">
                <Brain className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Quizito
                </h1>
                <p className="text-gray-600">AI-Powered Quiz Platform</p>
              </div>
            </Link>
          </motion.div>

          {/* Login Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
                  <LogIn className="text-indigo-600" size={32} />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
                <p className="text-gray-600 mt-2">Sign in to continue to Quizito</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 bg-gray-50 border-2 rounded-xl focus:ring-2 ${errors.email ? 'border-red-300' : 'border-gray-200 focus:border-indigo-500'
                        }`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-600 text-sm flex items-center gap-2 mt-1">
                      <AlertCircle size={16} /> {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-12 py-3 bg-gray-50 border-2 rounded-xl focus:ring-2 ${errors.password ? 'border-red-300' : 'border-gray-200 focus:border-indigo-500'
                        }`}
                      placeholder="Enter your password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-600 text-sm flex items-center gap-2 mt-1">
                      <AlertCircle size={16} /> {errors.password}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3"
                >
                  {authLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={24} /> <span>Sign In</span> <ArrowRight size={20} />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="text-gray-500 text-sm">or</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* Demo Login */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDemoLogin}
                className="w-full py-3 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl font-medium"
              >
                <Sparkles size={18} className="inline-block mr-2" />
                Try Demo Account
              </motion.button>

              {/* GitHub Login */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={githubLogin}
                type="button"
                className="w-full py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <Github size={20} />
                <span>Sign in with GitHub</span>
              </motion.button>

              {/* Register Link */}
              <p className="mt-6 text-center text-gray-600">
                Don't have an account?{" "}
                <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500">
                  Sign up
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;