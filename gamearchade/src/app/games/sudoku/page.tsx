import { useAuth } from '@/lib/auth/AuthProvider';
import { useRouter } from 'next/navigation';
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SudokuBoard from '@/components/games/sudoku/SudokuBoard';
import SudokuControls from '@/components/games/sudoku/SudokuControls';
import SudokuStats from '@/components/games/sudoku/SudokuStats';
import SudokuCompletedModal from '@/components/games/sudoku/SudokuCompletedModal';
import type { SudokuDifficulty } from '@/types/games/sudoku';

interface GameState {
  board: number[][];
  initialBoard: number[][];
  solution: number[][];
  selectedCell: { row: number; col: number } | null;
  notes: Record<string, number[]>;
  notesMode: boolean;
  difficulty: SudokuDifficulty;
  isPaused: boolean;
  isComplete: boolean;
  time: number;
  mistakes: number;
  hintsUsed: number;
  score: number;
}

const INITIAL_STATE: GameState = {
  board: Array(9).fill(null).map(() => Array(9).fill(0)),
  initialBoard: Array(9).fill(null).map(() => Array(9).fill(0)),
  solution: Array(9).fill(null).map(() => Array(9).fill(0)),
  selectedCell: null,
  notes: {},
  notesMode: false,
  difficulty: 'medium',
  isPaused: false,
  isComplete: false,
  time: 0,
  mistakes: 0,
  hintsUsed: 0,
  score: 0,
};

const MAX_HINTS = 5;
const MAX_MISTAKES = 3;

/**
 * Enhanced Sudoku Game Component with improved features
 * - Multiple difficulty levels (Easy, Medium, Hard, Expert)
 * - Intelligent hint system
 * - Notes/pencil marks mode
 * - Real-time validation
 * - Score tracking
 * - Pause/Resume functionality
 */
export default function SudokuGame() {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    if (loading) {
      return (
        <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      );
    }

    if (!isAuthenticated) {
      router.push('/pages/auth');
      return null;
    }
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string>('');

  // Initialize game
  useEffect(() => {
    const initializeGame = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/games/sudoku/puzzle?difficulty=${gameState.difficulty}`
        );
        const data = await response.json();

        setGameState(prev => ({
          ...prev,
          board: data.puzzle,
          initialBoard: data.puzzle.map((row: number[]) => [...row]),
          solution: data.solution,
        }));
      } catch (error) {
        console.error('Failed to load puzzle:', error);
        setValidationMessage('Failed to load puzzle. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    initializeGame();
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameState.isPaused || gameState.isComplete) return;

    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        time: prev.time + 1,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.isPaused, gameState.isComplete]);

  // Auto-hide validation message
  useEffect(() => {
    if (validationMessage) {
      const timer = setTimeout(() => setValidationMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [validationMessage]);

  // Check if puzzle is complete
  const checkCompletion = useCallback((board: number[][], solution: number[][]) => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] !== solution[i][j]) return false;
      }
    }
    return true;
  }, []);

  // Handle cell click
  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState.isPaused || gameState.isComplete) return;
    if (gameState.initialBoard[row][col] !== 0) return;

    setGameState(prev => ({
      ...prev,
      selectedCell: { row, col },
    }));
  }, [gameState.isPaused, gameState.isComplete, gameState.initialBoard]);

  // Handle number selection
  const handleNumberSelect = useCallback((num: number) => {
    if (!gameState.selectedCell || gameState.isPaused) return;

    const { row, col } = gameState.selectedCell;
    const newBoard = gameState.board.map(r => [...r]);

    if (gameState.notesMode) {
      // Toggle note mode
      const key = `${row}-${col}`;
      const notes = gameState.notes[key] || [];
      const updatedNotes = notes.includes(num)
        ? notes.filter(n => n !== num)
        : [...notes, num].sort((a, b) => a - b);

      const newNotes = { ...gameState.notes };
      if (updatedNotes.length === 0) {
        delete newNotes[key];
      } else {
        newNotes[key] = updatedNotes;
      }

      setGameState(prev => ({
        ...prev,
        notes: newNotes,
      }));

      setValidationMessage('📝 Note added');
    } else {
      // Place number
      newBoard[row][col] = num;
      
      // Check if wrong
      if (num !== gameState.solution[row][col]) {
        setGameState(prev => ({
          ...prev,
          mistakes: prev.mistakes + 1,
        }));
        setValidationMessage(`❌ Wrong! Mistakes: ${gameState.mistakes + 1}/${MAX_MISTAKES}`);

        // Check if game over
        if (gameState.mistakes + 1 >= MAX_MISTAKES) {
          setValidationMessage('💀 Game Over! Too many mistakes.');
          setGameState(prev => ({
            ...prev,
            isPaused: true,
          }));
        }
      } else {
        setValidationMessage('✅ Correct!');
      }

      // Check if complete
      if (checkCompletion(newBoard, gameState.solution)) {
        const finalScore = calculateScore();
        setGameState(prev => ({
          ...prev,
          board: newBoard,
          isComplete: true,
          score: finalScore,
        }));
        setShowCompletedModal(true);
      } else {
        setGameState(prev => ({
          ...prev,
          board: newBoard,
          notes: {}, // Clear notes when placing a number
        }));
      }
    }
  }, [gameState, checkCompletion]);

  // Handle clear cell
  const handleClear = useCallback(() => {
    if (!gameState.selectedCell || gameState.isPaused) return;

    const { row, col } = gameState.selectedCell;
    if (gameState.initialBoard[row][col] !== 0) return;

    const newBoard = gameState.board.map(r => [...r]);
    newBoard[row][col] = 0;

    const key = `${row}-${col}`;
    const newNotes = { ...gameState.notes };
    delete newNotes[key];

    setGameState(prev => ({
      ...prev,
      board: newBoard,
      notes: newNotes,
    }));

    setValidationMessage('🗑️ Cell cleared');
  }, [gameState]);

  // Handle hint
  const handleHint = useCallback(async () => {
    if (gameState.hintsUsed >= MAX_HINTS) {
      setValidationMessage(`💡 No hints left! (${MAX_HINTS}/${MAX_HINTS} used)`);
      return;
    }

    if (!gameState.selectedCell) {
      setValidationMessage('Select a cell first!');
      return;
    }

    try {
      const response = await fetch('/api/games/sudoku/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puzzle: gameState.board,
          initialBoard: gameState.initialBoard,
        }),
      });

      const data = await response.json();
      if (!data.hint) {
        setValidationMessage('No hints available!');
        return;
      }

      const { row, col, value, technique } = data.hint;
      const newBoard = gameState.board.map(r => [...r]);
      newBoard[row][col] = value;

      setValidationMessage(`💡 Hint: ${technique} at (${row + 1}, ${col + 1})`);

      if (checkCompletion(newBoard, gameState.solution)) {
        const finalScore = calculateScore();
        setGameState(prev => ({
          ...prev,
          board: newBoard,
          hintsUsed: prev.hintsUsed + 1,
          isComplete: true,
          score: finalScore,
        }));
        setShowCompletedModal(true);
      } else {
        setGameState(prev => ({
          ...prev,
          board: newBoard,
          hintsUsed: prev.hintsUsed + 1,
          selectedCell: { row, col },
        }));
      }
    } catch (error) {
      console.error('Failed to get hint:', error);
      setValidationMessage('Failed to get hint');
    }
  }, [gameState, checkCompletion]);

  // Handle notes toggle
  const handleNotesToggle = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      notesMode: !prev.notesMode,
    }));
    setValidationMessage(`${!gameState.notesMode ? '✏️' : '✋'} ${!gameState.notesMode ? 'Notes mode' : 'Number mode'}`);
  }, [gameState.notesMode]);

  // Handle difficulty change
  const handleDifficultyChange = useCallback(async (difficulty: SudokuDifficulty) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/games/sudoku/puzzle?difficulty=${difficulty}`
      );
      const data = await response.json();

      setGameState(prev => ({
        ...INITIAL_STATE,
        board: data.puzzle,
        initialBoard: data.puzzle.map((row: number[]) => [...row]),
        solution: data.solution,
        difficulty,
      }));
      setValidationMessage(`🎮 ${difficulty.toUpperCase()} difficulty selected`);
    } catch (error) {
      console.error('Failed to load puzzle:', error);
      setValidationMessage('Failed to load puzzle');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle new game
  const handleNewGame = useCallback(() => {
    handleDifficultyChange(gameState.difficulty);
    setShowCompletedModal(false);
    setValidationMessage('🆕 New game started!');
  }, [gameState.difficulty, handleDifficultyChange]);

  // Handle pause/resume
  const handlePause = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: true }));
    setValidationMessage('⏸️ Game paused');
  }, []);

  const handleResume = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: false }));
    setValidationMessage('▶️ Game resumed');
  }, []);

  // Calculate score with bonus/penalties
  const calculateScore = (): number => {
    const baseScore = 1000;
    const timeBonus = Math.max(0, 500 - gameState.time / 2);
    const mistakePenalty = gameState.mistakes * 50;
    const hintPenalty = gameState.hintsUsed * 100;
    const difficultyBonus = {
      easy: 100,
      medium: 250,
      hard: 500,
      expert: 750,
    }[gameState.difficulty];
    
    return Math.max(0, Math.round(baseScore + timeBonus - mistakePenalty - hintPenalty + difficultyBonus));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Loading Sudoku Puzzle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">🧩 Sudoku Master v2.0</h1>
          <p className="text-purple-200">Enhanced puzzle-solving experience</p>
        </div>

        {/* Validation Message */}
        {validationMessage && (
          <div className="mb-4 p-4 bg-white/20 backdrop-blur-md rounded-lg border border-white/30 text-white text-center animate-pulse">
            {validationMessage}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Board and Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sudoku Board */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <SudokuBoard
                board={gameState.board}
                initialBoard={gameState.initialBoard}
                selectedCell={gameState.selectedCell}
                solution={gameState.solution}
                notes={gameState.notes}
                onCellClick={handleCellClick}
                isPaused={gameState.isPaused}
              />
            </div>

            {/* Stats */}
            <SudokuStats
              difficulty={gameState.difficulty}
              time={gameState.time}
              mistakes={gameState.mistakes}
              hintsUsed={gameState.hintsUsed}
              maxHints={MAX_HINTS}
              maxMistakes={MAX_MISTAKES}
            />
          </div>

          {/* Right Column - Controls */}
          <div className="lg:col-span-1">
            <SudokuControls
              difficulty={gameState.difficulty}
              notesMode={gameState.notesMode}
              isPaused={gameState.isPaused}
              hintsUsed={gameState.hintsUsed}
              maxHints={MAX_HINTS}
              onNumberSelect={handleNumberSelect}
              onClear={handleClear}
              onHint={handleHint}
              onNotesToggle={handleNotesToggle}
              onDifficultyChange={handleDifficultyChange}
              onNewGame={handleNewGame}
              onPause={handlePause}
              onResume={handleResume}
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 text-white text-center">
            <div className="text-sm text-purple-200">Current Score</div>
            <div className="text-3xl font-bold">{calculateScore()}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 text-white text-center">
            <div className="text-sm text-purple-200">Game Status</div>
            <div className="text-xl font-bold">
              {gameState.isComplete ? '✅ SOLVED!' : gameState.isPaused ? '⏸️ PAUSED' : '🎮 PLAYING'}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 text-white text-center">
            <div className="text-sm text-purple-200">Progress</div>
            <div className="text-xl font-bold">
              {gameState.board.flat().filter(x => x !== 0).length}/81 cells
            </div>
          </div>
        </div>
      </div>

      {/* Completed Modal */}
      <SudokuCompletedModal
        isOpen={showCompletedModal}
        score={gameState.score}
        time={gameState.time}
        difficulty={gameState.difficulty}
        mistakes={gameState.mistakes}
        hintsUsed={gameState.hintsUsed}
        onClose={() => setShowCompletedModal(false)}
        onNewGame={handleNewGame}
      />
    </div>
  );
}
