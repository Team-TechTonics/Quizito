// src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { QuizProvider } from './context/QuizContext'

// Layout Components
import Navbar from './components/layout/Navbar'
import Footer from './components/Footer'

// Pages
import Home from './pages/Home'
import Explore from './pages/Explore'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import CreateQuiz from './pages/CreateQuiz'
import HostSession from './pages/HostSession'
import PlayQuiz from './pages/PlayQuiz'
import Results from './pages/Results'
import Profile from './pages/Profile'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Leaderboard from './pages/Leaderboard'
import JoinQuiz from './pages/JoinQuiz'
import HostDashboard from './components/HostDashboard';
import PlayerView from './components/PlayerView';
import JoinSession from './components/JoinSession';
import PerformanceDashboard from './pages/PerformanceDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <QuizProvider>
            <div className="min-h-screen flex flex-col bg-gray-100">
              <Navbar />
              <main className="flex-grow">
                <Routes>

                  {/* PUBLIC ROUTES */}
                  <Route path="/" element={<Home />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  {/* <Route path="/host-session" element={<HostSession />} /> */}
                  <Route path="/join-quiz" element={<JoinQuiz />} />

                  {/* Play Quiz - Allow guest access */}
                  <Route path="/play/:roomCode" element={<PlayQuiz />} />

                  {/* Results - Allow guest access */}
                  <Route path="/results/:sessionId" element={<Results />} />

                  {/* PROTECTED ROUTES */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/create-quiz" element={<CreateQuiz />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/JoinQuiz" element={<JoinQuiz />} />
                    <Route path="/performance" element={<PerformanceDashboard />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                  </Route>

                  {/* Host Dashboard */}
                  {/* HOST SESSION */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/host/:roomCode" element={<HostSession />} />
                  </Route>


                  {/* Quick Join */}
                  <Route path="/join/:roomCode" element={<JoinSession />} />

                  {/* Embed View */}
                  <Route path="/embed/:roomCode" element={<PlayerView embedMode={true} />} />
                </Routes>
              </main>
              <Footer />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
          </QuizProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  )
}

export default App