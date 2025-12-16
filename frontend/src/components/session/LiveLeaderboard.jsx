// src/components/session/LiveLeaderboard.jsx
import React from 'react'
import { Trophy, Crown, TrendingUp, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const LiveLeaderboard = ({ leaderboard, currentUser, session }) => {
  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'from-yellow-500 to-yellow-600'
      case 2: return 'from-gray-400 to-gray-500'
      case 3: return 'from-orange-700 to-orange-800'
      default: return 'from-gray-700 to-gray-800'
    }
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="text-yellow-400" size={20} />
      case 2: return <Star className="text-gray-300" size={20} />
      case 3: return <Star className="text-orange-300" size={20} />
      default: return <div className="w-5 h-5 rounded-full bg-gray-600" />
    }
  }

  return (
    <div className="bg-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Trophy className="text-yellow-500" size={24} />
          <h3 className="text-xl font-bold">Live Leaderboard</h3>
        </div>
        {session?.status === 'in-progress' && (
          <div className="flex items-center space-x-2 text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">LIVE</span>
          </div>
        )}
      </div>

      <AnimatePresence>
        <div className="space-y-3">
          {leaderboard.slice(0, 10).map((participant, index) => (
            <motion.div
              key={participant.userId || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`p-4 rounded-xl transition-all duration-300 ${
                participant.userId === currentUser?._id
                  ? 'bg-gradient-to-r from-primary-900/50 to-accent-900/50 border-2 border-primary-500'
                  : 'bg-gray-700/50 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getRankColor(index + 1)} flex items-center justify-center font-bold relative`}>
                    {getRankIcon(index + 1)}
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">{participant.username}</span>
                      {participant.userId === currentUser?._id && (
                        <span className="text-xs bg-primary-500 px-2 py-0.5 rounded-full">You</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <TrendingUp size={12} />
                      <span>{participant.correctAnswers || 0} correct</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">
                    {participant.score || 0}
                  </div>
                  <div className="text-xs text-gray-400">points</div>
                </div>
              </div>
              
              {/* Progress bar for relative score */}
              {leaderboard.length > 0 && (
                <div className="mt-3">
                  <div className="h-1 bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                      style={{
                        width: `${(participant.score / (leaderboard[0]?.score || 1)) * 100}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {leaderboard.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
            <Trophy className="text-gray-400" size={32} />
          </div>
          <p className="text-gray-400">Waiting for players to join...</p>
        </div>
      )}
    </div>
  )
}

export default LiveLeaderboard