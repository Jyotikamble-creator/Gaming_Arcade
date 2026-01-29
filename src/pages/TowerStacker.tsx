// Tower Stacker game page component
import React from 'react';
// Hooks
import { useTowerStacker } from '../hooks/useTowerStacker';
// Constants
import { GAME_CONFIG } from '../utils/towerStackerUtils';
// Component imports
import Instructions from '../components/shared/Instructions';
import Leaderboard from '../components/leaderboard/Leaderboard';
import {
  TowerDisplay,
  TowerStats,
  TowerCompletedModal
} from '../../gamearchade/src/components/towerstacker';
import AnimatedBackground from '../components/AnimatedBackground';

// Main TowerStacker component
export default function TowerStacker(): JSX.Element {
  const {
    gameState,
    tower,
    currentBlock,
    score,
    level,
    perfectDrops,
    gameCompleted,
    highestLevel,
    startGame,
    dropBlock
  } = useTowerStacker();

  // Render component
  return (
    <div className="min-h-screen text-light-text relative overflow-hidden">
      <AnimatedBackground />
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Tower Stacker</h1>
          <p className="text-subtle-text">Drop blocks to build the tallest tower! Perfect drops earn bonus points.</p>
        </div>

        {/* Instructions */}
        <div className="max-w-md mx-auto mb-6">
          <Instructions gameType="tower-stacker" />
        </div>

        {/* Game Stats */}
        <TowerStats
          score={score}
          level={level}
          perfectDrops={perfectDrops}
          highestLevel={highestLevel}
        />

        {/* Game Display */}
        <TowerDisplay
          tower={tower}
          currentBlock={currentBlock}
          containerWidth={GAME_CONFIG.CONTAINER_WIDTH}
          blockHeight={GAME_CONFIG.BLOCK_HEIGHT}
          gameState={gameState}
          onStart={startGame}
          onDrop={dropBlock}
        />

        {/* Completion Modal */}
        {gameCompleted && (
          <TowerCompletedModal
            score={score}
            level={level}
            perfectDrops={perfectDrops}
            onPlayAgain={startGame}
          />
        )}

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard game="tower-stacker" />
        </div>
      </div>
    </div>
  );
}