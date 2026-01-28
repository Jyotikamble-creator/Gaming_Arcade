import React from 'react';
import { useSlidingPuzzle } from '../../hooks/useSlidingPuzzle';

// Components
import Instructions from '../shared/Instructions';
import Leaderboard from '../leaderboard/Leaderboard';
import PuzzleGrid from '../slidingpuzzle/PuzzleGrid';
import PuzzleStats from '../slidingpuzzle/PuzzleStats';
import PuzzleCompletedModal from '../slidingpuzzle/PuzzleCompletedModal';
import AnimatedBackground from '../AnimatedBackground';

/**
 * Main Sliding Puzzle container component
 */
const SlidingPuzzleContainer = () => {
  const {
    tiles,
    moves,
    timeElapsed,
    gameStarted,
    gameCompleted,
    isShuffling,
    gridSize,
    moveTile,
    shufflePuzzle,
    resetGame,
    startNewGame
  } = useSlidingPuzzle();

  return (
    <div className="min-h-screen text-light-text relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header */}
        <SlidingPuzzleHeader />

        {/* Instructions */}
        <div className="max-w-md mx-auto mb-6">
          <Instructions gameType="sliding-puzzle" />
        </div>

        {/* Game Stats */}
        <PuzzleStats
          moves={moves}
          timeElapsed={timeElapsed}
          gameStarted={gameStarted}
          gameCompleted={gameCompleted}
        />

        {/* Game Grid */}
        <PuzzleGrid
          tiles={tiles}
          gridSize={gridSize}
          onTileClick={moveTile}
          isShuffling={isShuffling}
          gameCompleted={gameCompleted}
          onShuffle={shufflePuzzle}
          onReset={resetGame}
        />

        {/* Completion Modal */}
        {gameCompleted && (
          <PuzzleCompletedModal
            moves={moves}
            timeElapsed={timeElapsed}
            onPlayAgain={startNewGame}
          />
        )}

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard game="sliding-puzzle" />
        </div>
      </div>
    </div>
  );
};

/**
 * Sliding Puzzle header component
 */
const SlidingPuzzleHeader = () => (
  <div className="text-center mb-8">
    <h1 className="text-4xl font-bold text-white mb-2">🧩 Sliding Puzzle</h1>
    <p className="text-subtle-text">Slide tiles to arrange them in numerical order!</p>
  </div>
);

export default SlidingPuzzleContainer;