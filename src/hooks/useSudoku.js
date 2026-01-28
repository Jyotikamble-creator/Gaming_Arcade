import { useState, useEffect, useRef, useCallback } from 'react';
import { submitScore } from '../api/Api';
import { logger, LogTags } from '../lib/logger';
import { 
  createPuzzle, 
  isBoardComplete, 
  calculateScore,
  isValidMove 
} from '../utils/sudokuUtils';

// Constants
const MAX_HINTS = 3;
const DIFFICULTIES = ['easy', 'medium', 'hard'];

/**
 * Custom hook for managing Sudoku game logic
 */
export const useSudoku = () => {
  // Game state
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
  const [isLoading, setIsLoading] = useState(true);

  // Timer ref
  const timerRef = useRef(null);

  // Computed values
  const canUseHints = hintsUsed < MAX_HINTS;
  const isGameActive = startTime && !isCompleted && !isPaused;
  const finalScore = isCompleted ? calculateScore(difficulty, elapsedTime, mistakes, hintsUsed) : 0;

  // Clear timer
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // Start a new game
  const startNewGame = useCallback(async (diff) => {
    setIsLoading(true);
    clearTimer();
    
    logger.info('Starting new Sudoku game', { difficulty: diff }, LogTags.GAME_LOAD);
    
    try {
      // Generate puzzle in the next tick to avoid blocking UI
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
      
      logger.info('Sudoku game generated successfully', { difficulty: diff }, LogTags.GAME_LOAD);
    } catch (error) {
      logger.error('Failed to generate Sudoku puzzle', error, {}, LogTags.GAME_LOAD);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle cell click
  const handleCellClick = useCallback((row, col) => {
    if (isCompleted || isPaused || !initialBoard) return;
    if (initialBoard[row][col] !== 0) return; // Can't select initial cells

    setSelectedCell({ row, col });
  }, [isCompleted, isPaused, initialBoard]);

  // Check puzzle completion
  const checkCompletion = useCallback((currentBoard) => {
    if (!solution) return;

    if (isBoardComplete(currentBoard, solution)) {
      setIsCompleted(true);
      const finalTime = Math.floor((Date.now() - startTime) / 1000);
      const finalScore = calculateScore(difficulty, finalTime, mistakes, hintsUsed);

      // Submit score
      submitScore({
        game: 'sudoku',
        playerName: 'guest',
        score: finalScore,
        meta: {
          difficulty,
          time: finalTime,
          mistakes,
          hintsUsed
        }
      }).catch(error => {
        logger.error('Failed to submit Sudoku score', error, {}, LogTags.SAVE_SCORE);
      });

      logger.info('Sudoku completed', { 
        score: finalScore, 
        time: finalTime, 
        mistakes, 
        hintsUsed, 
        difficulty 
      }, LogTags.SAVE_SCORE);
    }
  }, [solution, startTime, difficulty, mistakes, hintsUsed]);

  // Handle number input
  const handleNumberInput = useCallback((num) => {
    if (!selectedCell || isCompleted || isPaused || !board || !solution || !initialBoard) return;

    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== 0) return; // Can't modify initial cells

    const newBoard = board.map(r => [...r]);
    const cellKey = `${row}-${col}`;

    if (notesMode) {
      // Toggle note
      const currentNotes = notes[cellKey] || [];
      const newNotes = { ...notes };

      if (currentNotes.includes(num)) {
        newNotes[cellKey] = currentNotes.filter(n => n !== num);
        if (newNotes[cellKey].length === 0) {
          delete newNotes[cellKey];
        }
      } else {
        newNotes[cellKey] = [...currentNotes, num].sort();
      }

      setNotes(newNotes);
    } else {
      // Set number
      newBoard[row][col] = num;

      // Clear notes for this cell
      if (notes[cellKey]) {
        const newNotes = { ...notes };
        delete newNotes[cellKey];
        setNotes(newNotes);
      }

      // Check if correct
      if (solution[row][col] !== num) {
        setMistakes(prev => prev + 1);
        logger.debug('Incorrect number placed', { 
          row, col, num, correct: solution[row][col] 
        }, LogTags.GAME_COMPLETE);
      }

      setBoard(newBoard);
      checkCompletion(newBoard);
    }
  }, [selectedCell, isCompleted, isPaused, board, solution, initialBoard, notesMode, notes, checkCompletion]);

  // Clear selected cell
  const handleClearCell = useCallback(() => {
    if (!selectedCell || isCompleted || isPaused || !board || !initialBoard) return;

    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== 0) return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = 0;
    setBoard(newBoard);

    // Clear notes for this cell
    const cellKey = `${row}-${col}`;
    if (notes[cellKey]) {
      const newNotes = { ...notes };
      delete newNotes[cellKey];
      setNotes(newNotes);
    }
  }, [selectedCell, isCompleted, isPaused, board, initialBoard, notes]);

  // Use hint
  const handleHint = useCallback(() => {
    if (!selectedCell || isCompleted || isPaused || !canUseHints || !board || !solution || !initialBoard) return;

    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== 0) return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = solution[row][col];
    setBoard(newBoard);
    setHintsUsed(prev => prev + 1);

    // Clear notes for this cell
    const cellKey = `${row}-${col}`;
    if (notes[cellKey]) {
      const newNotes = { ...notes };
      delete newNotes[cellKey];
      setNotes(newNotes);
    }

    logger.info('Hint used', { row, col, hintsUsed: hintsUsed + 1 }, LogTags.GAME_COMPLETE);

    checkCompletion(newBoard);
  }, [selectedCell, isCompleted, isPaused, canUseHints, board, solution, initialBoard, notes, hintsUsed, checkCompletion]);

  // Toggle pause
  const togglePause = useCallback(() => {
    if (isCompleted) return;

    if (isPaused) {
      // Resume: adjust start time to account for pause duration
      setStartTime(Date.now() - (elapsedTime * 1000));
    }

    setIsPaused(!isPaused);
  }, [isCompleted, isPaused, elapsedTime]);

  // Change difficulty
  const changeDifficulty = useCallback((newDifficulty) => {
    if (window.confirm('Start a new game with different difficulty?')) {
      startNewGame(newDifficulty);
    }
  }, [startNewGame]);

  // Toggle notes mode
  const toggleNotesMode = useCallback(() => {
    setNotesMode(prev => !prev);
  }, []);

  // Timer effect
  useEffect(() => {
    if (isGameActive) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      clearTimer();
    }

    return clearTimer;
  }, [isGameActive, startTime]);

  // Initialize game on mount
  useEffect(() => {
    startNewGame(difficulty);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return clearTimer;
  }, []);

  return {
    // Game state
    difficulty,
    puzzle,
    solution,
    board,
    initialBoard,
    selectedCell,
    mistakes,
    elapsedTime,
    isCompleted,
    isPaused,
    hintsUsed,
    notes,
    notesMode,
    isLoading,
    
    // Computed values
    canUseHints,
    isGameActive,
    finalScore,
    maxHints: MAX_HINTS,
    difficulties: DIFFICULTIES,
    
    // Actions
    startNewGame,
    handleCellClick,
    handleNumberInput,
    handleClearCell,
    handleHint,
    togglePause,
    changeDifficulty,
    toggleNotesMode,
    setIsCompleted
  };
};