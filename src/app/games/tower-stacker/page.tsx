"use client"
import React, { useState } from 'react'
import TowerDisplay from '@/components/games/towerstacker/TowerDisplay'
import TowerStats from '@/components/games/towerstacker/TowerStats'
import { useTowerStacker } from '@/hooks/games/useTowerStacker'
import DashboardLayout from '@/components/shared/DashboardLayout'
import Instructions from '@/components/shared/Instructions'
import Leaderboard from '@/components/leaderboard/Leaderboard'
import { TowerStackerGameDifficulty, DIFFICULTY_CONFIG } from '@/types/games/tower-stacker'

export default function TowerStackerPage() {
  const [gameStarted, setGameStarted] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState<TowerStackerGameDifficulty>('medium')

  const {
    gameState,
    tower,
    currentBlock,
    score,
    level,
    perfectDrops,
    highestLevel,
    startGame,
    dropBlock
  } = useTowerStacker()

  const handleDifficultySelect = (difficulty: TowerStackerGameDifficulty) => {
    setSelectedDifficulty(difficulty)
    setGameStarted(true)
    startGame()
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden flex items-center justify-center p-4">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1),transparent_70%)]"></div>
        </div>

        <div className="relative z-10 container mx-auto">
          {!gameStarted ? (
            <div className="max-w-2xl mx-auto">
              {/* Title */}
              <div className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  🏗️ Tower Stacker Challenge
                </h1>
                <p className="text-gray-300 text-xl mb-4">
                  Stack blocks perfectly to build the tallest tower!
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
                      <li>✓ Wide blocks</li>
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
                      <li>✓ Normal blocks</li>
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
                      <li>✓ Narrow blocks</li>
                      <li>✓ {DIFFICULTY_CONFIG.hard.basePoints} Base points</li>
                      <li>✓ For experts</li>
                    </ul>
                  </div>
                </button>
              </div>

              {/* Instructions */}
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-white font-semibold mb-4 text-center text-lg">How to Play</h3>
                <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                  <div className="space-y-2">
                    <p>⏹️ Click STOP to place blocks precisely</p>
                    <p>📍 Stack blocks perfectly to advance levels</p>
                  </div>
                  <div className="space-y-2">
                    <p>⭐ Aim for perfect placement</p>
                    <p>🏆 Build the tallest tower possible!</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold mb-6 text-center">Tower Stacker</h1>
              <p className="text-center text-gray-300 mb-8">
                Difficulty: <span className="font-bold text-yellow-400 capitalize">{selectedDifficulty}</span>
              </p>

              {/* Instructions Card - Below Stats */}
              <div className="mb-2">
                <Instructions gameType="tower-stacker" />
              </div>
              {/* Game Container */}
              <div className="mb-6">
                <TowerDisplay
                  tower={tower}
                  currentBlock={currentBlock}
                  containerWidth={400}
                  blockHeight={30}
                  gameState={gameState}
                  onStart={startGame}
                  onDrop={dropBlock}
                />
              </div>

              {/* Stats Card - Below Game */}
              <div className="mb-2">
                <TowerStats score={score} level={level} perfectDrops={perfectDrops} highestLevel={highestLevel} />
              </div>

              {/* Leaderboard */}
              <div className="mt-12">
                <Leaderboard gameType="tower-stacker" />
              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  )
}
