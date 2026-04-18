import React, { useState, useEffect, useCallback } from 'react';
import GameBoard from './GameBoard';
import ScoreDisplay from './ScoreDisplay';
import GameControls from './GameControls';
import GameStatus from './GameStatus';
import Instructions from '@/components/shared/Instructions';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Game2048Difficulty, DIFFICULTY_CONFIG } from '@/types/games/game2048';

// TypeScript interfaces
interface User {
  id: string;
  name: string;
  email?: string;
  displayName?: string;
}

interface Game2048PageProps {
  user: User | null;
  className?: string;
  difficulty?: Game2048Difficulty;
}

interface Position {
  row: number;
  col: number;
}

interface MoveResult {
  moved: boolean;
  score: number;
  merged: Position[];
}

type Direction = 'left' | 'right' | 'up' | 'down';
type Board = number[][];

const Game2048Page: React.FC<Game2048PageProps> = ({ 
  user, 
  className,
  difficulty: initialDifficulty = 'medium'
}) => {
  const [difficulty, setDifficulty] = useState<Game2048Difficulty>(initialDifficulty);
  const diffConfig = DIFFICULTY_CONFIG[difficulty];
  
  // State variables
  const [board, setBoard] = useState<Board>(() => initBoard(diffConfig.gridSize));
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`game2048-best-score-${difficulty}`);
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  // Game status state
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [newTiles, setNewTiles] = useState<Position[]>([]);
  const [mergedTiles, setMergedTiles] = useState<Position[]>([]);

  // Initialize empty board with gridSize and add two random tiles
  function initBoard(gridSize: number): Board {
    const board: Board = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    addRandomTile(board);
    addRandomTile(board);
    return board;
  }

  // Add a random tile (2 or 4) to an empty cell
  function addRandomTile(board: Board): Position | null {
    const empty: Position[] = [];
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] === 0) {
          empty.push({ row: i, col: j });
        }
      }
    }
    
    if (empty.length > 0) {
      const randomPos = empty[Math.floor(Math.random() * empty.length)];
      board[randomPos.row][randomPos.col] = Math.random() < 0.9 ? 2 : 4;
      return randomPos;
    }
    return null;
  }

  // Move tiles left and merge adjacent tiles with same value
  function moveLeft(board: Board): MoveResult {
    let moved = false;
    let newScore = 0;
    const merged: Position[] = [];
    const size = board.length;

    for (let i = 0; i < size; i++) {
      const row = board[i].filter(val => val !== 0);
      
      // Merge adjacent tiles
      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          row[j] *= 2;
          newScore += row[j];
          merged.push({ row: i, col: j });
          row.splice(j + 1, 1);
        }
      }

      // Fill remaining cells with zeros
      while (row.length < size) {
        row.push(0);
      }

      // Check if row changed
      for (let j = 0; j < size; j++) {
        if (board[i][j] !== row[j]) {
          moved = true;
        }
        board[i][j] = row[j];
      }
    }

    return { moved, score: newScore, merged };
  }

  // Handle tile movement in specified direction
  const handleMove = useCallback((direction: Direction) => {
    if (gameOver || gameWon) return;

    const newBoard = board.map(row => [...row]);
    let result: MoveResult = { moved: false, score: 0, merged: [] };

    // Apply movement logic based on direction
    if (direction === 'left') {
      result = moveLeft(newBoard);
    } else if (direction === 'right') {
      // Reverse, move left, reverse back
      newBoard.forEach(row => row.reverse());
      result = moveLeft(newBoard);
      newBoard.forEach(row => row.reverse());
      // Adjust merged positions for reversed board
      result.merged = result.merged.map(pos => ({ 
        row: pos.row, 
        col: diffConfig.gridSize - 1 - pos.col 
      }));
    } else if (direction === 'up') {
      // Rotate board 90° clockwise, move left, rotate back
      const rotated = newBoard[0].map((_, i) => newBoard.map(row => row[i]));
      result = moveLeft(rotated);
      rotated.forEach((row, i) => 
        row.forEach((val, j) => newBoard[j][i] = val)
      );
      // Adjust merged positions for rotation
      result.merged = result.merged.map(pos => ({ 
        row: pos.col, 
        col: pos.row 
      }));
    } else if (direction === 'down') {
      // Rotate board 90° counter-clockwise, move left, rotate back
      const rotated = newBoard[0].map((_, i) => 
        newBoard.map(row => row[i]).reverse()
      );
      result = moveLeft(rotated);
      rotated.reverse();
      rotated.forEach((row, i) => 
        row.forEach((val, j) => newBoard[j][i] = val)
      );
      // Adjust merged positions for rotation
      result.merged = result.merged.map(pos => ({ 
        row: diffConfig.gridSize - 1 - pos.col, 
        col: pos.row 
      }));
    }

    // Update game state if move was valid
    if (result.moved) {
      const newTilePos = addRandomTile(newBoard);
      setBoard(newBoard);
      setScore(prev => prev + result.score);
      setNewTiles(newTilePos ? [newTilePos] : []);
      setMergedTiles(result.merged);

      // Clear animation states
      setTimeout(() => {
        setNewTiles([]);
        setMergedTiles([]);
      }, 300);

      // Check win condition (target tile for the difficulty)
      if (newBoard.some(row => row.some(cell => cell === diffConfig.winTarget))) {
        setGameWon(true);
      }

      // Check game over condition
      if (!canMove(newBoard)) {
        setGameOver(true);
      }
    }
  }, [board, gameOver, gameWon]);

  // Check if any moves are possible on the board
  function canMove(board: Board): boolean {
    const size = board.length;
    // Check for empty cells
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (board[i][j] === 0) return true;
      }
    }

    // Check for possible horizontal merges
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size - 1; j++) {
        if (board[i][j] === board[i][j + 1]) return true;
      }
    }

    // Check for possible vertical merges
    for (let j = 0; j < size; j++) {
      for (let i = 0; i < size - 1; i++) {
        if (board[i][j] === board[i + 1][j]) return true;
      }
    }

    return false;
  }

  // Reset game when difficulty changes
  useEffect(() => {
    setBoard(initBoard(diffConfig.gridSize));
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setNewTiles([]);
    setMergedTiles([]);
    // Load best score for the new difficulty
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`game2048-best-score-${difficulty}`);
      setBestScore(saved ? parseInt(saved, 10) : 0);
    }
  }, [difficulty]);

  // Handle keyboard input for game controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        switch (e.key) {
          case 'ArrowLeft': 
            handleMove('left'); 
            break;
          case 'ArrowRight': 
            handleMove('right'); 
            break;
          case 'ArrowUp': 
            handleMove('up'); 
            break;
          case 'ArrowDown': 
            handleMove('down'); 
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleMove]);

  // Update best score when current score increases
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`game2048-best-score-${difficulty}`, score.toString());
      }
    }
  }, [score, bestScore]);

  // Reset game to initial state
  const restart = (): void => {
    setBoard(initBoard(diffConfig.gridSize));
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setNewTiles([]);
    setMergedTiles([]);
  };

  // Continue playing after reaching 2048
  const continuePlaying = (): void => {
    setGameWon(false);
  };

  // Submit score to leaderboard API
  const submitFinalScore = async (): Promise<void> => {
    try {
      const response = await fetch('/api/games/2048/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          game: '2048',
          score: score,
          meta: {
            reached2048: gameWon,
            bestScore: bestScore
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit score');
      }
    } catch (error) {
      console.error('Failed to submit 2048 score:', error);
    }
  };

  // Submit score when game ends
  useEffect(() => {
    if (gameOver || gameWon) {
      submitFinalScore();
    }
  }, [gameOver, gameWon, score, bestScore]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden ${className}`}>
      <AnimatedBackground />

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Game Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
            🎮 2048
          </h1>
          <p className="text-white/70 text-lg">Combine tiles to reach {diffConfig.winTarget}!</p>
        </div>

        {/* Score and Difficulty Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-4">
            {/* Score Display */}
            <ScoreDisplay score={score} bestScore={bestScore} />
            
            {/* Difficulty Selector */}
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
              <label className="block text-white/70 text-sm font-semibold mb-2">Difficulty:</label>
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as const).map(diff => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`flex-1 py-2 px-3 rounded font-semibold transition-all ${
                      difficulty === diff
                        ? 'bg-gradient-to-r from-yellow-400 to-pink-500 text-white shadow-lg'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-8">
          <GameBoard 
            board={board} 
            newTiles={newTiles} 
            mergedTiles={mergedTiles} 
          />
        </div>

        {/* Game Controls */}
        <div className="flex justify-center mb-8">
          <GameControls 
            onMove={handleMove} 
            onRestart={restart} 
            gameOver={gameOver || gameWon} 
          />
        </div>

        {/* Instructions */}
        <div className="max-w-md mx-auto mb-8">
          <Instructions gameType="2048" />
        </div>

        {/* Game Status Overlay */}
        <GameStatus
          gameWon={gameWon}
          gameOver={gameOver}
          score={score}
          onContinue={continuePlaying}
          onRestart={restart}
        />

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard gameType="2048" />
        </div>
      </main>
    </div>
  );
};

export default Game2048Page;