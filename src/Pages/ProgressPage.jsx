import React, { useEffect, useState } from 'react'
import { fetchProgress } from '../api/scoreApi'

export default function ProgressPage() {
  const [progress, setProgress] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchProgress()
        setProgress(data)
      } catch (e) {
        console.error('Failed to load progress', e)
      }
    }
    load()
  }, [])

  if (!progress) return <div style={{ padding: 20 }}>Loading...</div>

  return (
    <div style={{ padding: 20 }}>
      <h2>My Progress</h2>
      <p>Total Games: {progress.totalGames}</p>
      <h3>Games Played:</h3>
      <ul>
        {Object.entries(progress.gamesPlayed).map(([game, count]) => (
          <li key={game}>{game}: {count}</li>
        ))}
      </ul>
      <h3>Best Scores:</h3>
      <ul>
        {Object.entries(progress.bestScores).map(([game, score]) => (
          <li key={game}>{score}</li>
        ))}
      </ul>
      <h3>Recent Scores:</h3>
      <ul>
        {progress.recentScores.map((s, i) => (
          <li key={i}>{s.game}: {s.score}</li>
        ))}
      </ul>
    </div>
  )
}