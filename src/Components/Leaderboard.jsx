import React, { useEffect, useState } from 'react'
import { fetchScores } from '../api/scoreApi'

export default function Leaderboard({ game = 'word-guess' }) {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  if (loading) return <div>Loading leaderboard...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h3>Leaderboard</h3>
      <ol>
        {scores.map((s, idx) => (
          <li key={idx}>{s.playerName || (s.user && (s.user.displayName || s.user.username)) || 'Anonymous'} — {s.score}</li>
        ))}
      </ol>
    </div>
  )
}
