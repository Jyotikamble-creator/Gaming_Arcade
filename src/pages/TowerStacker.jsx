// Tower Stacker game page component
import React, { useState, useEffect, useRef } from 'react';
// API and logging imports
import { submitScore } from '../api/Api';
// Logger
import { logger, LogTags } from '../lib/logger';
// Component imports
import Instructions from '../components/shared/Instructions';
import Leaderboard from '../components/leaderboard/Leaderboard';
import TowerDisplay from '../components/towerstacker/TowerDisplay';
import TowerStats from '../components/towerstacker/TowerStats';
import TowerCompletedModal from '../components/towerstacker/TowerCompletedModal';
import AnimatedBackground from '../components/AnimatedBackground';

// Constants
const BLOCK_HEIGHT = 30;
const INITIAL_WIDTH = 200;
const SPEED_INCREMENT = 0.5;
const INITIAL_SPEED = 2;

// Main TowerStacker component
export default function TowerStacker() {
  const [gameState, setGameState] = useState('idle'); // idle, playing, gameOver
  const [tower, setTower] = useState([]);
  const [currentBlock, setCurrentBlock] = useState(null);
  const [direction, setDirection] = useState(1);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [perfectDrops, setPerfectDrops] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [highestLevel, setHighestLevel] = useState(0);

  const animationRef = useRef(null);
  const containerWidth = 400;

  // Start new game
  const startGame = () => {
    const initialBlock = {
      x: containerWidth / 2 - INITIAL_WIDTH / 2,
      width: INITIAL_WIDTH,
      y: 0,
    };

    setTower([initialBlock]);
    setCurrentBlock({
      x: 0,
      width: INITIAL_WIDTH,
      y: BLOCK_HEIGHT,
    });
    setDirection(1);
    setSpeed(INITIAL_SPEED);
    setScore(0);
    setLevel(1);
    setPerfectDrops(0);
    setGameState('playing');
    setGameCompleted(false);

    logger.info('Tower Stacker game started', {}, LogTags.WORD_GUESS);
  };

  // Animation loop for moving block
  useEffect(() => {
    if (gameState !== 'playing' || !currentBlock) return;

    const animate = () => {
      setCurrentBlock(prev => {
        if (!prev) return prev;

        let newX = prev.x + speed * direction;
        let newDirection = direction;

        // Bounce off walls
        if (newX <= 0) {
          newX = 0;
          newDirection = 1;
        } else if (newX + prev.width >= containerWidth) {
          newX = containerWidth - prev.width;
          newDirection = -1;
        }

        setDirection(newDirection);

        return { ...prev, x: newX };
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, currentBlock, speed, direction]);

  // Drop block
  const dropBlock = () => {
    if (gameState !== 'playing' || !currentBlock) return;

    const lastBlock = tower[tower.length - 1];
    const overlap = calculateOverlap(currentBlock, lastBlock);

    if (overlap <= 0) {
      // Game over - no overlap
      endGame();
      return;
    }

    // Calculate new block dimensions based on overlap
    const overlapStart = Math.max(currentBlock.x, lastBlock.x);
    const newBlock = {
      x: overlapStart,
      width: overlap,
      y: tower.length * BLOCK_HEIGHT,
    };

    // Check for perfect drop (within 5 pixels)
    const isPerfect = Math.abs(currentBlock.x - lastBlock.x) <= 5;
    if (isPerfect) {
      setPerfectDrops(prev => prev + 1);
    }

    // Calculate score
    const baseScore = 10;
    const perfectBonus = isPerfect ? 20 : 0;
    const comboBonus = perfectDrops >= 2 ? perfectDrops * 5 : 0;
    const newScore = score + baseScore + perfectBonus + comboBonus;

    setTower([...tower, newBlock]);
    setScore(newScore);
    setLevel(tower.length + 1);

    // Increase speed every 5 levels
    if (tower.length % 5 === 0) {
      setSpeed(prev => prev + SPEED_INCREMENT);
    }

    // Check for win condition (20 blocks)
    if (tower.length >= 19) {
      completeGame(newScore, 20);
      return;
    }

    // Set next block
    setCurrentBlock({
      x: 0,
      width: overlap,
      y: (tower.length + 1) * BLOCK_HEIGHT,
    });

    if (!isPerfect) {
      setPerfectDrops(0);
    }
  };

  // Calculate overlap between two blocks
  const calculateOverlap = (moving, stationary) => {
    const movingRight = moving.x + moving.width;
    const stationaryRight = stationary.x + stationary.width;

    const overlapStart = Math.max(moving.x, stationary.x);
    const overlapEnd = Math.min(movingRight, stationaryRight);

    return Math.max(0, overlapEnd - overlapStart);
  };

  // End game
  const endGame = () => {
    setGameState('gameOver');
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (level > highestLevel) {
      setHighestLevel(level);
    }

    completeGame(score, level);
  };

  // Complete game and submit score
  const completeGame = async (finalScore, finalLevel) => {
    setGameCompleted(true);
    setGameState('gameOver');

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    try {
      await submitScore('tower-stacker', finalScore);
      logger.info('Tower Stacker score submitted', { score: finalScore, level: finalLevel }, LogTags.WORD_GUESS);
    } catch (error) {
      logger.error('Failed to submit score', error, {}, LogTags.WORD_GUESS);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' && gameState === 'playing') {
        e.preventDefault();
        dropBlock();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, currentBlock, tower, score, perfectDrops, level]);

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
          containerWidth={containerWidth}
          blockHeight={BLOCK_HEIGHT}
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
