// src/pages/JoinQuiz.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services'; // Using centralized service
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/globals.css';

const JoinQuiz = () => {
  const { roomCode: routeRoomCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [roomCode, setRoomCode] = useState(routeRoomCode || '');
  const [username, setUsername] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Auto-fill username if available
    if (user?.username) {
      setUsername(user.username);
    } else {
      const saved = localStorage.getItem('username');
      if (saved) setUsername(saved);
    }
  }, [user]);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !roomCode.trim()) return;

    setIsJoining(true);
    setError('');

    // Save username preference
    if (!user) {
      localStorage.setItem('username', username);
    }

    // Connect socket if not already
    try {
      // We just navigate to PlayQuiz which handles the connection and logic.
      // This decouples the "landing" from the "game logic".
      navigate(`/play/${roomCode}`);
    } catch (err) {
      setError('Failed to join');
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20">
            <span className="text-3xl">🎮</span>
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
            Join Session
          </h1>
          <p className="text-gray-400 mt-2">Enter code to start playing</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
              Your Name
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. MasterMind"
              className="w-full px-5 py-4 bg-gray-900/50 border border-gray-600 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all placeholder:text-gray-600 font-bold"
              required
              maxLength={15}
            />
          </div>

          <div>
            <label htmlFor="roomCode" className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
              Room Code
            </label>
            <input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="e.g. A1B2"
              className="w-full px-5 py-4 bg-gray-900/50 border border-gray-600 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all placeholder:text-gray-600 font-mono text-xl tracking-widest text-center uppercase"
              required
              maxLength={8}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isJoining}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none"
          >
            {isJoining ? 'Joining...' : 'Enter Game 🚀'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-700/50 text-center">
          <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JoinQuiz;
