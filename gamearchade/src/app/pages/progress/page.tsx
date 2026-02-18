"use client"
import React, { useEffect, useState } from 'react'

interface GameProgress {
  game: string;
  bestScore?: number;
  lastPlayed?: string;
  played?: number;
}

export default function ProgressPage() {
  const [progress, setProgress] = useState<{ totalGames: number; gameStats: GameProgress[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const res = await fetch('/api/progress', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data?.error || 'Failed to load progress')
        }
        const json = await res.json()
        setProgress(json.data || null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-light-text">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">My Progress</h1>

        {loading && <div className="text-gray-300">Loading progress...</div>}

        {error && (
          <div className="bg-red-800/30 p-4 rounded mb-4">{error}</div>
        )}

        {!loading && !error && !progress && (
          <div className="bg-white/5 p-6 rounded">Sign in to view your progress.</div>
        )}

        {progress && (
          <div className="bg-white/5 p-6 rounded space-y-4">
            <div className="text-gray-300">Total Games Played: <strong className="text-white">{progress.totalGames}</strong></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {progress.gameStats.map((g, i) => (
                <div key={i} className="p-4 bg-gray-800/50 rounded">
                  <div className="font-semibold text-white">{g.game}</div>
                  <div className="text-gray-400 text-sm">Best Score: {g.bestScore ?? '—'}</div>
                  <div className="text-gray-400 text-sm">Last Played: {g.lastPlayed ? new Date(g.lastPlayed).toLocaleString() : '—'}</div>
                  <div className="text-gray-400 text-sm">Times Played: {g.played ?? 0}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
