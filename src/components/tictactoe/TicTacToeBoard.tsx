// TicTacToeBoard component to render the Tic Tac Toe game board
import React from 'react';
import { TicTacToeBoardProps } from '../../types/ticTacToe';

export default function TicTacToeBoard({ board, onClick }: TicTacToeBoardProps): JSX.Element {
  // Helper function to render each square
  const renderSquare = (i: number): JSX.Element => (
    <button
      key={i}
      className={`w-24 h-24 border-2 border-gray-600 text-4xl font-bold flex items-center justify-center transition-all duration-200 transform hover:scale-105 ${board[i] === 'X' ? 'text-blue-400' : board[i] === 'O' ? 'text-red-400' : 'bg-gray-700 hover:bg-gray-600'
        }`}
      onClick={() => onClick(i)}
      disabled={!!board[i]}
    >
      {board[i]}
    </button>
  );

  // Render the board
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-6 shadow-2xl">
      <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
        {Array(9).fill(null).map((_, i) => renderSquare(i))}
      </div>
    </div>
  );
}