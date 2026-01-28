import React from 'react';
import { useSudoku } from '../../hooks/useSudoku';
import { formatTime } from '../../utils/sudokuUtils';

// Components
import LoadingSpinner from '../shared/LoadingSpinner';
import Instructions from '../shared/Instructions';
import Leaderboard from '../leaderboard/Leaderboard';
import SudokuBoard from '../sudoku/SudokuBoard';
import SudokuControls from '../sudoku/SudokuControls';
import SudokuStats from '../sudoku/SudokuStats';
import SudokuCompletedModal from '../sudoku/SudokuCompletedModal';
import AnimatedBackground from '../AnimatedBackground';

/**
 * Main Sudoku container component
 */
const SudokuContainer = () => {
  const {
    difficulty,
    board,
    initialBoard,
    selectedCell,
    solution,
    notes,
    mistakes,
    elapsedTime,
    isCompleted,
    isPaused,
    hintsUsed,
    notesMode,
    isLoading,
    canUseHints,
    finalScore,
    maxHints,
    startNewGame,
    handleCellClick,
    handleNumberInput,
    handleClearCell,
    handleHint,
    togglePause,
    changeDifficulty,
    toggleNotesMode,
    setIsCompleted
  } = useSudoku();

  // Loading state
  if (isLoading || !board) {
    return <LoadingSpinner message="Generating Sudoku puzzle..." />;
  }

  return (
    <div className="min-h-screen text-light-text relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {/* Header */}
        <SudokuHeader />

        {/* Game Stats */}
        <div className="mb-8">
          <SudokuStats
            difficulty={difficulty}
            time={elapsedTime}
            mistakes={mistakes}
            hintsUsed={hintsUsed}
            maxHints={maxHints}
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
              onDifficultyChange={changeDifficulty}
              onPause={togglePause}
              onResume={togglePause}
              difficulty={difficulty}
              isPaused={isPaused}
              notesMode={notesMode}
              onNotesToggle={toggleNotesMode}
              hintsUsed={hintsUsed}
              maxHints={maxHints}
              canUseHints={canUseHints}
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
            score={finalScore}
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
};

/**
 * Sudoku header component
 */
const SudokuHeader = () => (
  <div className="text-center mb-8">
    <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-2">
      🧩 Sudoku
    </h1>
    <p className="text-subtle-text text-lg">Fill the 9×9 grid with numbers 1-9</p>
  </div>
);

export default SudokuContainer;