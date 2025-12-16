// src/pages/Auth.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const BASE_URL = "https://quizito-backend.onrender.com";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clear previous errors
      toast.dismiss();

      // Validation
      if (!form.email || !form.password || (mode === "register" && !form.username)) {
        toast.error("Please fill all fields");
        setLoading(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        toast.error("Please enter a valid email address");
        setLoading(false);
        return;
      }

      // Password validation
      if (form.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        setLoading(false);
        return;
      }

      if (mode === "register" && form.password !== form.confirmPassword) {
        toast.error("Passwords do not match");
        setLoading(false);
        return;
      }

      if (mode === "register" && form.username.length < 3) {
        toast.error("Username must be at least 3 characters");
        setLoading(false);
        return;
      }

      // Prepare URL and data
      const url = mode === "login" 
        ? `${BASE_URL}/api/auth/login`
        : `${BASE_URL}/api/auth/register`;

      const data = mode === "login"
        ? { 
            email: form.email.toLowerCase().trim(), 
            password: form.password 
          }
        : { 
            username: form.username.trim(), 
            email: form.email.toLowerCase().trim(), 
            password: form.password 
          };

      console.log("🚀 Sending to:", url);

      const response = await axios.post(url, data);
      const result = response.data;

      console.log("✅ Response:", result);

      if (!result.success) {
        toast.error(result.message || "Authentication failed");
        setLoading(false);
        return;
      }

      // Save token and user to localStorage
      localStorage.setItem("quizito_token", result.token);
      localStorage.setItem("quizito_user", JSON.stringify(result.user));

      toast.success(mode === "login" ? "Logged in successfully! 🎉" : "Account created successfully! 🎉");
      
      // Redirect to home page WITH PAGE RELOAD
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);

    } catch (error) {
      console.error("❌ Error:", error);
      
      if (error.response) {
        // Server responded with error
        const serverResponse = error.response.data;
        
        if (serverResponse.message) {
          toast.error(serverResponse.message);
        } else if (error.response.status === 400) {
          toast.error("Bad request. Please check your input.");
        } else if (error.response.status === 401) {
          toast.error("Invalid email or password");
        } else if (error.response.status === 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error("Authentication failed");
        }
      } else if (error.request) {
        // No response received
        toast.error("Cannot connect to server. Check your internet connection.");
      } else {
        // Other errors
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTest = async () => {
    try {
      toast.loading("Testing connection...");
      const response = await axios.get(`${BASE_URL}/health`);
      toast.dismiss();
      toast.success(`✅ Backend is healthy! Database: ${response.data.db}`);
      console.log("Health check:", response.data);
    } catch (error) {
      toast.dismiss();
      toast.error("❌ Cannot connect to backend");
      console.error("Health check failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="p-8 bg-white rounded-2xl shadow-2xl w-full max-w-md">
        
        {/* Test connection button */}
        <button 
          onClick={handleQuickTest}
          className="mb-4 p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm w-full"
        >
          🧪 Test Backend Connection
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">QUIZITO</h1>
          <p className="text-gray-600 mt-2">
            {mode === "login" ? "Welcome back!" : "Create your account"}
          </p>
        </div>

        <div className="flex mb-6 bg-gray-100 p-1 rounded-xl">
          <button 
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              mode === "login" 
                ? "bg-white text-blue-600 shadow-lg" 
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button 
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              mode === "register" 
                ? "bg-white text-blue-600 shadow-lg" 
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username (min 3 characters)
              </label>
              <input
                name="username"
                placeholder="Enter username"
                value={form.username}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={handleChange}
                minLength={3}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              value={form.email}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password (min 6 characters)
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={form.confirmPassword}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={handleChange}
                minLength={6}
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-lg font-semibold transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg"
            } text-white`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : mode === "login" ? (
              "Login to Quizito"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-600">
            {mode === "login" 
              ? "Don't have an account? " 
              : "Already have an account? "}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 font-medium"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                if (mode === "register") {
                  setForm({...form, confirmPassword: ""});
                }
              }}
            >
              {mode === "login" ? "Register here" : "Login here"}
            </button>
          </p>
        </div>

        {/* Debug info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">
            <strong>Note:</strong> After successful login, you'll be redirected to home page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
