"use client"
import React, { useState } from 'react'
import { useTypingTest } from '@/hooks/games/useTypingTest'
import DashboardLayout from '@/components/shared/DashboardLayout'
import Instructions from '@/components/shared/Instructions'
import Leaderboard from '@/components/leaderboard/Leaderboard'
import { TypingTestDifficulty, DIFFICULTY_CONFIG } from '@/types/games/typing-test'

export default function TypingTestPage() {
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState<TypingTestDifficulty>('medium')
  const { text, input, isLoading, done, handleInputChange, resetTest, stats, wpm, accuracy } = useTypingTest(selectedDifficulty)

  const handleDifficultySelect = (difficulty: TypingTestDifficulty): void => {
    setSelectedDifficulty(difficulty)
    setGameStarted(true)
  }

  const handleBackToDifficulty = (): void => {
    setGameStarted(false)
  }

  // Difficulty Selection Screen
  if (!gameStarted) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden flex items-center justify-center p-4">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1),transparent_70%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          </div>

          <div className="relative z-10 container mx-auto">
            <div className="max-w-2xl mx-auto">
              {/* Title */}
              <div className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  ⌨️ Typing Test Challenge
                </h1>
                <p className="text-gray-300 text-xl mb-4">
                  Test your typing speed and accuracy!
                </p>
                <p className="text-gray-400 text-lg">
                  Select a difficulty level to begin
                </p>
              </div>

              {/* Difficulty Cards */}
              <div className="grid md:grid-cols-3 gap-6">
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
                      <li>✓ Short passages</li>
                      <li>✓ {DIFFICULTY_CONFIG.easy.basePoints} Base points</li>
                      <li>✓ Good for beginners</li>
                    </ul>
                  </div>
                </button>

                {/* Medium */}
                <button
                  onClick={() => handleDifficultySelect('medium')}
                  className="group relative overflow-hidden rounded-xl bg-linear-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/50 p-8 hover:border-yellow-400 hover:from-yellow-500/30 hover:to-orange-600/30 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4">⚡</div>
                    <h3 className="text-3xl font-bold text-yellow-400 mb-3">Medium</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ Medium passages</li>
                      <li>✓ {DIFFICULTY_CONFIG.medium.basePoints} Base points</li>
                      <li>✓ Balanced challenge</li>
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
                      <li>✓ Long passages</li>
                      <li>✓ {DIFFICULTY_CONFIG.hard.basePoints} Base points</li>
                      <li>✓ For experts</li>
                    </ul>
                  </div>
                </button>
              </div>

              {/* Instructions */}
              <div className="mt-12 bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-white font-semibold mb-4 text-center text-lg">How to Play</h3>
                <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                  <div className="space-y-2">
                    <p>⌨️ Type the passage as accurately as possible</p>
                    <p>✅ Complete the entire passage to finish</p>
                  </div>
                  <div className="space-y-2">
                    <p>📊 Track your WPM and accuracy in real-time</p>
                    <p>🎯 Aim for higher scores on harder difficulties!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Game Screen
  return (
    <DashboardLayout>
      <div className="min-h-screen p-8 bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 text-light-text">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Typing Test</h1>
            <div className="text-lg font-semibold">
              <span className="text-gray-300">Difficulty: </span>
              <span className="text-white capitalize">{selectedDifficulty}</span>
            </div>
          </div>
          <p className="text-gray-300 mb-8">Improve your typing speed and accuracy by typing passages as quickly and accurately as possible.</p>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-300">Loading passage...</div>
            </div>
          ) : (
            <>
              {/* Instructions */}
              <div className="mb-8">
                <Instructions gameType="typing-test" />
              </div>

              {/* Game Area */}
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-gray-400 mb-3">TYPE THIS PASSAGE:</h2>
                  <div className="bg-gray-900/50 rounded-lg p-4 min-h-[100px] text-lg whitespace-pre-wrap text-gray-200 border border-gray-700">
                    {text}
                  </div>
                </div>

                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-gray-400 mb-2">YOUR INPUT:</h2>
                  <textarea
                    className="w-full h-40 p-4 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-blue-400 focus:outline-none resize-none"
                    placeholder="Start typing here..."
                    value={input}
                    onChange={handleInputChange}
                    disabled={done}
                  />
                </div>

                {/* Stats Display */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                    <div className="text-sm font-semibold text-gray-400 mb-1">WORDS PER MINUTE</div>
                    <div className="text-3xl font-bold text-blue-400">{Math.round(wpm)}</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                    <div className="text-sm font-semibold text-gray-400 mb-1">ACCURACY</div>
                    <div className="text-3xl font-bold text-purple-400">{Math.round(accuracy)}%</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => resetTest(selectedDifficulty)}
                    className="flex-1 px-6 py-3 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    🔄 Reset Test
                  </button>
                  {done && (
                    <button
                      onClick={handleBackToDifficulty}
                      className="flex-1 px-6 py-3 bg-linear-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                      📊 Change Difficulty
                    </button>
                  )}
                </div>

                {/* Test Complete Message */}
                {done && (
                  <div className="mt-6 p-5 bg-green-600/20 border border-green-500/50 rounded-lg">
                    <h3 className="text-lg font-bold text-green-400 mb-2">✅ Test Complete!</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm text-green-300">
                      <div>
                        <span className="font-semibold">Final WPM:</span> {Math.round(stats.wpm)}
                      </div>
                      <div>
                        <span className="font-semibold">Final Accuracy:</span> {Math.round(stats.accuracy)}%
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-green-200">Great job! Try another test to improve your typing skills.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Leaderboard */}
          <div className="mt-12">
            <Leaderboard gameType="typing-test" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
