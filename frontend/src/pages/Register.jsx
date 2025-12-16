import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  UserPlus, User, Mail, Lock, Eye, EyeOff, Check,
  Brain, ArrowRight, AlertCircle, Chrome as ChromeIcon, Github
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register, authLoading, githubLogin } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }

    // Check password strength
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength >= 75) return 'from-green-500 to-emerald-500';
    if (passwordStrength >= 50) return 'from-yellow-500 to-orange-500';
    if (passwordStrength >= 25) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-700';
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

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

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await register(
      formData.name,
      formData.email,
      formData.password
    );

    if (result.success) {
      toast.success('Account created successfully! 🎉');
      navigate('/');
    }
  };

  const handleGoogleSignup = () => {
    // Google OAuth is already working, this function is for the existing button
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:10000'}/api/auth/google`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-3 group">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl group-hover:scale-110 transition-transform">
                <Brain className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Quizito
                </h1>
                <p className="text-gray-600">Create your free account</p>
              </div>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center">
                  <UserPlus className="text-green-600" size={32} />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Join Quizito</h2>
                <p className="text-gray-600 mt-2">Start creating amazing quizzes today</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 bg-gray-50 border-2 rounded-xl focus:ring-2 focus:ring-indigo-200 transition-all ${errors.name ? 'border-red-300' : 'border-gray-200 focus:border-indigo-500'
                        }`}
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.name && (
                    <div className="flex items-center space-x-2 mt-2 text-red-600 text-sm">
                      <AlertCircle size={16} />
                      <span>{errors.name}</span>
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 bg-gray-50 border-2 rounded-xl focus:ring-2 focus:ring-indigo-200 transition-all ${errors.email ? 'border-red-300' : 'border-gray-200 focus:border-indigo-500'
                        }`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && (
                    <div className="flex items-center space-x-2 mt-2 text-red-600 text-sm">
                      <AlertCircle size={16} />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-12 py-3 bg-gray-50 border-2 rounded-xl focus:ring-2 focus:ring-indigo-200 transition-all ${errors.password ? 'border-red-300' : 'border-gray-200 focus:border-indigo-500'
                        }`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {/* Password Strength */}
                  {formData.password && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Password strength</span>
                        <span>{passwordStrength}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getPasswordStrengthColor()}`}
                          style={{ width: `${passwordStrength}%` }}
                        ></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className={`flex items-center space-x-2 text-sm ${formData.password.length >= 6 ? 'text-green-600' : 'text-gray-400'
                          }`}>
                          <Check size={16} />
                          <span>6+ characters</span>
                        </div>
                        <div className={`flex items-center space-x-2 text-sm ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'
                          }`}>
                          <Check size={16} />
                          <span>Uppercase letter</span>
                        </div>
                        <div className={`flex items-center space-x-2 text-sm ${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'
                          }`}>
                          <Check size={16} />
                          <span>Number</span>
                        </div>
                        <div className={`flex items-center space-x-2 text-sm ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'
                          }`}>
                          <Check size={16} />
                          <span>Special character</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {errors.password && (
                    <div className="flex items-center space-x-2 mt-2 text-red-600 text-sm">
                      <AlertCircle size={16} />
                      <span>{errors.password}</span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-12 py-3 bg-gray-50 border-2 rounded-xl focus:ring-2 focus:ring-indigo-200 transition-all ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200 focus:border-indigo-500'
                        }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="flex items-center space-x-2 mt-2 text-red-600 text-sm">
                      <AlertCircle size={16} />
                      <span>{errors.confirmPassword}</span>
                    </div>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    required
                    className="w-5 h-5 mt-1 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to="/terms" className="text-indigo-600 hover:underline font-medium">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-indigo-600 hover:underline font-medium">
                      Privacy Policy
                    </Link>
                  </span>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3"
                >
                  {authLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={24} />
                      <span>Create Account</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </motion.button>

                {/* Divider */}
                <div className="my-6 flex items-center">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="px-4 text-sm text-gray-500">Or sign up with</span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>

                {/* Google Signup */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleGoogleSignup}
                  className="w-full py-3 bg-white border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center justify-center space-x-3"
                >
                  <ChromeIcon className="text-red-500" size={24} />
                  <span>Sign up with Google</span>
                </motion.button>

                {/* GitHub Signup */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={githubLogin}
                  className="w-full py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-xl font-medium flex items-center justify-center space-x-3"
                >
                  <Github size={24} />
                  <span>Sign up with GitHub</span>
                </motion.button>

                {/* Login Link */}
                <div className="text-center">
                  <p className="text-gray-600">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="font-bold text-indigo-600 hover:text-indigo-500"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </form>
            </motion.div>

            {/* Right Column - Features */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Feature Cards */}
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Why Join Quizito?</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Brain size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold">AI-Powered Quizzes</h4>
                      <p className="text-indigo-100 text-sm">Generate quizzes from any content in seconds</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold">Live Competitions</h4>
                      <p className="text-indigo-100 text-sm">Host real-time multiplayer quiz sessions</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Check size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold">Detailed Analytics</h4>
                      <p className="text-indigo-100 text-sm">Track performance and improve your skills</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Join Our Community</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-indigo-600">10K+</div>
                    <div className="text-sm text-gray-600">Active Users</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">50K+</div>
                    <div className="text-sm text-gray-600">Quizzes Created</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">1M+</div>
                    <div className="text-sm text-gray-600">Questions Answered</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-yellow-600">4.9★</div>
                    <div className="text-sm text-gray-600">User Rating</div>
                  </div>
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-3xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Your Security Matters</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Check className="text-green-500" size={20} />
                    <span className="text-gray-700">End-to-end encryption</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="text-green-500" size={20} />
                    <span className="text-gray-700">No data sharing with third parties</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="text-green-500" size={20} />
                    <span className="text-gray-700">Regular security audits</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
