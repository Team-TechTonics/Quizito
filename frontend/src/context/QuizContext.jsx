// src/context/QuizContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../lib/api";
import { useAuth } from "./AuthContext";

const QuizContext = createContext();

export const useQuiz = () => {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz must be used within QuizProvider");
  return ctx;
};

export const QuizProvider = ({ children }) => {
  // Optionally we can read auth for gating or to trigger fetches on login/logout
  const { user, token } = useAuth();

  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Optionally fetch a public list on mount — you can remove if not wanted
    fetchQuizzes().catch(() => { });
  }, []);

  const fetchQuizzes = async (opts = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/api/quizzes", { params: opts });
      setQuizzes(res.data.quizzes || []);
      return res.data;
    } catch (err) {
      console.error("fetchQuizzes error:", err);
      toast.error(err.response?.data?.message || "Failed to fetch quizzes");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createQuiz = async (quizData) => {
    setLoading(true);
    try {
      const res = await api.post("/api/quizzes", quizData);
      toast.success("Quiz created successfully");
      return res.data.quiz;
    } catch (err) {
      console.error("createQuiz error:", err);
      toast.error(err.response?.data?.message || "Failed to create quiz");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateAIQuiz = async ({ topic, numQuestions, difficulty }) => {
    setLoading(true);
    try {
      const response = await api.post("/api/ai/generate", {
        topic,
        numQuestions,
        difficulty
      });

      toast.success("AI quiz generated successfully");
      return response.data.quiz;
    } catch (error) {
      console.error("AI Generation Error:", error);
      toast.error(error.response?.data?.message || "Failed to generate AI quiz");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (quizId, settings = {}) => {
    setLoading(true);
    try {
      const res = await api.post("/api/sessions", { quizId, settings });
      return res.data.session || res.data;
    } catch (err) {
      console.error("createSession error:", err);
      toast.error(err.response?.data?.message || "Failed to create session");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSession = async (roomCode) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/sessions/${roomCode}`);
      return res.data.session;
    } catch (err) {
      console.error("getSession error:", err);
      toast.error(err.response?.data?.message || "Failed to fetch session");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const saveResults = async (roomCode, answers = [], timeSpent = 0) => {
    setLoading(true);
    try {
      const res = await api.post(`/api/sessions/${roomCode}/save-results`, { answers, timeSpent });
      return res.data;
    } catch (err) {
      console.error("saveResults error:", err);
      toast.error(err.response?.data?.message || "Failed to save results");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get analytics for the specified user (or current user)
  const getAnalytics = async (userId) => {
    setLoading(true);
    try {
      if (!userId && user) userId = user._id;
      const res = await api.get(`/api/analytics/user/${userId}`);
      return res.data.analytics;
    } catch (err) {
      console.error("getAnalytics error:", err);
      toast.error(err.response?.data?.message || "Failed to fetch analytics");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    quizzes,
    currentQuiz,
    sessions,
    loading,
    fetchQuizzes,
    createQuiz,
    generateAIQuiz,
    createSession,
    getSession,
    saveResults,
    getAnalytics,
    setCurrentQuiz,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};
