// src/components/auth/ProtectedRoute.jsx
import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Loader from '../common/Loader'
import {
  Shield,
  AlertCircle,
  Lock
} from 'lucide-react'

// Enhanced ProtectedRoute with role-based access control
const ProtectedRoute = ({
  roles = [], // Array of allowed roles (e.g., ['admin', 'educator'])
  redirectTo = '/login',
  showUnauthorized = true
}) => {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{
          from: location,
          message: 'Please log in to access this page'
        }}
        replace
      />
    )
  }

  // Check role-based access if roles are specified
  if (roles.length > 0 && user && !roles.includes(user.role)) {
    if (showUnauthorized) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                <Lock className="text-red-600" size={36} />
              </div>
              <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
              <p className="text-gray-600 mb-6">
                You don't have permission to access this page.
                This area requires {roles.join(' or ')} privileges.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => window.history.back()}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Go Back
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }
    return <Navigate to="/" replace />
  }

  // Everything is good - render the child routes
  return <Outlet />
}

// Route-specific protected components
export const AdminRoute = () => (
  <ProtectedRoute
    roles={['admin']}
    showUnauthorized={true}
  />
)

export const EducatorRoute = () => (
  <ProtectedRoute
    roles={['educator', 'admin']}
    showUnauthorized={true}
  />
)

export const VerifiedUserRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check for email verification (you would implement this based on your auth system)
  if (user && !user.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center">
              <AlertCircle className="text-yellow-600" size={36} />
            </div>
            <h2 className="text-2xl font-bold mb-4">Email Verification Required</h2>
            <p className="text-gray-600 mb-6">
              Please verify your email address to access this feature.
              Check your inbox for the verification link.
            </p>
            <button
              onClick={() => {/* Resend verification email */ }}
              className="btn-primary"
            >
              Resend Verification Email
            </button>
          </div>
        </div>
      </div>
    )
  }

  return children || <Outlet />
}

// Auth Check Component (for conditional rendering within pages)
export const AuthCheck = ({ children, fallback = null, roles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated || (roles.length > 0 && user && !roles.includes(user.role))) {
    return fallback
  }

  return children
}

export default ProtectedRoute;
