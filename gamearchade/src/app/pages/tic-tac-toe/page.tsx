"use client"
import React from 'react'
import { TicTacToeBoard, TicTacToeControls, TicTacToeGameStatus } from '@/components/games/tictactoe'

export default function TicTacToePage() {
  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-light-text">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Tic Tac Toe</h1>

        <div className="bg-gray-800/60 rounded-lg p-6">
          <TicTacToeGameStatus />
          <TicTacToeBoard />
          <div className="mt-4">
            <TicTacToeControls />
          </div>
        </div>
      </div>
    </div>
  )
}
