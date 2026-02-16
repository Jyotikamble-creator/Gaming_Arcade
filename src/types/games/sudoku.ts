/**
 * TypeScript type definitions for Sudoku Game
 */

/**
 * Sudoku difficulty levels
 */
export type SudokuDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Sudoku board - 9x9 grid of numbers (0 = empty)
 */
export type SudokuBoard = number[][];

/**
 * Cell position in the Sudoku board
 */
export interface SudokuCellPosition {
  row: number;
  col: number;
}

/**
 * Notes for Sudoku cells - key is `${row}-${col}`, value is array of possible numbers
 */
export type SudokuNotes = Record<string, number[]>;

/**
 * Sudoku game state
 */
export interface SudokuGameState {
  difficulty: SudokuDifficulty;
  board: SudokuBoard;
  initialBoard: SudokuBoard;
  solution: SudokuBoard;
  selectedCell: SudokuCellPosition | null;
  mistakes: number;
  startTime: number | null;
  elapsedTime: number;
  isCompleted: boolean;
  isPaused: boolean;
  hintsUsed: number;
  notes: SudokuNotes;
  notesMode: boolean;
}

/**
 * Sudoku statistics
 */
export interface SudokuStats {
  difficulty: SudokuDifficulty;
  time: number;
  mistakes: number;
  hintsUsed: number;
  maxHints?: number;
  maxMistakes?: number;
}

/**
 * Sudoku completion data
 */
export interface SudokuCompletionData {
  score: number;
  time: number;
  mistakes: number;
  hintsUsed: number;
  difficulty: SudokuDifficulty;
}

/**
 * Props for SudokuBoard component
 */
export interface SudokuBoardProps {
  board: SudokuBoard;
  initialBoard: SudokuBoard;
  selectedCell: SudokuCellPosition | null;
  solution: SudokuBoard;
  notes: SudokuNotes;
  onCellClick: (row: number, col: number) => void;
  isPaused: boolean;
}

/**
 * Props for SudokuControls component
 */
export interface SudokuControlsProps {
  difficulty: SudokuDifficulty;
  notesMode: boolean;
  isPaused: boolean;
  hintsUsed: number;
  maxHints: number;
  onNumberSelect: (num: number) => void;
  onClear: () => void;
  onHint: () => void;
  onNotesToggle: () => void;
  onDifficultyChange: (difficulty: SudokuDifficulty) => void;
  onNewGame: () => void;
  onPause: () => void;
  onResume: () => void;
}

/**
 * Props for SudokuStats component
 */
export interface SudokuStatsProps {
  difficulty: SudokuDifficulty;
  time: number;
  mistakes: number;
  hintsUsed: number;
  maxHints?: number;
  maxMistakes?: number;
}

/**
 * Props for SudokuCompletedModal component
 */
export interface SudokuCompletedModalProps {
  isOpen: boolean;
  score: number;
  time: number;
  mistakes: number;
  hintsUsed: number;
  difficulty: SudokuDifficulty;
  onClose: () => void;
  onNewGame: () => void;
}