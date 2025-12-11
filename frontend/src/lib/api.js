// src/lib/api.js
import axios from "axios";
// Force reload

const API_URL = import.meta.env.VITE_API_URL || "https://quizito-backend.onrender.com";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true, // enable if you use httpOnly cookies
});

// Helper to set/remove Authorization header globally on the instance
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export default api;
