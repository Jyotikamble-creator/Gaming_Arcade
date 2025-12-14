// Component to display the user's scores with stats and filtering options
import React, { useEffect, useState } from 'react';
// API function to fetch user scores
import { fetchMyScores } from '../../api/scoreApi';
// Animated background component
import AnimatedBackground from '../AnimatedBackground';
// Logger module
import { logger, LogTags } from '../../lib/logger';

// Component to display the user's scores with stats and filtering options
export default function MyScores() {
  // State variables
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedGame, setSelectedGame] = useState('all')

  // Fetch user scores
  useEffect(() => {
    async function loadScores() {
      // Set loading state
      try {
        setLoading(true)
        logger.debug('Loading user scores', {}, LogTags.MY_SCORES)
        const data = await fetchMyScores(selectedGame === 'all' ? undefined : selectedGame)
        setScores(data)
        logger.info('User scores loaded successfully', { count: data.length }, LogTags.MY_SCORES)
      } catch (e) {
        logger.error('Failed to load user scores', e, {}, LogTags.MY_SCORES)
        setError('Failed to load scores. Please try again.')
        console.error('Failed to load scores', e)
      } finally {
        setLoading(false)
      }
    }
    loadScores()
  }, [selectedGame])

  // Get unique games from scores
  const games = ['all', ...new Set(scores.map(s => s.game))]

  // Calculate stats
  const totalGames = scores.length
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0)
  const averageScore = totalGames > 0 ? Math.round(totalScore / totalGames) : 0
  const bestScore = scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0

  // Render loading, error, or scores
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <AnimatedBackground />
        <div className="text-center relative z-10">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text text-xl font-semibold">Loading your scores...</p>
        </div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <AnimatedBackground />
        <div className="bg-card-bg/90 backdrop-blur-sm rounded-xl p-8 border border-gray-700 max-w-md w-full text-center relative z-10 shadow-2xl">
          <div className="text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-light-text mb-2">Failed to Load Scores</h2>
          <p className="text-subtle-text mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Render scores
  return (
    <div className="min-h-screen text-light-text relative overflow-hidden">
      <AnimatedBackground />

      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2 animate-pulse">
            🏆 My Scores
          </h1>
          <p className="text-subtle-text text-lg">Track your gaming achievements and progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card-bg/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-subtle-text text-sm">Total Games</p>
                <p className="text-2xl font-bold text-white">{totalGames}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-bg/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-subtle-text text-sm">Total Score</p>
                <p className="text-2xl font-bold text-white">{totalScore.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-bg/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <p className="text-subtle-text text-sm">Average Score</p>
                <p className="text-2xl font-bold text-white">{averageScore}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-bg/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <p className="text-subtle-text text-sm">Best Score</p>
                <p className="text-2xl font-bold text-white">{bestScore}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Game Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-subtle-text mb-2">
            Filter by Game
          </label>
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-light-text focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
          >
            {games.map(game => (
              <option key={game} value={game}>
                {game === 'all' ? 'All Games' : game.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        {/* Scores List */}
        <div className="bg-card-bg/90 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-xl font-bold text-white">
              {selectedGame === 'all' ? 'All Scores' : `${selectedGame.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Scores`}
            </h3>
          </div>

          {scores.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-subtle-text text-lg">No scores found</p>
              <p className="text-gray-500">Play some games to see your scores here!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {scores.map((score, index) => (
                <div key={score._id || index} className="px-6 py-4 hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">
                          {score.game.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h4>
                        <p className="text-subtle-text text-sm">
                          {new Date(score.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">
                        {score.score.toLocaleString()}
                      </div>
                      {score.meta && Object.keys(score.meta).length > 0 && (
                        <div className="text-xs text-subtle-text mt-1">
                          {score.meta.attempts && `Attempts: ${score.meta.attempts}`}
                          {score.meta.hintsUsed && ` • Hints: ${score.meta.hintsUsed}`}
                          {score.meta.streak && ` • Streak: ${score.meta.streak}`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}