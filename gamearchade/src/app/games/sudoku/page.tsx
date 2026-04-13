// Main page component for the Sudoku game
"use client";

import React, { useState, useEffect } from 'react';
// API and logging imports
import { submitScore } from '@/lib/api/client';
// Logger
import { logger } from '@/lib/logger';
// Component imports
import Instructions from '@/components/shared/Instructions';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import SudokuBoard from '@/components/games/sudoku/SudokuBoard';
import SudokuControls from '@/components/games/sudoku/SudokuControls';
import SudokuStats from '@/components/games/sudoku/SudokuStats';
import SudokuCompletedModal from '@/components/games/sudoku/SudokuCompletedModal';
import AnimatedBackground from '@/components/AnimatedBackground';
import DashboardLayout from '@/components/shared/DashboardLayout';
// Types
import type {
  SudokuDifficulty,
  SudokuBoard as BoardGrid,
  ISudokuCell,
  ISudokuSession
} from '@/types/games/sudoku';

// Local type definitions
type SudokuCellPosition = { row: number; col: number };
type SudokuNotes = Record<string, number[]>; // "row,col" -> array of numbers

// Generate a complete valid Sudoku board
function generateCompleteBoard(): BoardGrid {
  const board: BoardGrid = Array(9).fill(null).map(() => Array(9).fill(0));

  function isValid(board: BoardGrid, row: number, col: number, num: number): boolean {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (board[row][x] === num) return false;
    }

    // Check column
    for (let x = 0; x < 9; x++) {
      if (board[x][col] === num) return false;
    }

    // Check 3x3 box
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i + startRow][j + startCol] === num) return false;
      }
    }

    return true;
  }

  // Backtracking function to fill the board
  function fillBoard(board: BoardGrid): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
          for (let num of numbers) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              if (fillBoard(board)) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  fillBoard(board);
  return board;
}

// Create a puzzle by removing numbers from a complete board
function createPuzzle(difficulty: SudokuDifficulty = 'medium'): { puzzle: BoardGrid, solution: BoardGrid } {
  const completeBoard = generateCompleteBoard();
  const puzzle: BoardGrid = completeBoard.map(row => [...row]);

  // Difficulty settings: number of cells to remove
  const cellsToRemove: Record<SudokuDifficulty, number> = {
    easy: 30,
    medium: 45,
    hard: 55,
    expert: 65
  };

  const toRemove = cellsToRemove[difficulty] || 45;
  let removed = 0;

  while (removed < toRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);

    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      removed++;
    }
  }

  return { puzzle, solution: completeBoard };
}

// Main component
export default function Sudoku() {
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>('medium');
  const [puzzle, setPuzzle] = useState<BoardGrid | null>(null);
  const [solution, setSolution] = useState<BoardGrid | null>(null);
  const [board, setBoard] = useState<BoardGrid | null>(null);
  const [initialBoard, setInitialBoard] = useState<BoardGrid | null>(null);
  const [selectedCell, setSelectedCell] = useState<SudokuCellPosition | null>(null);
  const [mistakes, setMistakes] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [notes, setNotes] = useState<SudokuNotes>({});
  const [notesMode, setNotesMode] = useState<boolean>(false);

  useEffect(() => {
    startNewGame(difficulty);
  }, []);

  // Timer effect
  useEffect(() => {
    if (startTime && !isCompleted && !isPaused) {
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, isCompleted, isPaused]);

  // Start a new game
  function startNewGame(diff: SudokuDifficulty): void {
    logger.info('Starting new Sudoku game', { difficulty: diff });
    const { puzzle: newPuzzle, solution: newSolution } = createPuzzle(diff);
    setPuzzle(newPuzzle);
    setSolution(newSolution);
    setBoard(newPuzzle.map(row => [...row]));
    setInitialBoard(newPuzzle.map(row => [...row]));
    setSelectedCell(null);
    setMistakes(0);
    setStartTime(Date.now());
    setElapsedTime(0);
    setIsCompleted(false);
    setIsPaused(false);
    setHintsUsed(0);
    setNotes({});
    setNotesMode(false);
    setDifficulty(diff);
  }

  // Handle cell click
  function handleCellClick(row: number, col: number): void {
    if (isCompleted || isPaused) return;
    if (initialBoard && initialBoard[row][col] !== 0) return; // Can't select initial cells

    setSelectedCell({ row, col });
  }

  // Handle number input
  function handleNumberInput(num: number): void {
    if (!selectedCell || isCompleted || isPaused) return;

    const { row, col } = selectedCell;
    if (initialBoard && initialBoard[row][col] !== 0) return; // Can't modify initial cells

    const newBoard = board ? board.map(r => [...r]) : [];

    if (notesMode) {
      // Toggle note
      const key = `${row}-${col}`;
      const currentNotes = notes[key] || [];
      const newNotes: SudokuNotes = { ...notes };

      if (currentNotes.includes(num)) {
        newNotes[key] = currentNotes.filter(n => n !== num);
      } else {
        newNotes[key] = [...currentNotes, num].sort();
      }

      setNotes(newNotes);
    } else {
      // Set number
      if (newBoard[row]) {
        newBoard[row][col] = num;
      }

      // Clear notes for this cell
      const key = `${row}-${col}`;
      if (notes[key]) {
        const newNotes = { ...notes };
        delete newNotes[key];
        setNotes(newNotes);
      }

      // Check if correct
      if (solution && solution[row][col] !== num) {
        setMistakes(prev => prev + 1);
        logger.debug('Incorrect number placed', { row, col, num, correct: solution[row][col] });
      }

      setBoard(newBoard);

      // Check if puzzle is completed
      checkCompletion(newBoard);
    }
  }

  function handleClearCell(): void {
    if (!selectedCell || isCompleted || isPaused) return;

    const { row, col } = selectedCell;
    if (initialBoard && initialBoard[row][col] !== 0) return;

    const newBoard = board ? board.map(r => [...r]) : [];
    if (newBoard[row]) {
      newBoard[row][col] = 0;
    }
    setBoard(newBoard);

    // Clear notes for this cell
    const key = `${row}-${col}`;
    if (notes[key]) {
      const newNotes = { ...notes };
      delete newNotes[key];
      setNotes(newNotes);
    }
  }

  // Handle hint
  function handleHint(): void {
    if (!selectedCell || isCompleted || isPaused) return;

    const { row, col } = selectedCell;
    if (initialBoard && initialBoard[row][col] !== 0) return;

    const newBoard = board ? board.map(r => [...r]) : [];
    if (solution && newBoard[row]) {
      newBoard[row][col] = solution[row][col];
    }
    setBoard(newBoard);
    setHintsUsed(prev => prev + 1);

    // Clear notes for this cell
    const key = `${row}-${col}`;
    if (notes[key]) {
      const newNotes = { ...notes };
      delete newNotes[key];
      setNotes(newNotes);
    }

    logger.info('Hint used', { row, col, hintsUsed: hintsUsed + 1 });

    checkCompletion(newBoard);
  }

  // Check if puzzle is completed
  function checkCompletion(currentBoard: BoardGrid): void {
    // Check if all cells are filled
    const isFilled = currentBoard.every(row => row.every(cell => cell !== 0));

    if (isFilled) {
      // Check if solution is correct
      const isCorrect = solution ? currentBoard.every((row, i) =>
        row.every((cell, j) => cell === solution[i][j])
      ) : false;

      if (isCorrect) {
        setIsCompleted(true);
        const finalTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

        // Calculate score based on time, mistakes, hints, and difficulty
        const difficultyMultiplier: Record<SudokuDifficulty, number> = { easy: 1, medium: 1.5, hard: 2, expert: 2.5 };
        const baseScore = 1000 * difficultyMultiplier[difficulty];
        const timePenalty = Math.min(finalTime, 600); // Max 600 seconds penalty
        const mistakesPenalty = mistakes * 50;
        const hintsPenalty = hintsUsed * 100;
        const finalScore = Math.max(Math.round(baseScore - timePenalty - mistakesPenalty - hintsPenalty), 100);

        submitScore({
          game: 'sudoku',
          score: finalScore,
          meta: {
            difficulty,
            time: finalTime,
            mistakes,
            hintsUsed
          }
        });

        logger.info('Sudoku completed', { score: finalScore, time: finalTime, mistakes, hintsUsed, difficulty });
      }
    }
  }

  // Helper function to format time in mm:ss
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function togglePause(): void {
    if (isCompleted) return;

    if (isPaused) {
      // Resume: adjust start time to account for pause duration
      if (startTime) {
        const pauseDuration = Math.floor((Date.now() - startTime) / 1000) - elapsedTime;
        setStartTime(Date.now() - (elapsedTime * 1000));
      }
    }

    setIsPaused(!isPaused);
  }

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text">Generating Sudoku puzzle...</p>
        </div>
      </div>
    );
  }

  // Render the Sudoku game
  return (
    <DashboardLayout>
      <div className="min-h-screen p-8 bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 text-light-text relative overflow-hidden">
        <AnimatedBackground />
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold bg-linear-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent mb-3">
              🧩 Sudoku Master
            </h1>
            <p className="text-xl text-gray-200 mb-2">Master the classic number puzzle game</p>
            <p className="text-gray-400">Fill the 9×9 grid with numbers 1-9, where each row, column, and 3×3 box contains all digits</p>
          </div>

          {/* Instructions Card */}
          <div className="mb-8 max-w-3xl mx-auto">
            <Instructions gameType="sudoku" />
          </div>

          {/* Game Stats Card */}
          <div className="mb-8">
            <div className="bg-linear-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-600/50 shadow-2xl">
              <div className="mb-2">
                <h2 className="text-lg font-semibold text-gray-300 uppercase tracking-wide">Game Progress</h2>
              </div>
              <SudokuStats
                difficulty={difficulty}
                time={elapsedTime}
                mistakes={mistakes}
                hintsUsed={hintsUsed}
                maxHints={3}
              />
            </div>
          </div>

          {/* Main Game Container */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-8">
            {/* Game Board Card - Takes 2 columns on desktop */}
            <div className="lg:col-span-2">
              <div className="bg-linear-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-600/50 shadow-2xl">
                <h2 className="text-lg font-semibold text-gray-300 uppercase tracking-wide mb-6">Game Board</h2>
                <div className="flex justify-center">
                  <SudokuBoard
                    board={board}
                    initialBoard={initialBoard}
                    selectedCell={selectedCell}
                    solution={solution}
                    notes={notes}
                    onCellClick={handleCellClick}
                    isPaused={isPaused}
                  />
                </div>
              </div>
            </div>

            {/* Controls Card - Takes 1 column on desktop */}
            <div>
              <div className="bg-linear-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-600/50 shadow-2xl sticky top-8">
                <h2 className="text-lg font-semibold text-gray-300 uppercase tracking-wide mb-6">Controls</h2>
                <SudokuControls
                  onNumberSelect={handleNumberInput}
                  onClear={handleClearCell}
                  onHint={handleHint}
                  onNewGame={() => startNewGame(difficulty)}
                  onDifficultyChange={(diff: SudokuDifficulty) => {
                    if (window.confirm('Start a new game with different difficulty?')) {
                      startNewGame(diff);
                    }
                  }}
                  onPause={togglePause}
                  onResume={togglePause}
                  difficulty={difficulty}
                  isPaused={isPaused}
                  notesMode={notesMode}
                  onNotesToggle={() => setNotesMode(!notesMode)}
                  hintsUsed={hintsUsed}
                  maxHints={3}
                />
              </div>
            </div>
          </div>

          {/* Completion Modal */}
          {isCompleted && (
            <SudokuCompletedModal
              isOpen={isCompleted}
              score={Math.max(Math.round((1000 * ({ easy: 1, medium: 1.5, hard: 2, expert: 2.5 }[difficulty])) - Math.min(elapsedTime, 600) - (mistakes * 50) - (hintsUsed * 100)), 100)}
              time={elapsedTime}
              mistakes={mistakes}
              hintsUsed={hintsUsed}
              difficulty={difficulty}
              onClose={() => setIsCompleted(false)}
              onNewGame={() => startNewGame(difficulty)}
            />
          )}

          {/* Leaderboard Section */}
          <div className="mt-16">
            <div className="bg-linear-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-600/50 shadow-2xl">
              <h2 className="text-lg font-semibold text-gray-300 uppercase tracking-wide mb-6">Leaderboard</h2>
              <Leaderboard gameType="sudoku" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
