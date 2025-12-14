// Component to display user's progress across games
import React, { useEffect, useState, useMemo } from 'react';
// API function to fetch progress
import { fetchProgress } from '../../api/scoreApi';
// Animated background component
import AnimatedBackground from '../AnimatedBackground';
// Logger module
import { logger, LogTags } from '../../lib/logger';

// MyProgress component
export default function MyProgress() {
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedGame, setSelectedGame] = useState('all')

  // All available games based on the routes
  const games = useMemo(() => [
    { id: 'word-guess', name: 'Word Guess', icon: '🔤', color: 'from-blue-500 to-blue-600' },
    { id: 'memory-card', name: 'Memory Card', icon: '🧠', color: 'from-purple-500 to-purple-600' },
    { id: 'math-quiz', name: 'Math Quiz', icon: '🧮', color: 'from-green-500 to-green-600' },
    { id: 'typing-test', name: 'Typing Test', icon: '⌨️', color: 'from-yellow-500 to-yellow-600' },
    { id: 'emoji-guess', name: 'Emoji Guess', icon: '😀', color: 'from-pink-500 to-pink-600' },
    { id: 'simon-says', name: 'Simon Says', icon: '🎯', color: 'from-red-500 to-red-600' },
    { id: 'whack-mole', name: 'Whack a Mole', icon: '🐭', color: 'from-orange-500 to-orange-600' },
    { id: 'word-scramble', name: 'Word Scramble', icon: '🔀', color: 'from-indigo-500 to-indigo-600' },
    { id: 'quiz', name: 'Quiz', icon: '📝', color: 'from-teal-500 to-teal-600' }
  ], [])

  useEffect(() => {
    async function loadProgress() {
      try {
        setLoading(true)
        logger.debug('Loading user progress', {}, LogTags.FETCH_PROGRESS)
        const data = await fetchProgress()
        setProgress(data)
        logger.info('User progress loaded successfully', { totalGames: data.totalGames }, LogTags.FETCH_PROGRESS)
      } catch (e) {
        logger.error('Failed to load user progress', e, {}, LogTags.FETCH_PROGRESS)
        setError('Failed to load progress. Please try again.')
        console.error('Failed to load progress', e)
      } finally {
        setLoading(false)
      }
    }

    loadProgress()
  }, [])

  // Calculate additional statistics
  const calculateStats = () => {
    if (!progress) return null

    const totalScore = Object.values(progress.bestScores).reduce((sum, score) => sum + score, 0)
    const averageScore = progress.totalGames > 0 ? Math.round(totalScore / Object.keys(progress.bestScores).length) : 0
    const mostPlayedGame = Object.entries(progress.gamesPlayed).reduce((max, [game, count]) =>
      count > (max.count || 0) ? { game, count } : max, { game: '', count: 0 }
    )
    const highestScore = Math.max(...Object.values(progress.bestScores), 0)

    // Calculate progress levels
    const getLevel = (games) => {
      if (games >= 100) return { level: 'Expert', color: 'text-purple-400', progress: 100 }
      if (games >= 50) return { level: 'Advanced', color: 'text-blue-400', progress: 75 }
      if (games >= 25) return { level: 'Intermediate', color: 'text-green-400', progress: 50 }
      if (games >= 10) return { level: 'Beginner', color: 'text-yellow-400', progress: 25 }
      return { level: 'Newbie', color: 'text-gray-400', progress: 10 }
    }

    const level = getLevel(progress.totalGames)

    return {
      totalScore,
      averageScore,
      mostPlayedGame,
      highestScore,
      level
    }
  }

  const stats = calculateStats()

  // Get filtered games based on selection
  const getFilteredGames = () => {
    if (selectedGame === 'all') return games
    return games.filter(game => game.id === selectedGame)
  }

  // Get filtered games
  const filteredGames = getFilteredGames()

  // Render
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <AnimatedBackground />
        <div className="text-center relative z-10">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text text-xl font-semibold">Loading your progress...</p>
        </div>
      </div>
    )
  }

  // Render error
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
          <h2 className="text-2xl font-bold text-light-text mb-2">Failed to Load Progress</h2>
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

  // Render
  return (
    <div className="min-h-screen text-light-text relative overflow-hidden">
      <AnimatedBackground />

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2 animate-pulse">
            📈 My Progress
          </h1>
          <p className="text-subtle-text text-lg">Track your gaming journey and achievements</p>
        </div>

        {/* Overall Stats Cards */}
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
                <p className="text-2xl font-bold text-white">{progress.totalGames}</p>
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
                <p className="text-subtle-text text-sm">Total Best Score</p>
                <p className="text-2xl font-bold text-white">{stats?.totalScore.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-white">{stats?.highestScore.toLocaleString()}</p>
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
                <p className="text-subtle-text text-sm">Player Level</p>
                <p className={`text-2xl font-bold ${stats?.level.color}`}>{stats?.level.level}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="bg-card-bg/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Level Progress</h3>
            <span className={`text-sm font-medium ${stats?.level.color}`}>{stats?.level.level}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${stats?.level.progress}%` }}
            ></div>
          </div>
          <p className="text-subtle-text text-sm">
            {progress.totalGames} games played • {100 - progress.totalGames} more to reach Expert level
          </p>
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

        {/* Game Progress Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {filteredGames.map(game => {
            const gamesPlayed = progress.gamesPlayed[game.id] || 0
            const bestScore = progress.bestScores[game.id] || 0
            const hasPlayed = gamesPlayed > 0

            return (
              <div key={game.id} className="bg-card-bg/90 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl overflow-hidden">
                {/* Game Header */}
                <div className={`px-6 py-4 border-b border-gray-700 bg-gradient-to-r ${game.color}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{game.icon}</span>
                      <div>
                        <h3 className="text-lg font-bold text-white">{game.name}</h3>
                        <p className="text-white/80 text-sm">{gamesPlayed} games played</p>
                      </div>
                    </div>
                    {hasPlayed && (
                      <div className="text-right">
                        <p className="text-xs text-white/80">Best Score</p>
                        <p className="text-lg font-bold text-white">{bestScore.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Content */}
                <div className="p-6">
                  {hasPlayed ? (
                    <div className="space-y-4">
                      {/* Progress Ring */}
                      <div className="flex items-center justify-center">
                        <div className="relative w-20 h-20">
                          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeDasharray="100, 100"
                              className="text-gray-600"
                            />
                            <path
                              d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeDasharray={`${Math.min(gamesPlayed * 10, 100)}, 100`}
                              className="text-blue-500 transition-all duration-500"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">{gamesPlayed}</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-subtle-text text-sm">Games</p>
                          <p className="text-xl font-bold text-white">{gamesPlayed}</p>
                        </div>
                        <div>
                          <p className="text-subtle-text text-sm">Best</p>
                          <p className="text-xl font-bold text-green-400">{bestScore}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <p className="text-subtle-text">Not played yet</p>
                      <p className="text-gray-500 text-sm">Start playing to track progress!</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-card-bg/90 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-xl font-bold text-white">Recent Activity</h3>
          </div>

          <div className="divide-y divide-gray-700">
            {progress.recentScores.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-subtle-text">No recent activity</p>
                <p className="text-gray-500 text-sm">Play some games to see your activity here!</p>
              </div>
            ) : (
              progress.recentScores.map((score, index) => {
                const game = games.find(g => g.id === score.game)
                return (
                  <div key={index} className="px-6 py-4 hover:bg-gray-700/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r ${game?.color || 'from-gray-500 to-gray-600'}`}>
                          <span className="text-white text-lg">{game?.icon || '🎮'}</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white">
                            {game?.name || score.game.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h4>
                          <p className="text-subtle-text text-sm">
                            {new Date(score.createdAt).toLocaleDateString('en-US', {
                              weekday: 'long',
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
                        <div className="text-xs text-subtle-text">points</div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}