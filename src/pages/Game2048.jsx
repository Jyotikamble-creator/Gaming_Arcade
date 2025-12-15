// 2048 Game Page Component
import React, { useState, useEffect, useCallback } from 'react';
// Assuming submitScore is a function to submit the score to the backend.
import { submitScore } from '../api/Api';
// Logger module
import { logger, LogTags } from '../lib/logger';
// Components
import GameBoard from '../components/game2048/GameBoard';
import ScoreDisplay from '../components/game2048/ScoreDisplay';
import GameControls from '../components/game2048/GameControls';
import GameStatus from '../components/game2048/GameStatus';
import Instructions from '../components/shared/Instructions';
import Leaderboard from '../components/leaderboard/Leaderboard';

// Game constants
export default function Game2048() {
  // State variables
  const [board, setBoard] = useState(() => initBoard());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('game2048-best-score');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Game status
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [newTiles, setNewTiles] = useState([]);
  const [mergedTiles, setMergedTiles] = useState([]);

  // Game logic
  function initBoard() {
    const board = Array(4).fill().map(() => Array(4).fill(0));
    addRandomTile(board);
    addRandomTile(board);
    return board;
  }

  // Add a random tile to the board
  function addRandomTile(board) {
    const empty = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) empty.push([i, j]);
      }
    }
    if (empty.length > 0) {
      const [row, col] = empty[Math.floor(Math.random() * empty.length)];
      board[row][col] = Math.random() < 0.9 ? 2 : 4;
      return [row, col];
    }
    return null;
  }

  // Move a tile to the left
  function moveLeft(board) {
    // Check for empty cells
    let moved = false;
    let newScore = 0;
    const merged = [];

    // Process each row
    for (let i = 0; i < 4; i++) {
      const row = board[i].filter(val => val !== 0);
      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          row[j] *= 2;
          newScore += row[j];
          merged.push([i, j]);
          row.splice(j + 1, 1);
        }
      }

      // Fill the rest with zeros
      while (row.length < 4) row.push(0);
      for (let j = 0; j < 4; j++) {
        if (board[i][j] !== row[j]) moved = true;
        board[i][j] = row[j];
      }
    }
    return { moved, score: newScore, merged };
  }

  // Handle user input
  const handleMove = useCallback((direction) => {
    if (gameOver || gameWon) return;

    // Make a copy of the board
    const newBoard = board.map(row => [...row]);
    let result = { moved: false, score: 0, merged: [] };

    // Perform the move
    if (direction === 'left') {
      result = moveLeft(newBoard);
    } else if (direction === 'right') {
      newBoard.forEach(row => row.reverse());
      result = moveLeft(newBoard);
      newBoard.forEach(row => row.reverse());
      result.merged = result.merged.map(([r, c]) => [r, 3 - c]);
    } else if (direction === 'up') {
      const rotated = newBoard[0].map((_, i) => newBoard.map(row => row[i]));
      result = moveLeft(rotated);
      rotated.forEach((row, i) => row.forEach((val, j) => newBoard[j][i] = val));
      result.merged = result.merged.map(([r, c]) => [c, r]);
    } else if (direction === 'down') {
      const rotated = newBoard[0].map((_, i) => newBoard.map(row => row[i]).reverse());
      result = moveLeft(rotated);
      rotated.reverse();
      rotated.forEach((row, i) => row.forEach((val, j) => newBoard[j][i] = val));
      result.merged = result.merged.map(([r, c]) => [3 - c, r]);
    }

    // Update the board
    if (result.moved) {
      const newTilePos = addRandomTile(newBoard);
      setBoard(newBoard);
      setScore(prev => prev + result.score);
      setNewTiles(newTilePos ? [newTilePos] : []);
      setMergedTiles(result.merged);

      // Clear animations after a short delay
      setTimeout(() => {
        setNewTiles([]);
        setMergedTiles([]);
      }, 300);

      // Check for 2048
      if (newBoard.some(row => row.some(cell => cell === 2048))) {
        setGameWon(true);
        logger.info('2048 game won', { score: score + result.score }, LogTags.GAME_2048);
      }

      // Check for game over
      if (!canMove(newBoard)) {
        setGameOver(true);
        logger.info('2048 game over', { score: score + result.score }, LogTags.GAME_2048);
      }
    }
  }, [board, gameOver, gameWon, score]);

  // Check if any moves are possible
  function canMove(board) {
    // Check for empty cells
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) return true;
      }
    }

    // Check for possible merges
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === board[i][j + 1]) return true;
      }
    }
    for (let j = 0; j < 4; j++) {
      for (let i = 0; i < 3; i++) {
        if (board[i][j] === board[i + 1][j]) return true;
      }
    }

    return false;
  }

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        switch (e.key) {
          case 'ArrowLeft': handleMove('left'); break;
          case 'ArrowRight': handleMove('right'); break;
          case 'ArrowUp': handleMove('up'); break;
          case 'ArrowDown': handleMove('down'); break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleMove]);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('game2048-best-score', score.toString());
    }
  }, [score, bestScore]);

  // Restart the game
  function restart() {
    setBoard(initBoard());
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setNewTiles([]);
    setMergedTiles([]);
    logger.info('2048 game restarted', {}, LogTags.GAME_2048);
  }

  function continuePlaying() {
    setGameWon(false);
  }

  // Submit final score
  async function submitFinalScore() {
    try {
      await submitScore({
        game: '2048',
        score: score,
        meta: {
          reached2048: gameWon,
          bestScore: bestScore
        }
      });
      logger.info('2048 score submitted', { score, gameWon }, LogTags.SAVE_SCORE);
    } catch (error) {
      logger.error('Failed to submit 2048 score', error, { score }, LogTags.SAVE_SCORE);
    }
  }

  useEffect(() => {
    if (gameOver || gameWon) {
      submitFinalScore();
    }
  }, [gameOver, gameWon]);

  // Render the component
  return (
    <div className="min-h-screen text-light-text relative">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
            🎮 2048
          </h1>
          <p className="text-subtle-text text-lg">Combine tiles to reach 2048!</p>
        </div>

        {/* Score Display */}
        <ScoreDisplay score={score} bestScore={bestScore} />

        {/* Game Board */}
        <div className="flex justify-center mb-8">
          <GameBoard board={board} newTiles={newTiles} mergedTiles={mergedTiles} />
        </div>

        {/* Game Controls */}
        <div className="flex justify-center mb-8">
          <GameControls onMove={handleMove} onRestart={restart} gameOver={gameOver} />
        </div>

        {/* Instructions */}
        <div className="max-w-md mx-auto mb-8">
          <Instructions gameType="2048" />
        </div>

        {/* Game Status Overlay */}
        <GameStatus
          gameWon={gameWon}
          gameOver={gameOver}
          onContinue={continuePlaying}
        />

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard game="2048" />
        </div>
      </div>
    </div>
  );
}
