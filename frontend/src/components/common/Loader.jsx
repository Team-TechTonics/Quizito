// src/components/common/Loader.jsx
import React from 'react'

const Loader = ({ size = 'medium', color = 'primary', message = '' }) => {
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-10 h-10 border-3',
    large: 'w-16 h-16 border-4'
  }

  const colorClasses = {
    primary: 'border-primary-200 border-t-primary-600',
    white: 'border-white/20 border-t-white',
    gray: 'border-gray-200 border-t-gray-600',
    green: 'border-green-200 border-t-green-600',
    blue: 'border-blue-200 border-t-blue-600',
    red: 'border-red-200 border-t-red-600'
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}
      />
      {message && (
        <p className="mt-4 text-gray-600 text-center">{message}</p>
      )}
    </div>
  )
}

// Full page loader
export const FullPageLoader = () => (
  <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
)

// Inline loader
export const InlineLoader = ({ size = 'small', color = 'primary' }) => (
  <div className="inline-flex items-center justify-center">
    <Loader size={size} color={color} />
  </div>
)

// Skeleton loader for content
export const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-gray-200 rounded"></div>
              <div className="h-6 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        )
      
      case 'list':
        return (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        )
      
      case 'table':
        return (
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        )
      
      default:
        return (
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        )
    }
  }

  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  )
}

export default Loader