// Displays the leaderboards for all games
import React, { useEffect, useState, useMemo } from 'react';
// API function to fetch scores
import { fetchScores } from '../../api/scoreApi';
// Animated background component
import AnimatedBackground from '../AnimatedBackground';
// Logger module
import { logger, LogTags } from '../../lib/logger';

// Leaderboard component
export default function MyLeaderboard() {
  // State
  const [leaderboards, setLeaderboards] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedGame, setSelectedGame] = useState('all')

  // All available games based on the routes
  const games = useMemo(() => [
    { id: 'word-guess', name: 'Word Guess', icon: '🔤' },
    { id: 'memory-card', name: 'Memory Card', icon: '🧠' },
    { id: 'math-quiz', name: 'Math Quiz', icon: '🧮' },
    { id: 'typing-test', name: 'Typing Test', icon: '⌨️' },
    { id: 'emoji-guess', name: 'Emoji Guess', icon: '😀' },
    { id: 'simon-says', name: 'Simon Says', icon: '🎯' },
    { id: 'whack-mole', name: 'Whack a Mole', icon: '🐭' },
    { id: 'word-scramble', name: 'Word Scramble', icon: '🔀' },
    { id: 'quiz', name: 'Quiz', icon: '📝' }
  ], [])

  // Fetch scores for all games
  useEffect(() => {
    // Function to load leaderboards
    async function loadLeaderboards() {
      // Reset state
      try {
        setLoading(true)
        logger.debug('Loading leaderboards for all games', {}, LogTags.LEADERBOARD)
        // Get more scores for better stats
        const promises = games.map(async (game) => {
          try {
            const data = await fetchScores(game.id, 50) // Get more scores for better stats
            return { game: game.id, data }
          } catch (e) {
            logger.warn(`Failed to load leaderboard for ${game.id}`, e, {}, LogTags.LEADERBOARD)
            return { game: game.id, data: [] }
          }
        })
        // Get all scores
        const results = await Promise.all(promises)
        const leaderboardsObj = {}
        results.forEach(({ game, data }) => {
          leaderboardsObj[game] = data
        })

        // Set leaderboards
        setLeaderboards(leaderboardsObj)
        logger.info('Leaderboards loaded successfully', { gamesCount: Object.keys(leaderboardsObj).length }, LogTags.LEADERBOARD)
      } catch (e) {
        logger.error('Failed to load leaderboards', e, {}, LogTags.LEADERBOARD)
        setError('Failed to load leaderboards. Please try again.')
        console.error('Failed to load leaderboards', e)
      } finally {
        setLoading(false)
      }
    }

    loadLeaderboards()
  }, [games])

  // Calculate global statistics
  const calculateGlobalStats = () => {
    const allScores = Object.values(leaderboards).flat()
    const totalPlayers = new Set(allScores.map(s => s.user?._id || s.playerName)).size
    const totalScores = allScores.length
    const highestScore = allScores.length > 0 ? Math.max(...allScores.map(s => s.score)) : 0
    const averageScore = totalScores > 0 ? Math.round(allScores.reduce((sum, s) => sum + s.score, 0) / totalScores) : 0

    return { totalPlayers, totalScores, highestScore, averageScore }
  }

  const globalStats = calculateGlobalStats()

  // Get filtered games based on selection
  const getFilteredGames = () => {
    if (selectedGame === 'all') return games
    return games.filter(game => game.id === selectedGame)
  }

  const filteredGames = getFilteredGames()

  // Render
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <AnimatedBackground />
        <div className="text-center relative z-10">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text text-xl font-semibold">Loading leaderboards...</p>
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
          <h2 className="text-2xl font-bold text-light-text mb-2">Failed to Load Leaderboards</h2>
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

  // Render leaderboards
  return (
    <div className="min-h-screen text-light-text relative overflow-hidden">
      <AnimatedBackground />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2 animate-pulse">
            🏆 Leaderboards
          </h1>
          <p className="text-subtle-text text-lg">Compete with players worldwide and climb the ranks</p>
        </div>

        {/* Global Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card-bg/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-subtle-text text-sm">Total Players</p>
                <p className="text-2xl font-bold text-white">{globalStats.totalPlayers.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-bg/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-subtle-text text-sm">Total Scores</p>
                <p className="text-2xl font-bold text-white">{globalStats.totalScores.toLocaleString()}</p>
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
                <p className="text-subtle-text text-sm">Highest Score</p>
                <p className="text-2xl font-bold text-white">{globalStats.highestScore.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-bg/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <div>
                <p className="text-subtle-text text-sm">Average Score</p>
                <p className="text-2xl font-bold text-white">{globalStats.averageScore.toLocaleString()}</p>
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
            <option value="all">All Games</option>
            {games.map(game => (
              <option key={game.id} value={game.id}>
                {game.icon} {game.name}
              </option>
            ))}
          </select>
        </div>

        {/* Leaderboards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredGames.map(game => {
            const scores = leaderboards[game.id] || []
            const topScore = scores.length > 0 ? scores[0].score : 0
            const totalPlayers = scores.length

            return (
              <div key={game.id} className="bg-card-bg/90 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl overflow-hidden">
                {/* Game Header */}
                <div className="px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{game.icon}</span>
                      <div>
                        <h3 className="text-lg font-bold text-white">{game.name}</h3>
                        <p className="text-subtle-text text-sm">{totalPlayers} players</p>
                      </div>
                    </div>
                    {topScore > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-subtle-text">Top Score</p>
                        <p className="text-lg font-bold text-green-400">{topScore.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scores List */}
                <div className="max-h-80 overflow-y-auto">
                  {scores.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <p className="text-subtle-text">No scores yet</p>
                      <p className="text-gray-500 text-sm">Be the first to play!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-700">
                      {scores.slice(0, 10).map((score, index) => {
                        const isTopThree = index < 3
                        const rankColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600']
                        const rankIcons = ['🥇', '🥈', '🥉']

                        return (
                          <div key={score._id || index} className="px-6 py-3 hover:bg-gray-700/30 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center">
                                  {isTopThree ? (
                                    <span className="text-lg mr-2">{rankIcons[index]}</span>
                                  ) : (
                                    <span className={`text-lg font-bold w-6 text-center ${rankColors[2] || 'text-subtle-text'}`}>
                                      {index + 1}
                                    </span>
                                  )}
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${isTopThree ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-blue-500'
                                    }`}>
                                    {(score.playerName || (score.user && (score.user.displayName || score.user.username)) || 'A')[0].toUpperCase()}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium truncate ${isTopThree ? 'text-white' : 'text-light-text'}`}>
                                    {score.playerName || (score.user && (score.user.displayName || score.user.username)) || 'Anonymous'}
                                  </p>
                                  <p className="text-xs text-subtle-text">
                                    {new Date(score.createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-lg font-bold ${isTopThree ? 'text-green-400' : 'text-green-500'}`}>
                                  {score.score.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}