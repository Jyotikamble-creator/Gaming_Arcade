"use client"
import React, { useEffect, useRef, useState } from 'react'
import DashboardLayout from '@/components/shared/DashboardLayout'
import AnimatedBackground from '@/components/AnimatedBackground'
import ReactionDisplay from './ReactionDisplay'
import ReactionStats from './ReactionStats'
import ReactionCompletedModal from './ReactionCompletedModal'

type Status = 'idle' | 'waiting' | 'ready' | 'tooSoon' | 'result' | 'gameComplete'
type Difficulty = 'easy' | 'normal' | 'hard'

const TOTAL_ROUNDS = 5
const DIFFICULTY_SETTINGS = {
  easy: { minDelay: 2000, maxDelay: 4000, label: '🟢 Easy' },
  normal: { minDelay: 1200, maxDelay: 3400, label: '🟡 Normal' },
  hard: { minDelay: 600, maxDelay: 1800, label: '🔴 Hard' }
}

export default function ReactionTime() {
  const [status, setStatus] = useState<Status>('idle')
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [best, setBest] = useState<number | null>(() => {
    try { return Number(localStorage.getItem('reaction-best')) || null } catch { return null }
  })
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
  const [gameStarted, setGameStarted] = useState(false)

  const timerRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current) }, [])

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        handleClick()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [status])

  const playSound = (type: 'ready' | 'too-early' | 'click') => {
    // Using Web Audio API to generate sounds
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    if (type === 'ready') {
      oscillator.frequency.value = 800
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } else if (type === 'too-early') {
      oscillator.frequency.value = 300
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    }
  }

  const getRandomDelay = () => {
    const settings = DIFFICULTY_SETTINGS[difficulty]
    return settings.minDelay + Math.floor(Math.random() * (settings.maxDelay - settings.minDelay))
  }

  const start = () => {
    if (reactionTimes.length >= TOTAL_ROUNDS) {
      setStatus('gameComplete')
      return
    }
    
    setStatus('waiting')
    const delay = getRandomDelay()
    
    timerRef.current = window.setTimeout(() => {
      startRef.current = performance.now()
      setStatus('ready')
      playSound('ready')
    }, delay)
  }

  const handleClick = () => {
    if (status === 'waiting') {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      setStatus('tooSoon')
      playSound('too-early')
      timerRef.current = window.setTimeout(() => {
        if (reactionTimes.length < TOTAL_ROUNDS) {
          setStatus('idle')
        }
      }, 1200)
      return
    }

    if (status === 'ready') {
      const now = performance.now()
      const ms = Math.max(0, Math.round(now - (startRef.current || now)))
      const newTimes = [...reactionTimes, ms]
      setReactionTimes(newTimes)
      playSound('click')
      
      if (best === null || ms < best) {
        setBest(ms)
        try { localStorage.setItem('reaction-best', String(ms)) } catch {}
      }

      if (newTimes.length < TOTAL_ROUNDS) {
        setStatus('result')
        timerRef.current = window.setTimeout(() => {
          setStatus('idle')
        }, 1500)
      } else {
        setStatus('gameComplete')
      }
      return
    }

    // idle/result/tooSoon -> start
    start()
  }

  const startGame = () => {
    setGameStarted(true)
    setReactionTimes([])
    setBest(null)
    setStatus('idle')
    setTimeout(() => handleClick(), 500)
  }

  const handleDifficultySelect = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty)
    startGame()
  }

  const resetBest = () => {
    setBest(null)
    try { localStorage.removeItem('reaction-best') } catch {}
  }

  const resetGame = () => {
    setGameStarted(false)
    setReactionTimes([])
    setStatus('idle')
  }

  const averageTime = reactionTimes.length > 0 ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) : 0

  const getPerformanceRating = (avg: number) => {
    if (avg < 250) return { text: 'Lightning Fast!', color: 'text-yellow-300', emoji: '⚡' }
    if (avg < 300) return { text: 'Excellent!', color: 'text-green-300', emoji: '✨' }
    if (avg < 350) return { text: 'Good!', color: 'text-blue-300', emoji: '👍' }
    if (avg < 400) return { text: 'Average', color: 'text-purple-300', emoji: '👌' }
    return { text: 'Keep Practicing!', color: 'text-orange-300', emoji: '💪' }
  }

  // Difficulty Selection Screen
  if (!gameStarted) {
    return (
      <DashboardLayout showBackButton={true} backLink="/dashboard">
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1),transparent_70%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
              {/* Title */}
              <div className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  ⚡ Reaction Time
                </h1>
                <p className="text-gray-300 text-xl mb-4">
                  Test your reflexes with 5 rounds!
                </p>
                <p className="text-gray-400 text-lg">
                  Select a difficulty level to begin
                </p>
              </div>

              {/* Difficulty Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
              {/* Easy */}
              <button
                onClick={() => handleDifficultySelect('easy')}
                className="group relative overflow-hidden rounded-xl bg-linear-to-br from-green-500/20 to-emerald-600/20 border border-green-500/50 p-8 hover:border-green-400 hover:from-green-500/30 hover:to-emerald-600/30 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-linear-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4">🌱</div>
                  <h3 className="text-3xl font-bold text-green-400 mb-3">Easy</h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>✓ Longer delays</li>
                    <li>✓ Score multiplier: 1x</li>
                    <li>✓ Great for practice</li>
                  </ul>
                </div>
              </button>

              {/* Normal */}
              <button
                onClick={() => handleDifficultySelect('normal')}
                className="group relative overflow-hidden rounded-xl bg-linear-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/50 p-8 hover:border-yellow-400 hover:from-yellow-500/30 hover:to-orange-600/30 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-linear-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4">⚡</div>
                  <h3 className="text-3xl font-bold text-yellow-400 mb-3">Normal</h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>✓ Balanced challenge</li>
                    <li>✓ Score multiplier: 2x</li>
                    <li>✓ Recommended for all</li>
                  </ul>
                </div>
              </button>

              {/* Hard */}
              <button
                onClick={() => handleDifficultySelect('hard')}
                className="group relative overflow-hidden rounded-xl bg-linear-to-br from-red-500/20 to-pink-600/20 border border-red-500/50 p-8 hover:border-red-400 hover:from-red-500/30 hover:to-pink-600/30 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-linear-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4">🔥</div>
                  <h3 className="text-3xl font-bold text-red-400 mb-3">Hard</h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>✓ Quick rounds</li>
                    <li>✓ Score multiplier: 3x</li>
                    <li>✓ Test your true speed</li>
                  </ul>
                </div>
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8">
              <h3 className="text-white font-semibold mb-4 text-center text-lg">How to Play</h3>
              <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                <div className="space-y-2">
                  <p>👁️ Wait for the green box to appear</p>
                  <p>🖱️ Click as fast as you can</p>
                </div>
                <div className="space-y-2">
                  <p>⏱️ Your reaction time is measured</p>
                  <p>🎯 Complete all 5 rounds!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
        </DashboardLayout>
      )
  }

  return (
    <DashboardLayout showBackButton={true} backLink="/dashboard">
      <div className="min-h-screen text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
        <AnimatedBackground />
        
        <div className="max-w-3xl mx-auto px-4 py-8 relative z-10">

      {/* Game Area */}
      {gameStarted && status !== 'gameComplete' && (
        <>
          <ReactionStats
            currentRound={reactionTimes.length}
            totalRounds={TOTAL_ROUNDS}
            reactionTimes={reactionTimes}
            bestTime={best}
            difficulty={difficulty}
          />

          <div className="mb-8">
            <ReactionDisplay
              gameState={status === 'result' ? 'clicked' : (status === 'tooSoon' ? 'idle' : status)}
              tooEarly={status === 'tooSoon'}
              currentRound={reactionTimes.length}
              totalRounds={TOTAL_ROUNDS}
              reactionTimes={reactionTimes}
              onStartRound={() => {}}
              onClick={handleClick}
            />
          </div>

          <div className="flex items-center justify-center gap-4">
            <div className="text-sm">Best: <span className="font-semibold text-green-400">{best ?? '—'}</span>ms</div>
            <button onClick={resetBest} className="text-sm px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition">Reset Best</button>
            <button onClick={resetGame} className="text-sm px-3 py-2 bg-indigo-700 hover:bg-indigo-600 rounded text-white transition">New Game</button>
          </div>

          <div className="mt-6 text-xs text-gray-300 text-center">💡 Press SPACE or ENTER to click | Click when the box turns green</div>
        </>
      )}

      {/* Results Modal */}
      {status === 'gameComplete' && (
        <ReactionCompletedModal
          averageTime={averageTime}
          bestTime={best ?? 0}
          reactionTimes={reactionTimes}
          performanceRating={getPerformanceRating(averageTime)}
          difficulty={difficulty}
          onPlayAgain={() => { setGameStarted(true); setReactionTimes([]); setStatus('idle'); setTimeout(() => handleClick(), 500) }}
          onChangeSettings={() => resetGame()}
          onBackToMenu={() => { window.location.href = '/dashboard' }}
        />
      )}
        </div>
      </div>
    </DashboardLayout>
  )
}
