"use client"
import React, { useState } from 'react'
import { TicTacToeBoard, TicTacToeControls, TicTacToeGameStatus } from '@/components/games/tictactoe'
import { useTicTacToe } from '@/hooks/games/useTicTacToe'
import DashboardLayout from '@/components/shared/DashboardLayout'
import Instructions from '@/components/shared/Instructions'
import Leaderboard from '@/components/leaderboard/Leaderboard'
import { TicTacToeGameDifficulty, DIFFICULTY_CONFIG } from '@/types/games/tic-tac-toe'

export default function TicTacToePage() {
  const [gameStarted, setGameStarted] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState<TicTacToeGameDifficulty>('medium')

  const { board, isXNext, winner, scores, gamesPlayed, handleClick, resetGame, resetScores } = useTicTacToe()

  const handleDifficultySelect = (difficulty: TicTacToeGameDifficulty) => {
    setSelectedDifficulty(difficulty)
    setGameStarted(true)
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
                  ⭕ Tic Tac Toe Challenge
                </h1>
                <p className="text-gray-300 text-xl mb-4">
                  Challenge the AI and test your strategy!
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
                      <li>✓ Simple AI moves</li>
                      <li>✓ {DIFFICULTY_CONFIG.easy.maxGames} game (no time limit)</li>
                      <li>✓ {DIFFICULTY_CONFIG.easy.basePoints} Base points</li>
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
                      <li>✓ Smart AI opponent</li>
                      <li>✓ Best of {DIFFICULTY_CONFIG.medium.maxGames} games</li>
                      <li>✓ {DIFFICULTY_CONFIG.medium.timeLimit}s per move</li>
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
                      <li>✓ Unbeatable AI</li>
                      <li>✓ Best of {DIFFICULTY_CONFIG.hard.maxGames} games</li>
                      <li>✓ {DIFFICULTY_CONFIG.hard.timeLimit}s per move</li>
                    </ul>
                  </div>
                </button>
              </div>

              {/* Instructions */}
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-white font-semibold mb-4 text-center text-lg">How to Play</h3>
                <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                  <div className="space-y-2">
                    <p>✖️ Click cells to place your X</p>
                    <p>🎯 Get three in a row to win</p>
                  </div>
                  <div className="space-y-2">
                    <p>🤖 Beat the AI opponent</p>
                    <p>🏆 Rack up wins and climb the leaderboard!</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold mb-6 text-center">Tic Tac Toe</h1>
              <p className="text-center text-gray-300 mb-2">
                Difficulty: <span className="font-bold text-yellow-400 capitalize">{selectedDifficulty}</span>
              </p>
              
              {/* Game Mode Info */}
              <div className="text-center text-gray-300 mb-6">
                {DIFFICULTY_CONFIG[selectedDifficulty].maxGames === 1 ? (
                  <p className="text-sm">Single Game Mode • No Time Limit</p>
                ) : (
                  <p className="text-sm">
                    Best of {DIFFICULTY_CONFIG[selectedDifficulty].maxGames} • 
                    {DIFFICULTY_CONFIG[selectedDifficulty].timeLimit}s per move
                  </p>
                )}
              </div>

              <div className="max-w-3xl mx-auto mt-8">
                <Instructions gameType="tic-tac-toe" />
              </div>
              <div className="bg-transparent rounded-lg p-6 mt-6">
                <TicTacToeGameStatus winner={winner} />

                {/* Current player indicator */}
                {!winner && (
                  <div className="text-center mb-4 text-xl">
                    <span className="text-white">Current Player: </span>
                    <span className={isXNext ? 'text-blue-400' : 'text-red-400'}>
                      {isXNext ? 'X' : 'O'}
                    </span>
                  </div>
                )}

                <TicTacToeBoard board={board} onClick={handleClick} />

                {/* Scores */}
                <div className="flex justify-center gap-8 mt-6 mb-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Player X</div>
                    <div className="text-2xl font-bold text-blue-400">{scores.X}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Draws</div>
                    <div className="text-2xl font-bold text-gray-300">{gamesPlayed - scores.X - scores.O}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Player O</div>
                    <div className="text-2xl font-bold text-red-400">{scores.O}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <TicTacToeControls onNewGame={resetGame} onResetScores={resetScores} />
                </div>

                {/* Leaderboard */}
                <div className="mt-12">
                  <Leaderboard gameType="tic-tac-toe" />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  )
}
