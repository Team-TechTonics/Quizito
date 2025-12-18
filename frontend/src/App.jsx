// src/App.jsx
import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { QuizProvider } from './context/QuizContext'

// Layout Components
import Navbar from './components/layout/Navbar'
import Footer from './components/Footer'
import LoadingSpinner from './components/LoadingSpinner'
import ErrorBoundary from './components/common/ErrorBoundary'

// Pages
import Home from './pages/Home'
import Login from './components/auth/Login'
import Register from './components/auth/Register'

// Lazy Load Heavy Components
const Explore = lazy(() => import('./pages/Explore'));
const CreateQuiz = lazy(() => import('./pages/CreateQuiz'));
const HostSession = lazy(() => import('./pages/HostSession'));
const PlayQuiz = lazy(() => import('./pages/PlayQuiz'));
const Results = lazy(() => import('./pages/Results'));
const Profile = lazy(() => import('./pages/Profile'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const JoinQuiz = lazy(() => import('./pages/JoinQuiz'));
const PlayerView = lazy(() => import('./components/PlayerView'));
const JoinSession = lazy(() => import('./components/JoinSession'));
const PerformanceDashboard = lazy(() => import('./pages/PerformanceDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const QuestionBank = lazy(() => import('./pages/QuestionBank'));

// Role-based Dashboards (Lazy)
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const EducatorDashboard = lazy(() => import('./pages/EducatorDashboard'));
const RoleGate = lazy(() => import('./components/RoleGate'));
const StudentProgress = lazy(() => import('./pages/StudentProgress'));
const EducatorAnalytics = lazy(() => import('./pages/EducatorAnalytics'));
const Achievements = lazy(() => import('./pages/Achievements'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const Friends = lazy(() => import('./pages/Friends'));
const Challenges = lazy(() => import('./pages/Challenges'));
const LearningPaths = lazy(() => import('./pages/LearningPaths'));
const PathViewer = lazy(() => import('./pages/PathViewer'));
const CreatePath = lazy(() => import('./pages/CreatePath'));
const AdaptiveQuiz = lazy(() => import('./components/quiz/AdaptiveQuiz'));
const ReviewCenter = lazy(() => import('./pages/ReviewCenter'));
const ClassManagement = lazy(() => import('./pages/ClassManagement'));
const ProtectedRoute = lazy(() => import('./components/auth/ProtectedRoute'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <QuizProvider>
            <div className="min-h-screen flex flex-col bg-gray-100">
              <Navbar />
              <main className="flex-grow">
                <ErrorBoundary>
                  <Suspense fallback={<LoadingSpinner fullScreen={true} text="Loading Quizito..." />}>
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

                      {/* ROLE-BASED DASHBOARDS */}
                      <Route element={<ProtectedRoute />}>
                        <Route path="/student/dashboard" element={
                          <RoleGate allowedRoles={['student']} fallback={
                            <div className="container mx-auto px-4 py-8 text-center text-red-600">
                              <h2 className="text-2xl font-bold">Access Denied</h2>
                              <p>You need Student permissions to view this dashboard.</p>
                            </div>
                          }>
                            <StudentDashboard />
                          </RoleGate>
                        } />
                        <Route path="/educator/dashboard" element={
                          <RoleGate allowedRoles={['teacher', 'admin']} fallback={
                            <div className="container mx-auto px-4 py-8 text-center text-red-600">
                              <h2 className="text-2xl font-bold">Access Denied</h2>
                              <p>You need Educator permissions to view this dashboard.</p>
                            </div>
                          }>
                            <EducatorDashboard />
                          </RoleGate>
                        } />
                      </Route>

                      {/* PROTECTED ROUTES */}
                      <Route element={<ProtectedRoute />}>
                        <Route path="/create-quiz" element={
                          <RoleGate allowedRoles={['teacher', 'admin', 'student']} fallback={
                            <div className="container mx-auto px-4 py-8 text-center">
                              <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
                              <p className="text-gray-600">This feature is only available to educators.</p>
                            </div>
                          }>
                            <CreateQuiz />
                          </RoleGate>
                        } />
                        <Route path="/create-path" element={
                          <RoleGate allowedRoles={['teacher', 'admin']}>
                            <CreatePath />
                          </RoleGate>
                        } />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/JoinQuiz" element={<JoinQuiz />} />
                        <Route path="/performance" element={<PerformanceDashboard />} />
                        <Route path="/student/progress" element={<StudentProgress />} />
                        <Route path="/educator/analytics" element={
                          <RoleGate allowedRoles={['teacher', 'admin']}>
                            <EducatorAnalytics />
                          </RoleGate>
                        } />
                        <Route path="/educator/question-bank" element={
                          <RoleGate allowedRoles={['teacher', 'admin']}>
                            <QuestionBank />
                          </RoleGate>
                        } />
                        <Route path="/achievements" element={<Achievements />} />
                        <Route path="/leaderboard" element={<LeaderboardPage />} />
                        <Route path="/friends" element={<Friends />} />
                        <Route path="/challenges" element={<Challenges />} />
                        <Route path="/learning-paths" element={<LearningPaths />} />
                        <Route path="/learning-paths/:pathId" element={<PathViewer />} />
                        <Route path="/adaptive-quiz/:topicId" element={<AdaptiveQuiz />} />
                        <Route path="/review-center" element={<ReviewCenter />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        {/* New route for ClassManagement, protected by RoleGate */}
                        <Route path="/classes" element={
                          <RoleGate allowedRoles={['teacher', 'admin']}>
                            <ClassManagement />
                          </RoleGate>
                        } />
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
                  </Suspense>
                </ErrorBoundary>
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
    </Router >
  )
}

export default App