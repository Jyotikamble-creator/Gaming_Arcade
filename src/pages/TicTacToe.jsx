// Tic-tac-toe game page component
import React, { useState } from 'react';
// API functions
import { saveScore } from '../api/scoreApi';
// Logger
import { logger, LogTags } from '../lib/logger';
// Components
import Instructions from '../components/shared/Instructions';
import Leaderboard from '../components/leaderboard/Leaderboard';
import AnimatedBackground from '../components/AnimatedBackground';

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
    <div className="min-h-screen text-light-text relative overflow-hidden">
      <AnimatedBackground />
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Γ¡ò Tic Tac Toe</h1>
          <p className="text-subtle-text">Get three in a row to win!</p>
        </div>

        {/* Game Stats */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-2xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Current Player: <span className={isXNext ? 'text-blue-400' : 'text-red-400'}>{isXNext ? 'X' : 'O'}</span>
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-white text-lg font-semibold">X Wins</p>
                <p className="text-blue-400 text-2xl font-bold">{scores.X}</p>
              </div>
              <div>
                <p className="text-white text-lg font-semibold">Games</p>
                <p className="text-gray-300 text-2xl font-bold">{gamesPlayed}</p>
              </div>
              <div>
                <p className="text-white text-lg font-semibold">O Wins</p>
                <p className="text-red-400 text-2xl font-bold">{scores.O}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Game Status */}
        {winner && (
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">
              {winner === 'Draw' ? "It's a Draw!" : `${winner} Wins!`}
            </h2>
          </div>
        )}

        {/* Game Board */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-6 shadow-2xl">
          <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
            {Array(9).fill(null).map((_, i) => (
              <button
                key={i}
                className={`w-24 h-24 border-2 border-gray-600 text-4xl font-bold flex items-center justify-center transition-all duration-200 transform hover:scale-105 ${
                  board[i] === 'X' ? 'text-blue-400' : 
                  board[i] === 'O' ? 'text-red-400' : 
                  'bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={() => handleClick(i)}
                disabled={!!board[i]}
              >
                {board[i]}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={resetGame}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200"
          >
            New Game
          </button>
          <button
            onClick={resetScores}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors duration-200"
          >
            Reset Scores
          </button>
        </div>

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
