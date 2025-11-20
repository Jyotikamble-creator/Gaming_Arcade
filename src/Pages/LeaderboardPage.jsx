import React, { useEffect, useState } from 'react'
import { fetchScores } from '../api/scoreApi'

export default function LeaderboardPage() {
  const [leaderboards, setLeaderboards] = useState({})

  useEffect(() => {
    async function load() {
      const games = ['word-guess', 'memory-card', 'math-quiz', 'typing-test']
      const obj = {}
      for (const g of games) {
        try {
          const data = await fetchScores(g, 10)
          obj[g] = data
        } catch (e) {
          obj[g] = []
        }
      }
      setLeaderboards(obj)
    }
    load()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h2>Leaderboards</h2>
      {Object.keys(leaderboards).map(g => (
        <div key={g} style={{ marginTop: 20 }}>
          <h3>{g}</h3>
          <ol>
            {(leaderboards[g] || []).map((s, i) => (
              <li key={i}>{s.playerName || 'Anonymous'}: {s.score}</li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  )
}