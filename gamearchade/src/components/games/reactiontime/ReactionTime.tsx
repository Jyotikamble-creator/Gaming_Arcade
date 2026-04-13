"use client"
import React, { useEffect, useRef, useState } from 'react'
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
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [countdownEnabled, setCountdownEnabled] = useState(true)
  const [showSettings, setShowSettings] = useState(true)
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
    if (!soundEnabled) return
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
    
    if (countdownEnabled && delay > 3000) {
      // Show countdown for longer delays
    }
    
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
    if (!gameStarted) {
      setGameStarted(true)
      setShowSettings(false)
    }
    start()
  }

  const startGame = () => {
    setGameStarted(true)
    setShowSettings(false)
    setReactionTimes([])
    setBest(null)
    setStatus('idle')
    setTimeout(() => handleClick(), 500)
  }

  const resetBest = () => {
    setBest(null)
    try { localStorage.removeItem('reaction-best') } catch {}
  }

  const resetGame = () => {
    setGameStarted(false)
    setShowSettings(true)
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

  return (
    <div className="max-w-3xl mx-auto">
      {/* Settings Panel */}
      {showSettings && !gameStarted && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
          <h3 className="text-2xl font-bold mb-6">Game Settings</h3>
          
          {/* Difficulty Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold mb-4">Difficulty Level</label>
            <div className="grid grid-cols-3 gap-3">
              {(['easy', 'normal', 'hard'] as Difficulty[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    difficulty === d
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {DIFFICULTY_SETTINGS[d].label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {difficulty === 'easy' && 'Longer delays between rounds - great for practice'}
              {difficulty === 'normal' && 'Balanced challenge - recommended for all'}
              {difficulty === 'hard' && 'Quick rounds - test your true speed!'}
            </p>
          </div>

          {/* Assists */}
          <div className="mb-8">
            <label className="block text-sm font-semibold mb-4">Game Assists</label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-3 rounded-lg transition">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <span className="text-sm">🔊 Sound Feedback</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-3 rounded-lg transition">
                <input
                  type="checkbox"
                  checked={countdownEnabled}
                  onChange={(e) => setCountdownEnabled(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <span className="text-sm">⏱️ Countdown Timer</span>
              </label>
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:scale-105 text-lg"
          >
            Start Game - {TOTAL_ROUNDS} Rounds
          </button>
        </div>
      )}

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
  )
}
