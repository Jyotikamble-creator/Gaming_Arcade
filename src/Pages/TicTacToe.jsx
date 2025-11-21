import React, { useState } from 'react';
import { saveScore } from '../api/scoreApi';
import { logger, LogTags } from '../lib/logger';
import Instructions from '../components/shared/Instructions';
import Leaderboard from '../components/Leaderboard';

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [gamesPlayed, setGamesPlayed] = useState(0);

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
      saveScore({ game: 'tic-tac-toe', playerName: 'guest', score: 10 }).catch(() => {});
      logger.info('Tic-tac-toe game won', { winner: win, gamesPlayed: gamesPlayed + 1 }, LogTags.SAVE_SCORE);
    } else if (newBoard.every(cell => cell)) {
      setWinner('Draw');
      setGamesPlayed(prev => prev + 1);
      logger.info('Tic-tac-toe game draw', { gamesPlayed: gamesPlayed + 1 }, LogTags.TIC_TAC_TOE);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    logger.debug('Tic-tac-toe game reset', {}, LogTags.TIC_TAC_TOE);
  };

  const resetScores = () => {
    setScores({ X: 0, O: 0 });
    setGamesPlayed(0);
    resetGame();
    logger.info('Tic-tac-toe scores reset', {}, LogTags.TIC_TAC_TOE);
  };

  const renderSquare = (i) => (
    <button
      className={`w-24 h-24 border-2 border-gray-600 text-4xl font-bold flex items-center justify-center transition-all duration-200 transform hover:scale-105 ${
        board[i] === 'X' ? 'text-blue-400' : board[i] === 'O' ? 'text-red-400' : 'bg-gray-700 hover:bg-gray-600'
      }`}
      onClick={() => handleClick(i)}
      disabled={!!board[i] || !!winner}
    >
      {board[i]}
    </button>
  );

  return (
    <div className="min-h-screen text-light-text">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">⭕ Tic Tac Toe</h1>
          <p className="text-subtle-text">Get three in a row to win!</p>
        </div>

        {/* Game Stats */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <span className="text-sm font-medium text-gray-300">NEXT PLAYER</span>
            <div className={`text-2xl font-bold ${isXNext ? 'text-blue-400' : 'text-red-400'}`}>
              {isXNext ? 'X' : 'O'}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <span className="text-sm font-medium text-gray-300">SCORE X</span>
            <div className="text-2xl font-bold text-blue-400">{scores.X}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <span className="text-sm font-medium text-gray-300">SCORE O</span>
            <div className="text-2xl font-bold text-red-400">{scores.O}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <span className="text-sm font-medium text-gray-300">GAMES</span>
            <div className="text-2xl font-bold text-white">{gamesPlayed}</div>
          </div>
        </div>

        {/* Game Status */}
        {winner && (
          <div className="text-center mb-6">
            <div className={`text-2xl font-bold ${winner === 'Draw' ? 'text-yellow-400' : winner === 'X' ? 'text-blue-400' : 'text-red-400'}`}>
              {winner === 'Draw' ? "It's a Draw!" : `${winner} Wins!`}
            </div>
          </div>
        )}

        {/* Game Board */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-6 shadow-2xl">
          <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
            {Array(9).fill(null).map((_, i) => renderSquare(i))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            onClick={resetGame}
          >
            New Game
          </button>
          <button
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            onClick={resetScores}
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
