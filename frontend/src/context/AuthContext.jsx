// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { api, setAuthToken } from "../lib/api.js";

const AuthContext = createContext();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("quizito_token") || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // loading while verifying token
  const [authLoading, setAuthLoading] = useState(false); // loading for login/register actions

  // Immediately apply token to api instance (synchronous)
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  // Verify token and fetch user on mount (only after header is set)
  const verifyToken = useCallback(async (currentToken) => {
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // header already set above
      const { data } = await api.get("/api/auth/me");
      setUser(data.user);
    } catch (err) {
      console.error("verifyToken error:", err);
      // clear invalid token
      localStorage.removeItem("quizito_token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Run verifyToken synchronously after setting header
    verifyToken(token);
  }, [token, verifyToken]);

  // Login expects (email, password)
  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const res = await api.post("/api/auth/login", { email: email?.trim?.() ?? email, password });
      const newToken = res.data.token;
      const newUser = res.data.user;

      if (!newToken) {
        throw new Error(res.data?.message || "No token returned");
      }

      localStorage.setItem("quizito_token", newToken);
      setToken(newToken); // this will set header and trigger verify
      setUser(newUser);
      toast.success("Logged in successfully");
      setAuthLoading(false);
      return { success: true, user: newUser };
    } catch (error) {
      console.error("login error:", error);
      const message = error.response?.data?.message || error.message || "Login failed";
      toast.error(message);
      setAuthLoading(false);
      return { success: false, error: message };
    }
  };

  const register = async (username, email, password, role = 'student') => {
    setAuthLoading(true);
    try {
      const res = await api.post("/api/auth/register", {
        username,
        email: email?.trim?.(),
        password,
        role
      });
      const newToken = res.data.token;
      const newUser = res.data.user;

      localStorage.setItem("quizito_token", newToken);
      setToken(newToken);
      setUser(newUser);
      toast.success("Account created");
      setAuthLoading(false);
      return { success: true, user: newUser };
    } catch (error) {
      console.error("register error:", error);
      const message = error.response?.data?.message || error.message || "Registration failed";
      toast.error(message);
      setAuthLoading(false);
      return { success: false, error: message };
    }
  };

  const changePassword = async ({ currentPassword, newPassword }) => {
    setAuthLoading(true);
    try {
      const res = await api.post("/api/auth/change-password", {
        currentPassword,
        newPassword,
      });

      toast.success(res.data.message || "Password changed successfully");
      setAuthLoading(false);
      return { success: true, message: res.data.message };
    } catch (error) {
      console.error("changePassword error:", error);
      const message = error.response?.data?.message || error.message || "Failed to change password";
      toast.error(message);
      setAuthLoading(false);
      return { success: false, error: message };
    }
  };

  const updateProfile = async (profileData) => {
    setAuthLoading(true);
    try {
      const res = await api.put("/api/auth/profile", profileData);
      const updatedUser = res.data.user;

      setUser(updatedUser);
      toast.success(res.data.message || "Profile updated successfully");
      setAuthLoading(false);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error("updateProfile error:", error);
      const message = error.response?.data?.message || error.message || "Failed to update profile";
      toast.error(message);
      setAuthLoading(false);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem("quizito_token");
    setToken(null);
    setUser(null);
    setAuthToken(null);
    toast.success("Logged out");
  };

  const loginWithToken = (newToken) => {
    localStorage.setItem("quizito_token", newToken);
    setToken(newToken);
    toast.success("Successfully logged in");
  };

  const githubLogin = () => {
    // Redirect to backend GitHub OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:10000'}/api/auth/github`;
  };

  // Check for OAuth callback token in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    const errorFromUrl = urlParams.get('error');

    if (tokenFromUrl) {
      loginWithToken(tokenFromUrl);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (errorFromUrl) {
      toast.error('Authentication failed. Please try again.');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Helper: refresh user data on demand
  const refreshUser = async () => {
    if (!token) return null;
    try {
      const { data } = await api.get("/api/auth/me");
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error("refreshUser failed:", err);
      return null;
    }
  };

  // Role utility functions
  const getDashboardRoute = (role) => {
    switch (role) {
      case 'student':
        return '/student/dashboard';
      case 'teacher':
        return '/educator/dashboard';
      case 'admin':
        return '/admin';
      default:
        return '/';
    }
  };

  const isStudent = () => user?.role === 'student';
  const isEducator = () => user?.role === 'teacher';
  const isAdmin = () => user?.role === 'admin';

  const value = {
    user,
    token,
    loading,
    authLoading,
    login,
    register,
    loginWithToken,
    githubLogin,
    logout,
    refreshUser,
    changePassword,
    updateProfile,
    isAuthenticated: !!user,
    getDashboardRoute,
    isStudent,
    isEducator,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
