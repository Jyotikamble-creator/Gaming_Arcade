import React from 'react';
import { useSimonSays } from '../../hooks/useSimonSays';

// Components
import LoadingSpinner from '../shared/LoadingSpinner';
import Instructions from '../shared/Instructions';
import Leaderboard from '../leaderboard/Leaderboard';
import SimonSaysStats from '../simonsays/SimonSaysStats';
import SimonSaysGrid from '../simonsays/SimonSaysGrid';
import SimonSaysGameOverModal from '../simonsays/SimonSaysGameOverModal';
import AnimatedBackground from '../AnimatedBackground';

/**
 * Main Simon Says container component
 */
const SimonSaysContainer = () => {
  const {
    colors,
    sequence,
    playerSequence,
    round,
    isShowingSequence,
    activeColor,
    gameOver,
    gameWon,
    isLoading,
    canPlayerInteract,
    gameStatus,
    sequenceLength,
    handleColorPress,
    restartGame
  } = useSimonSays();

  // Loading state
  if (isLoading) {
    return <LoadingSpinner message="Setting up Simon Says..." />;
  }

  return (
    <div className="min-h-screen text-light-text relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header */}
        <SimonSaysHeader />

        {/* Game Stats */}
        <SimonSaysStats
          round={round}
          sequenceLength={sequenceLength}
          gameStatus={gameStatus}
        />

        {/* Color Grid */}
        <SimonSaysGrid
          colors={colors}
          activeColor={activeColor}
          isShowingSequence={isShowingSequence}
          gameOver={gameOver}
          gameWon={gameWon}
          onPress={handleColorPress}
        />

        {/* Instructions */}
        <div className="max-w-md mx-auto mb-6">
          <Instructions gameType="simon-says" />
        </div>

        {/* Game Over Modal */}
        {(gameOver || gameWon) && (
          <SimonSaysGameOverModal
            gameWon={gameWon}
            round={round}
            onRestart={restartGame}
          />
        )}

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard game="simon-says" />
        </div>
      </div>
    </div>
  );
};

/**
 * Simon Says header component
 */
const SimonSaysHeader = () => (
  <div className="text-center mb-8">
    <h1 className="text-4xl font-bold text-white mb-2">🎯 Simon Says</h1>
    <p className="text-subtle-text">Repeat the color sequence to advance!</p>
  </div>
);

export default SimonSaysContainer;