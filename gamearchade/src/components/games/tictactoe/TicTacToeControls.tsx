// TicTacToeControls component for game control buttons
import React from 'react';
import { TicTacToeControlsProps } from '../../../../src/types/ticTacToe';

export default function TicTacToeControls({ onNewGame, onResetScores }: TicTacToeControlsProps): JSX.Element {
  // Render the control buttons
  return (
    <div className="flex justify-center gap-4 mb-6">
      <button
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
        onClick={onNewGame}
      >
        New Game
      </button>
      <button
        className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
        onClick={onResetScores}
      >
        Reset Scores
      </button>
    </div>
  );
}