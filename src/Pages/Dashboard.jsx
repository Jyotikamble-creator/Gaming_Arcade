import React, { useEffect, useState } from 'react'
import { fetchMyScores, fetchProgress } from '../api/scoreApi'

export default function Dashboard() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  })
  const [progress, setProgress] = useState(null)
  const [myScores, setMyScores] = useState([])

  useEffect(() => {
    async function load() {
      if (!user) return
      try {
        const [prog, scores] = await Promise.all([
          fetchProgress(),
          fetchMyScores()
        ])
        setProgress(prog)
        setMyScores(scores)
      } catch (e) {
        console.error('Failed to load dashboard data', e)
      }
    }
    load()
  }, [user])

  if (!user) return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard</h2>
      <p>Please <a href="/login">login</a> to see your dashboard.</p>
    </div>
  )

  return (
    <div style={{ padding: 20 }}>
      <h2>{user.displayName || user.username}'s Dashboard</h2>
      {progress ? (
        <div>
          <h3>Progress Summary</h3>
          <p>Total Games Played: {progress.totalGames}</p>
          <p>Games Played:</p>
          <ul>
            {Object.entries(progress.gamesPlayed).map(([game, count]) => (
              <li key={game}>{game}: {count} times</li>
            ))}
          </ul>
          <p>Best Scores:</p>
          <ul>
            {Object.entries(progress.bestScores).map(([game, score]) => (
              <li key={game}>{game}: {score}</li>
            ))}
          </ul>
          <h3>Recent Scores</h3>
          <ul>
            {progress.recentScores.map((s, i) => (
              <li key={i}>{s.game}: {s.score} on {new Date(s.createdAt).toLocaleDateString()}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Loading progress...</p>
      )}
      <h3>All My Scores</h3>
      <ul>
        {myScores.map((s, i) => (
          <li key={i}>{s.game}: {s.score} on {new Date(s.createdAt).toLocaleDateString()}</li>
        ))}
      </ul>
    </div>
  )
}
