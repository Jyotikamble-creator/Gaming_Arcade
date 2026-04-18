// Game 2048 Type Definitions

export type Game2048Difficulty = 'easy' | 'medium' | 'hard';

export interface Game2048DifficultyConfig {
  basePoints: number;
  gridSize: number;
  targetTile: number;
}

export const DIFFICULTY_CONFIG: Record<Game2048Difficulty, Game2048DifficultyConfig> = {
  easy: {
    basePoints: 50,
    gridSize: 3,
    targetTile: 256,
  },
  medium: {
    basePoints: 75,
    gridSize: 4,
    targetTile: 2048,
  },
  hard: {
    basePoints: 100,
    gridSize: 5,
    targetTile: 4096,
  },
};
