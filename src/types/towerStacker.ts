// TypeScript types for Tower Stacker game

export type GameState = 'idle' | 'playing' | 'gameOver';

export interface Block {
  x: number;
  width: number;
  y: number;
  displayY?: number;
}

export interface Tower extends Array<Block> {}

export interface GameStats {
  score: number;
  level: number;
  perfectDrops: number;
  highestLevel: number;
}

export interface TowerDisplayProps {
  tower: Tower;
  currentBlock: Block | null;
  containerWidth: number;
  blockHeight: number;
  gameState: GameState;
  onStart: () => void;
  onDrop: () => void;
}

export interface TowerStatsProps {
  score: number;
  level: number;
  perfectDrops: number;
  highestLevel: number;
}

export interface TowerCompletedModalProps {
  score: number;
  level: number;
  perfectDrops: number;
  onPlayAgain: () => void;
}

export interface PerformanceRating {
  text: string;
  color: string;
}

export interface GameConfig {
  BLOCK_HEIGHT: number;
  INITIAL_WIDTH: number;
  SPEED_INCREMENT: number;
  INITIAL_SPEED: number;
  CONTAINER_WIDTH: number;
  CONTAINER_HEIGHT: number;
  MAX_LEVELS: number;
  PERFECT_DROP_THRESHOLD: number;
}