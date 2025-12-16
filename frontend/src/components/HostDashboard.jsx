import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const HostDashboard = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);

  console.log('HostDashboard rendering with roomCode:', roomCode);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const token = localStorage.getItem('quizito_token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:10000'}/api/sessions/${roomCode}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
          setSession(data.session);
          setParticipants(data.session.participants || []);
        }
      } catch (err) {
        console.error('Failed to load session:', err);
        toast.error('Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [roomCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading host dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800/40 backdrop-blur-lg rounded-2xl border border-gray-700 p-6 mb-8">
          <h1 className="text-4xl font-bold mb-4">🎮 Host Dashboard</h1>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-gray-400 text-sm">Room Code</p>
              <p className="text-cyan-300 font-mono text-3xl font-bold">{roomCode}</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(roomCode);
                toast.success('Room code copied!');
              }}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold"
            >
              📋 Copy Code
            </button>
          </div>
        </div>

        {/* Participants */}
        <div className="bg-gray-800/40 backdrop-blur-lg rounded-2xl border border-gray-700 p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">👥 Participants ({participants.length})</h2>
          {participants.length > 0 ? (
            <div className="space-y-3">
              {participants.map((p, i) => (
                <div key={i} className="bg-gray-700/30 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{p.username || p.displayName || 'Player'}</p>
                    <p className="text-sm text-gray-400">{p.role === 'host' ? '👑 Host' : '🎮 Player'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Score</p>
                    <p className="font-bold text-green-400">{p.score || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-6xl mb-4">👤</p>
              <p className="text-gray-400 text-lg">Waiting for players to join...</p>
              <p className="text-gray-500 text-sm mt-2">Share room code: <span className="font-bold text-cyan-300">{roomCode}</span></p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-gray-800/40 backdrop-blur-lg rounded-2xl border border-gray-700 p-6">
          <h2 className="text-2xl font-bold mb-4">🎮 Controls</h2>
          <div className="flex gap-4">
            <button
              onClick={() => toast.success('Start quiz functionality coming soon!')}
              className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-xl font-bold text-lg"
            >
              ▶️ Start Quiz
            </button>
            <button
              onClick={() => navigate('/create-quiz')}
              className="px-6 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold"
            >
              🏠 Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;