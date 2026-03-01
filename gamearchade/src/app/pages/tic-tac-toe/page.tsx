"use client"
import React from 'react'
import { TicTacToeBoard, TicTacToeControls, TicTacToeGameStatus } from '@/components/games/tictactoe'
import { useTicTacToe } from '@/hooks/useTicTacToe'

export default function TicTacToePage() {
  const { board, isXNext, winner, scores, gamesPlayed, handleClick, resetGame, resetScores } = useTicTacToe()

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-light-text">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">Tic Tac Toe</h1>

        <div className="bg-gray-800/60 rounded-lg p-6">
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
        </div>
      </div>
    </div>
  )
}
