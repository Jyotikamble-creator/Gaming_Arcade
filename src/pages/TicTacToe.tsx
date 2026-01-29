// Tic-tac-toe game page component
import React from 'react';
// Hooks
import { useTicTacToe } from '../hooks/useTicTacToe';
// Components
import Instructions from '../components/shared/Instructions';
import Leaderboard from '../components/leaderboard/Leaderboard';
import {
  TicTacToeStats,
  TicTacToeBoard,
  TicTacToeControls,
  TicTacToeGameStatus
} from '../../gamearchade/src/components/tictactoe';
import AnimatedBackground from '../components/AnimatedBackground';

// TicTacToe component
export default function TicTacToe(): JSX.Element {
  const {
    board,
    isXNext,
    winner,
    scores,
    gamesPlayed,
    handleClick,
    resetGame,
    resetScores
  } = useTicTacToe();

  // Render
  return (
    <div className="min-h-screen text-light-text relative overflow-hidden">
      <AnimatedBackground />
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">⭕ Tic Tac Toe</h1>
          <p className="text-subtle-text">Get three in a row to win!</p>
        </div>

        {/* Game Stats */}
        <TicTacToeStats
          isXNext={isXNext}
          scores={scores}
          gamesPlayed={gamesPlayed}
        />

        {/* Game Status */}
        <TicTacToeGameStatus winner={winner} />

        {/* Game Board */}
        <TicTacToeBoard board={board} onClick={handleClick} />

        {/* Controls */}
        <TicTacToeControls onNewGame={resetGame} onResetScores={resetScores} />

        {/* Instructions */}
        <div className="max-w-md mx-auto mb-6">
          <Instructions gameType="tic-tac-toe" />
        </div>

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard game="tic-tac-toe" />
        </div>
      </div>
    </div>
  );
}