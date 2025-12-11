import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import NotificationCenter from '../components/NotificationCenter';
import '../styles/globals.css';

const JoinQuiz = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [username, setUsername] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    if (!user && !localStorage.getItem('token')) {
      // Save the room code and redirect to login
      localStorage.setItem('pendingRoom', roomCode);
      navigate('/login', { state: { from: `/join/${roomCode}` } });
      return;
    }

    // Set username from user or localStorage
    const savedUsername = user?.username || localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
    }

    // Initialize socket
    // Initialize socket
    const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:10000', {
      auth: {
        token: localStorage.getItem('token'),
        userId: user?.id
      }
    });

    setSocket(socketInstance);

    // Check if room exists
    socketInstance.emit('check-room', { roomCode });

    socketInstance.on('room-info', (data) => {
      setRoomInfo(data);
      setLoading(false);
    });

    socketInstance.on('room-not-found', () => {
      setError('Room not found or has expired');
      setLoading(false);
    });

    socketInstance.on('room-full', () => {
      setError('Room is full');
      setLoading(false);
    });

    socketInstance.on('quiz-started', () => {
      NotificationCenter.add({
        type: 'info',
        message: 'Quiz has started! Redirecting...',
        duration: 2000
      });
      setTimeout(() => {
        navigate(`/play/${roomCode}`);
      }, 2000);
    });

    socketInstance.on('joined-room', (data) => {
      setIsJoining(false);
      NotificationCenter.add({
        type: 'success',
        message: `Joined room ${roomCode}`,
        duration: 2000
      });
      navigate(`/play/${roomCode}`);
    });

    socketInstance.on('error', (errorMsg) => {
      setError(errorMsg);
      setIsJoining(false);
    });

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [roomCode, navigate, user]);

  const handleJoin = (e) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!roomCode || roomCode.length !== 4) {
      setError('Invalid room code');
      return;
    }

    setIsJoining(true);
    setError('');

    // Save username
    localStorage.setItem('username', username);

    // Join room
    if (socket) {
      socket.emit('join-room', {
        roomCode,
        username,
        userId: user?.id || `guest_${Date.now()}`
      });
    } else {
      setError('Connection error. Please refresh the page.');
      setIsJoining(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Checking room..." />;
  }

  if (error && !roomInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-red-500/30 border-2 p-8 text-center">
          <div className="text-6xl mb-6">❌</div>
          <h2 className="text-3xl font-bold mb-4">Room Not Found</h2>
          <p className="text-gray-300 mb-2">
            The room code <span className="font-bold text-red-300">{roomCode}</span> doesn't exist or has expired.
          </p>
          <p className="text-gray-400 mb-8">Please check the code and try again.</p>
          <Link
            to="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold hover:scale-105 transition-transform"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-gray-800/30 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl mb-4">
            <div className="text-5xl">🎮</div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Join Quiz Session
          </h1>
          <div className="mt-2 text-gray-400">Enter your details to join the quiz</div>
        </div>

        {/* Room Info Card */}
        {roomInfo && (
          <div className="mb-8 p-6 bg-gray-800/40 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-400">Room Code</div>
                <div className="text-3xl font-bold text-cyan-300 tracking-wider">{roomCode}</div>
              </div>
              <div className="px-4 py-2 bg-green-500/20 text-green-300 rounded-full text-sm font-medium">
                {roomInfo.status === 'waiting' ? 'Waiting' : 'Active'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400">Host</div>
                <div className="font-medium">{roomInfo.hostName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Players</div>
                <div className="font-medium">{roomInfo.playerCount} joined</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Quiz</div>
                <div className="font-medium">{roomInfo.quizTitle || 'Quick Quiz'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Questions</div>
                <div className="font-medium">{roomInfo.questionCount || 10}</div>
              </div>
            </div>
          </div>
        )}

        {/* Join Form */}
        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2 font-medium">Your Display Name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.slice(0, 20))}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
              required
              maxLength={20}
            />
            <div className="mt-1 text-sm text-gray-400">
              This is how other players will see you
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isJoining || !username.trim()}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/20"
          >
            {isJoining ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Joining Room...
              </div>
            ) : (
              '🎮 Join Now'
            )}
          </button>

          <div className="text-center">
            <Link
              to="/"
              className="inline-block text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </form>

        {/* Game Tips */}
        <div className="mt-8 pt-6 border-t border-gray-700/50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span>💡</span> Quick Tips
          </h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Make sure your connection is stable
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Answer quickly for bonus points
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Watch the leaderboard in real-time
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JoinQuiz;
