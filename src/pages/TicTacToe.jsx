// Tic-tac-toe game page component
import React, { useState } from 'react';
// API functions
import { saveScore } from '../api/scoreApi';
// Logger
import { logger, LogTags } from '../lib/logger';
// Components
import Instructions from '../components/shared/Instructions';
import Leaderboard from '../components/leaderboard/Leaderboard';
import TicTacToeStats from '../components/tictactoe/TicTacToeStats';
import TicTacToeBoard from '../components/tictactoe/TicTacToeBoard';
import TicTacToeControls from '../components/tictactoe/TicTacToeControls';
import TicTacToeGameStatus from '../components/tictactoe/TicTacToeGameStatus';

// TicTacToe component
export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [gamesPlayed, setGamesPlayed] = useState(0);

  // Function to calculate the winner
  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  // Function to handle a click
  const handleClick = (i) => {
    if (board[i] || winner) return;

    const newBoard = board.slice();
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const win = calculateWinner(newBoard);
    if (win) {
      setWinner(win);
      setScores(prev => ({ ...prev, [win]: prev[win] + 1 }));
      setGamesPlayed(prev => prev + 1);
      saveScore({ game: 'tic-tac-toe', playerName: 'guest', score: 10 }).catch(() => { });
      logger.info('Tic-tac-toe game won', { winner: win, gamesPlayed: gamesPlayed + 1 }, LogTags.SAVE_SCORE);
    } else if (newBoard.every(cell => cell)) {
      setWinner('Draw');
      setGamesPlayed(prev => prev + 1);
      logger.info('Tic-tac-toe game draw', { gamesPlayed: gamesPlayed + 1 }, LogTags.TIC_TAC_TOE);
    }
  };

  // Function to reset the game
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    logger.debug('Tic-tac-toe game reset', {}, LogTags.TIC_TAC_TOE);
  };

  // Function to reset scores
  const resetScores = () => {
    setScores({ X: 0, O: 0 });
    setGamesPlayed(0);
    resetGame();
    logger.info('Tic-tac-toe scores reset', {}, LogTags.TIC_TAC_TOE);
  };

  // Render
  return (
    <div className="min-h-screen text-light-text">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
