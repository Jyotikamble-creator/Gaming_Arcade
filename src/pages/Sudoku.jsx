// Main page component for the Sudoku game
import React, { useState, useEffect } from 'react';
// API and logging imports
import { submitScore } from '../api/Api';
// Logger
import { logger, LogTags } from '../lib/logger';
// Component imports
import Instructions from '../components/shared/Instructions';
import Leaderboard from '../components/leaderboard/Leaderboard';
import SudokuBoard from '../components/sudoku/SudokuBoard';
import SudokuControls from '../components/sudoku/SudokuControls';
import SudokuStats from '../components/sudoku/SudokuStats';
import SudokuCompletedModal from '../components/sudoku/SudokuCompletedModal';
import AnimatedBackground from '../components/AnimatedBackground';

// Generate a complete valid Sudoku board
function generateCompleteBoard() {
  const board = Array(9).fill(null).map(() => Array(9).fill(0));

  function isValid(board, row, col, num) {
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
  function fillBoard(board) {
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
function createPuzzle(difficulty = 'medium') {
  const completeBoard = generateCompleteBoard();
  const puzzle = completeBoard.map(row => [...row]);

  // Difficulty settings: number of cells to remove
  const cellsToRemove = {
    easy: 30,
    medium: 45,
    hard: 55
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
  const [difficulty, setDifficulty] = useState('medium');
  const [puzzle, setPuzzle] = useState(null);
  const [solution, setSolution] = useState(null);
  const [board, setBoard] = useState(null);
  const [initialBoard, setInitialBoard] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [notes, setNotes] = useState({});
  const [notesMode, setNotesMode] = useState(false);

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
  function startNewGame(diff) {
    logger.info('Starting new Sudoku game', { difficulty: diff }, LogTags.GAME_LOAD);
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
  function handleCellClick(row, col) {
    if (isCompleted || isPaused) return;
    if (initialBoard[row][col] !== 0) return; // Can't select initial cells

    setSelectedCell({ row, col });
  }

  // Handle number input
  function handleNumberInput(num) {
    if (!selectedCell || isCompleted || isPaused) return;

    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== 0) return; // Can't modify initial cells

    const newBoard = board.map(r => [...r]);

    if (notesMode) {
      // Toggle note
      const key = `${row}-${col}`;
      const currentNotes = notes[key] || [];
      const newNotes = { ...notes };

      if (currentNotes.includes(num)) {
        newNotes[key] = currentNotes.filter(n => n !== num);
      } else {
        newNotes[key] = [...currentNotes, num].sort();
      }

      setNotes(newNotes);
    } else {
      // Set number
      newBoard[row][col] = num;

      // Clear notes for this cell
      const key = `${row}-${col}`;
      if (notes[key]) {
        const newNotes = { ...notes };
        delete newNotes[key];
        setNotes(newNotes);
      }

      // Check if correct
      if (solution[row][col] !== num) {
        setMistakes(prev => prev + 1);
        logger.debug('Incorrect number placed', { row, col, num, correct: solution[row][col] }, LogTags.GAME_COMPLETE);
      }

      setBoard(newBoard);

      // Check if puzzle is completed
      checkCompletion(newBoard);
    }
  }

  function handleClearCell() {
    if (!selectedCell || isCompleted || isPaused) return;

    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== 0) return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = 0;
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
  function handleHint() {
    if (!selectedCell || isCompleted || isPaused) return;

    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== 0) return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = solution[row][col];
    setBoard(newBoard);
    setHintsUsed(prev => prev + 1);

    // Clear notes for this cell
    const key = `${row}-${col}`;
    if (notes[key]) {
      const newNotes = { ...notes };
      delete newNotes[key];
      setNotes(newNotes);
    }

    logger.info('Hint used', { row, col, hintsUsed: hintsUsed + 1 }, LogTags.GAME_COMPLETE);

    checkCompletion(newBoard);
  }

  // Check if puzzle is completed
  function checkCompletion(currentBoard) {
    // Check if all cells are filled
    const isFilled = currentBoard.every(row => row.every(cell => cell !== 0));

    if (isFilled) {
      // Check if solution is correct
      const isCorrect = currentBoard.every((row, i) =>
        row.every((cell, j) => cell === solution[i][j])
      );

      if (isCorrect) {
        setIsCompleted(true);
        const finalTime = Math.floor((Date.now() - startTime) / 1000);

        // Calculate score based on time, mistakes, hints, and difficulty
        const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2 }[difficulty];
        const baseScore = 1000 * difficultyMultiplier;
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

        logger.info('Sudoku completed', { score: finalScore, time: finalTime, mistakes, hintsUsed, difficulty }, LogTags.SAVE_SCORE);
      }
    }
  }

  // Helper function to format time in mm:ss
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function togglePause() {
    if (isCompleted) return;

    if (isPaused) {
      // Resume: adjust start time to account for pause duration
      const pauseDuration = Math.floor((Date.now() - startTime) / 1000) - elapsedTime;
      setStartTime(Date.now() - (elapsedTime * 1000));
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
    <div className="min-h-screen text-light-text relative overflow-hidden">
      <AnimatedBackground />
      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-2">
            ≡ƒº⌐ Sudoku
          </h1>
          <p className="text-subtle-text text-lg">Fill the 9├ù9 grid with numbers 1-9</p>
        </div>

        {/* Game Stats */}
        <div className="mb-8">
          <SudokuStats
            difficulty={difficulty}
            time={elapsedTime}
            mistakes={mistakes}
            hintsUsed={hintsUsed}
            maxHints={3}
          />
        </div>

        {/* Game Area - Board and Controls Side by Side */}
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center mb-8">
          {/* Game Board */}
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

          {/* Controls */}
          <div className="flex justify-center lg:justify-start">
            <SudokuControls
              onNumberSelect={handleNumberInput}
              onClear={handleClearCell}
              onHint={handleHint}
              onNewGame={() => startNewGame(difficulty)}
              onDifficultyChange={(diff) => {
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

        {/* Instructions */}
        <div className="max-w-2xl mx-auto mb-8">
          <Instructions gameType="sudoku" />
        </div>

        {/* Completion Modal */}
        {isCompleted && (
          <SudokuCompletedModal
            isOpen={isCompleted}
            score={Math.max(Math.round((1000 * ({ easy: 1, medium: 1.5, hard: 2 }[difficulty])) - Math.min(elapsedTime, 600) - (mistakes * 50) - (hintsUsed * 100)), 100)}
            time={elapsedTime}
            mistakes={mistakes}
            hintsUsed={hintsUsed}
            difficulty={difficulty}
            onClose={() => setIsCompleted(false)}
            onNewGame={() => startNewGame(difficulty)}
          />
        )}

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard game="sudoku" />
        </div>
      </div>
    </div>
  );
}
