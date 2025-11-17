import React, { useEffect, useState } from 'react'
import { fetchScores } from '../api/scoreApi'

export default function Leaderboard({ game = 'word-guess' }) {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all-time')

  useEffect(() => {
    let mounted = true
    fetchScores(game, 10)
      .then(data => {
        if (mounted) setScores(data)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
    return () => (mounted = false)
  }, [game])

  if (loading) return <div className="text-center py-4">Loading leaderboard...</div>
  if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 w-full">
      <h3 className="text-xl font-bold text-white mb-4">Leaderboard</h3>
      
      {/* Tabs */}
      <div className="flex mb-4 border-b border-gray-700">
        <button
          className={`pb-2 px-4 text-center font-semibold transition duration-200 ${
            activeTab === 'all-time' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-subtle-text hover:text-white'
          }`}
          onClick={() => setActiveTab('all-time')}
        >
          All-Time
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {scores.slice(0, 5).map((s, idx) => (
          <div key={idx} className="flex items-center p-2 rounded-lg hover:bg-gray-700 transition duration-150">
            <span className="text-lg font-bold w-6">{idx + 1}.</span>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-400 mx-3 flex items-center justify-center text-white text-xs">
              {(s.playerName || (s.user && (s.user.displayName || s.user.username)) || 'A')[0].toUpperCase()}
            </div>
            <div className="flex justify-between items-center flex-grow">
              <span className="font-medium text-light-text">
                {s.playerName || (s.user && (s.user.displayName || s.user.username)) || 'Anonymous'}
              </span>
              <span className="text-sm text-subtle-text">{s.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
