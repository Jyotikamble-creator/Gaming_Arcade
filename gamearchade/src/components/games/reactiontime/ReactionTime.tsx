"use client"
import React, { useEffect, useRef, useState } from 'react'
import ReactionDisplay from './ReactionDisplay'
import ReactionStats from './ReactionStats'
import ReactionCompletedModal from './ReactionCompletedModal'

type Status = 'idle' | 'waiting' | 'ready' | 'tooSoon' | 'result'

const TOTAL_ROUNDS = 1

export default function ReactionTime() {
  const [status, setStatus] = useState<Status>('idle')
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [best, setBest] = useState<number | null>(() => {
    try { return Number(localStorage.getItem('reaction-best')) || null } catch { return null }
  })

  const timerRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current) }, [])

  const start = () => {
    setStatus('waiting')
    const delay = 1200 + Math.floor(Math.random() * 2200)
    timerRef.current = window.setTimeout(() => {
      startRef.current = performance.now()
      setStatus('ready')
    }, delay)
  }

  const onStartRound = () => start()

  const handleClick = () => {
    if (status === 'waiting') {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      setStatus('tooSoon')
      timerRef.current = window.setTimeout(() => setStatus('idle'), 1200)
      return
    }

    if (status === 'ready') {
      const now = performance.now()
      const ms = Math.max(0, Math.round(now - (startRef.current || now)))
      const newTimes = [...reactionTimes, ms]
      setReactionTimes(newTimes)
      setStatus('result')
      if (best === null || ms < best) {
        setBest(ms)
        try { localStorage.setItem('reaction-best', String(ms)) } catch {}
      }
      return
    }

    // idle/result/tooSoon -> start
    start()
  }

  const resetBest = () => {
    setBest(null)
    try { localStorage.removeItem('reaction-best') } catch {}
  }

  const averageTime = reactionTimes.length > 0 ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) : 0

  const getPerformanceRating = (avg: number) => {
    if (avg < 250) return { text: 'Lightning Fast!', color: 'text-yellow-300' }
    if (avg < 300) return { text: 'Excellent!', color: 'text-green-300' }
    if (avg < 350) return { text: 'Good!', color: 'text-blue-300' }
    if (avg < 400) return { text: 'Average', color: 'text-purple-300' }
    return { text: 'Keep Practicing!', color: 'text-orange-300' }
  }

  return (
    <div className="max-w-xl mx-auto text-center">
      <h2 className="text-2xl font-semibold mb-4">Reaction Time</h2>

      {status !== 'idle' && (
        <ReactionStats
          currentRound={0}
          totalRounds={TOTAL_ROUNDS}
          reactionTimes={reactionTimes}
          bestTime={best}
        />
      )}

      <div className="mb-4">
        <ReactionDisplay
          gameState={status === 'result' ? 'clicked' : (status === 'tooSoon' ? 'idle' : status)}
          tooEarly={status === 'tooSoon'}
          currentRound={0}
          totalRounds={TOTAL_ROUNDS}
          reactionTimes={reactionTimes}
          onStartRound={onStartRound}
          onClick={handleClick}
        />
      </div>

      <div className="flex items-center justify-center gap-4">
        <div className="text-sm">Best: <span className="font-medium">{best ?? '—'}</span></div>
        <button onClick={resetBest} className="text-sm px-3 py-1 bg-gray-700 rounded text-white">Reset Best</button>
      </div>

      {status === 'result' && (
        <ReactionCompletedModal
          averageTime={averageTime}
          bestTime={best ?? 0}
          reactionTimes={reactionTimes}
          performanceRating={getPerformanceRating(averageTime)}
          onPlayAgain={() => { setReactionTimes([]); setStatus('idle') }}
          onBackToMenu={() => { window.location.href = '/' }}
        />
      )}

      <div className="mt-6 text-xs text-gray-300">Tip: Click or press Enter when the box turns green.</div>
    </div>
  )
}
