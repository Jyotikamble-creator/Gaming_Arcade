import React, { useState } from 'react'
import { saveScore } from '../api/scoreApi'

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [winner, setWinner] = useState(null)
  const [scores, setScores] = useState({ X: 0, O: 0 })

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ]
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i]
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }
    return null
  }

  const handleClick = (i) => {
    if (board[i] || winner) return
    const newBoard = board.slice()
    newBoard[i] = isXNext ? 'X' : 'O'
    setBoard(newBoard)
    setIsXNext(!isXNext)
    const win = calculateWinner(newBoard)
    if (win) {
      setWinner(win)
      setScores(prev => ({ ...prev, [win]: prev[win] + 1 }))
      saveScore({ game: 'tic-tac-toe', playerName: 'guest', score: 10 }).catch(() => {})
    } else if (newBoard.every(cell => cell)) {
      setWinner('Draw')
    }
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setIsXNext(true)
    setWinner(null)
  }

  const renderSquare = (i) => (
    <button
      className="w-20 h-20 border border-gray-400 text-2xl font-bold flex items-center justify-center bg-gray-100 hover:bg-gray-200"
      onClick={() => handleClick(i)}
    >
      {board[i]}
    </button>
  )

  return (
    <div className="flex flex-col items-center p-8">
      <h2 className="text-3xl font-bold mb-4">Tic Tac Toe</h2>
      <div className="mb-4">
        <div className="text-lg">Next player: {isXNext ? 'X' : 'O'}</div>
        <div className="text-lg">Scores - X: {scores.X} | O: {scores.O}</div>
      </div>
      {winner && (
        <div className="mb-4 text-xl font-semibold">
          {winner === 'Draw' ? 'It\'s a draw!' : `Winner: ${winner}`}
        </div>
      )}
      <div className="grid grid-cols-3 gap-1 mb-4">
        {Array(9).fill(null).map((_, i) => renderSquare(i))}
      </div>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={resetGame}
      >
        New Game
      </button>
    </div>
  )
}
