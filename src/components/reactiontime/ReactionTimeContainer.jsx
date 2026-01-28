import React from 'react';
import { useReactionTime } from '../../hooks/useReactionTime';

// Components
import Instructions from '../shared/Instructions';
import Leaderboard from '../leaderboard/Leaderboard';
import ReactionStats from '../reactiontime/ReactionStats';
import ReactionDisplay from '../reactiontime/ReactionDisplay';
import ReactionCompletedModal from '../reactiontime/ReactionCompletedModal';
import AnimatedBackground from '../AnimatedBackground';

/**
 * Main Reaction Time container component
 */
const ReactionTimeContainer = () => {
  const {
    gameState,
    currentRound,
    totalRounds,
    reactionTimes,
    tooEarly,
    averageTime,
    bestTime,
    gameCompleted,
    isGameActive,
    startGame,
    startRound,
    handleClick,
    resetGame,
    getPerformanceRating
  } = useReactionTime();

  const performanceRating = averageTime > 0 ? getPerformanceRating(averageTime) : null;

  return (
    <div className="min-h-screen text-light-text relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        {/* Header */}
        <ReactionTimeHeader />

        {/* Instructions */}
        {gameState === 'idle' && currentRound === 0 && !gameCompleted && (
          <div className="max-w-md mx-auto mb-8">
            <Instructions gameType="reaction-time" />
          </div>
        )}

        {/* Start Button */}
        {gameState === 'idle' && currentRound === 0 && !gameCompleted && (
          <StartGameSection 
            onStart={startGame} 
            totalRounds={totalRounds} 
          />
        )}

        {/* Game Stats */}
        {isGameActive && (
          <ReactionStats
            currentRound={currentRound}
            totalRounds={totalRounds}
            reactionTimes={reactionTimes}
            bestTime={bestTime}
          />
        )}

        {/* Reaction Display Area */}
        {isGameActive && (
          <ReactionDisplay
            gameState={gameState}
            tooEarly={tooEarly}
            currentRound={currentRound}
            totalRounds={totalRounds}
            reactionTimes={reactionTimes}
            onStartRound={startRound}
            onClick={handleClick}
          />
        )}

        {/* Completed Modal */}
        {gameCompleted && performanceRating && (
          <ReactionCompletedModal
            averageTime={averageTime}
            bestTime={bestTime}
            reactionTimes={reactionTimes}
            performanceRating={performanceRating}
            onPlayAgain={startGame}
            onBackToMenu={() => window.location.href = '/dashboard'}
          />
        )}

        {/* Leaderboard */}
        {gameState === 'idle' && currentRound === 0 && !gameCompleted && (
          <div className="mt-12">
            <Leaderboard game="reaction-time" />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Header component
 */
const ReactionTimeHeader = () => (
  <div className="text-center mb-8">
    <h1 className="text-5xl font-bold text-white mb-2">⚡ Reaction Time Tester</h1>
    <p className="text-gray-300">Test your reflexes and reaction speed!</p>
  </div>
);

/**
 * Start game section component
 */
const StartGameSection = ({ onStart, totalRounds }) => (
  <div className="max-w-2xl mx-auto mb-8">
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-indigo-500/30 shadow-2xl text-center">
      <button
        onClick={onStart}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xl py-6 px-12 rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
      >
        Start Test
      </button>
      <p className="mt-4 text-gray-400">
        You'll complete {totalRounds} rounds
      </p>
    </div>
  </div>
);

export default ReactionTimeContainer;