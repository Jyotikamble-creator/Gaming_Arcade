import React, { useEffect, useState } from 'react'
import { fetchMyScores } from '../api/scoreApi'

export default function ScoresPage() {
  const [scores, setScores] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchMyScores()
        setScores(data)
      } catch (e) {
        console.error('Failed to load scores', e)
      }
    }
    load()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h2>My Scores</h2>
      <ul>
        {scores.map((s, i) => (
          <li key={i}>{s.game}: {s.score} on {new Date(s.createdAt).toLocaleDateString()}</li>
        ))}
      </ul>
    </div>
  )
}