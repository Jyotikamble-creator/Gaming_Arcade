// Tower Stacker game constants and utilities
import { Block, PerformanceRating } from '../types/towerStacker';

// Game configuration constants
export const GAME_CONFIG = {
  BLOCK_HEIGHT: 30,
  INITIAL_WIDTH: 200,
  SPEED_INCREMENT: 0.5,
  INITIAL_SPEED: 2,
  CONTAINER_WIDTH: 400,
  CONTAINER_HEIGHT: 600,
  MAX_LEVELS: 20,
  PERFECT_DROP_THRESHOLD: 5,
  GAME_NAME: 'tower-stacker'
} as const;

// Scoring configuration
export const SCORING = {
  BASE_SCORE: 10,
  PERFECT_BONUS: 20,
  COMBO_MULTIPLIER: 5
} as const;

// Utility functions
export const calculateOverlap = (moving: Block, stationary: Block): number => {
  const movingRight = moving.x + moving.width;
  const stationaryRight = stationary.x + stationary.width;

  const overlapStart = Math.max(moving.x, stationary.x);
  const overlapEnd = Math.min(movingRight, stationaryRight);

  return Math.max(0, overlapEnd - overlapStart);
};

export const isPerfectDrop = (moving: Block, stationary: Block): boolean => {
  return Math.abs(moving.x - stationary.x) <= GAME_CONFIG.PERFECT_DROP_THRESHOLD;
};

export const calculateScore = (
  currentScore: number, 
  isPerfect: boolean, 
  perfectDrops: number
): number => {
  const baseScore = SCORING.BASE_SCORE;
  const perfectBonus = isPerfect ? SCORING.PERFECT_BONUS : 0;
  const comboBonus = perfectDrops >= 2 ? perfectDrops * SCORING.COMBO_MULTIPLIER : 0;
  
  return currentScore + baseScore + perfectBonus + comboBonus;
};

export const getPerformanceRating = (level: number): PerformanceRating => {
  if (level >= 20) return { text: '🏆 Tower Master!', color: 'text-yellow-400' };
  if (level >= 15) return { text: '⭐ Excellent!', color: 'text-green-400' };
  if (level >= 10) return { text: '👍 Great Job!', color: 'text-blue-400' };
  if (level >= 5) return { text: '👌 Good Try!', color: 'text-purple-400' };
  return { text: '💪 Keep Practicing!', color: 'text-gray-400' };
};

export const getBlockColor = (index: number): string => {
  const hue = (index * 30) % 360;
  return `hsl(${hue}, 70%, 60%)`;
};

export const shouldIncreaseSpeed = (level: number): boolean => {
  return level % 5 === 0;
};