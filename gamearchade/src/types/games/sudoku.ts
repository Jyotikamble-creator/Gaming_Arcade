/**
 * Sudoku Game Types
 * Defines interfaces for Sudoku game functionality
 */

// Sudoku board - 9x9 grid of numbers (0 = empty cell)
export type SudokuBoard = number[][];

// Sudoku difficulty levels
export type SudokuDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

// Individual cell position
export interface ISudokuCell {
  row: number;
  col: number;
  value: number;
  isGiven: boolean; // True if this was part of the original puzzle
  isValid: boolean;
  notes?: number[]; // For player notes/candidates
}

// Complete Sudoku puzzle data
export interface ISudokuPuzzle {
  puzzle: SudokuBoard;
  solution: SudokuBoard;
  difficulty: SudokuDifficulty;
  cellsRemoved: number;
  puzzleId: string;
  timestamp: Date;
}

// Puzzle generation request
export interface SudokuPuzzleRequest {
  difficulty?: SudokuDifficulty;
  seed?: number; // For reproducible puzzles
}

// Puzzle generation response
export interface SudokuPuzzleResponse {
  puzzle: SudokuBoard;
  solution: SudokuBoard;
  difficulty: SudokuDifficulty;
  puzzleId: string;
  timestamp: string;
  cellsToFill: number;
}

// Solution validation request
export interface SudokuValidationRequest {
  board: SudokuBoard;
  solution?: SudokuBoard;
  puzzleId?: string;
}

// Solution validation response
export interface SudokuValidationResponse {
  valid: boolean;
  complete: boolean;
  filledCells: number;
  totalCells: number;
  errors?: ISudokuError[];
  completion: number; // Percentage (0-100)
}

// Validation error details
export interface ISudokuError {
  row: number;
  col: number;
  value: number;
  type: 'row' | 'column' | 'box' | 'solution';
  message: string;
}

// Game session data
export interface ISudokuSession {
  sessionId: string;
  userId?: string;
  playerName?: string;
  puzzleId: string;
  difficulty: SudokuDifficulty;
  initialPuzzle: SudokuBoard;
  currentBoard: SudokuBoard;
  solution: SudokuBoard;
  startTime: Date;
  endTime?: Date;
  timeElapsed: number; // in seconds
  isCompleted: boolean;
  isSolved: boolean;
  hints: number;
  hintsUsed: number;
  mistakes: number;
  maxMistakes: number;
  moves: ISudokuMove[];
  score?: number;
}

// Individual move/action in the game
export interface ISudokuMove {
  row: number;
  col: number;
  oldValue: number;
  newValue: number;
  timestamp: Date;
  moveType: 'fill' | 'clear' | 'note' | 'hint';
  isCorrect: boolean;
}

// Game statistics
export interface ISudokuStats {
  totalGames: number;
  completedGames: number;
  completionRate: number;
  averageTime: number;
  bestTime: number;
  averageScore: number;
  bestScore: number;
  totalHintsUsed: number;
  totalMistakes: number;
  difficultyBreakdown: Record<SudokuDifficulty, {
    games: number;
    completed: number;
    averageTime: number;
    bestTime: number;
    averageScore: number;
  }>;
}

// Hint generation
export interface ISudokuHint {
  row: number;
  col: number;
  value: number;
  technique: string;
  explanation: string;
  difficulty: number; // 1-10, complexity of the hint
}

// Game configuration
export interface ISudokuConfig {
  difficulty: SudokuDifficulty;
  maxHints: number;
  maxMistakes: number;
  enableTimer: boolean;
  enableNotes: boolean;
  enableValidation: boolean;
  autoCheckConflicts: boolean;
}

// Leaderboard entry
export interface ISudokuLeaderboard {
  rank: number;
  playerName: string;
  userId?: string;
  difficulty: SudokuDifficulty;
  timeElapsed: number;
  score: number;
  hintsUsed: number;
  mistakes: number;
  completedAt: Date;
}

// Puzzle generation parameters
export interface SudokuGenerationParams {
  difficulty: SudokuDifficulty;
  cellsToRemove: number;
  symmetry?: 'none' | 'rotational' | 'diagonal' | 'horizontal' | 'vertical';
  seed?: number;
}

// Board validation result
export interface ISudokuBoardValidation {
  isValid: boolean;
  isComplete: boolean;
  conflicts: ISudokuConflict[];
  possibleValues: Record<string, number[]>; // "row,col" -> possible values
}

// Conflict detection
export interface ISudokuConflict {
  cells: Array<{ row: number; col: number }>;
  value: number;
  type: 'row' | 'column' | 'box';
}

// Solving techniques
export interface ISudokuTechnique {
  name: string;
  difficulty: number;
  description: string;
  apply: (board: SudokuBoard) => { success: boolean; changes: ISudokuMove[] };
}

// Cell position in the Sudoku board
export interface SudokuCellPosition {
  row: number;
  col: number;
}

// Notes for Sudoku cells - key is `${row}-${col}`, value is array of possible numbers
export type SudokuNotes = Record<string, number[]>;

// Props for SudokuBoard component
export interface SudokuBoardProps {
  board: SudokuBoard;
  initialBoard: SudokuBoard;
  selectedCell: SudokuCellPosition | null;
  solution: SudokuBoard;
  notes: SudokuNotes;
  onCellClick: (row: number, col: number) => void;
  isPaused: boolean;
}

// Props for SudokuControls component
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

// Props for SudokuStats component
export interface SudokuStatsProps {
  difficulty: SudokuDifficulty;
  time: number;
  mistakes: number;
  hintsUsed: number;
  maxHints?: number;
  maxMistakes?: number;
}

// Props for SudokuCompletedModal component
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

export default ISudokuPuzzle;