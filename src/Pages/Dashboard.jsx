import React, { useEffect, useState } from 'react'
import { fetchScores } from '../api/scoreApi'

export default function Dashboard() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  })
  const [scores, setScores] = useState({})

  useEffect(() => {
    async function load() {
      if (!user) return
      // fetch top scores per game for display; using existing API which returns top scores for a game
      const games = ['word-guess','memory-card','math-quiz','typing-test','2048']
      const obj = {}
      for (const g of games) {
        try {
          const res = await fetchScores(g, 5)
          obj[g] = res
        } catch (e) {
          obj[g] = []
        }
      }
      setScores(obj)
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
      <p>Recent top scores (global) by game:</p>
      <div>
        {Object.keys(scores).map(g => (
          <div key={g} style={{ marginTop: 12 }}>
            <h4>{g}</h4>
            <ol>
              {(scores[g] || []).map((s, i) => <li key={i}>{s.player} — {s.score}</li>)}
            </ol>
          </div>
        ))}
      </div>
    </div>
  )
}
