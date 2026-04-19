// Music Tiles Game Types

export type MusicTilesDifficulty = 'easy' | 'medium' | 'hard';

export interface MusicTile {
  id: string;
  lane: number;
  position: number; // 0 to 100 (percentage from top)
  speed: number;
  hit: boolean;
  missed: boolean;
}

export interface MusicTilesGameState {
  tiles: MusicTile[];
  score: number;
  combo: number;
  maxCombo: number;
  hits: number;
  misses: number;
  perfectHits: number;
  gameStarted: boolean;
  gameEnded: boolean;
  isPlaying: boolean;
  difficulty: MusicTilesDifficulty;
  timeElapsed: number;
}

export interface MusicTilesConfig {
  numLanes: number;
  tileSpeed: number; // pixels per frame
  spawnRate: number; // milliseconds between spawns
  hitZoneStart: number; // percentage from top where hit zone starts
  hitZoneEnd: number; // percentage from top where hit zone ends
  perfectZoneStart: number; // percentage from top for perfect hit
  perfectZoneEnd: number; // percentage from top for perfect hit
}

export interface MusicTilesStats {
  score: number;
  combo: number;
  maxCombo: number;
  hits: number;
  misses: number;
  perfectHits: number;
  accuracy: number;
  performance: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface MusicTilesDifficultyConfig extends MusicTilesConfig {
  basePoints: number;
}

export const DIFFICULTY_CONFIG: Record<MusicTilesDifficulty, MusicTilesDifficultyConfig> = {
  easy: {
    numLanes: 3,
    tileSpeed: 2,
    spawnRate: 800,
    hitZoneStart: 80,
    hitZoneEnd: 100,
    perfectZoneStart: 90,
    perfectZoneEnd: 100,
    basePoints: 10
  },
  medium: {
    numLanes: 4,
    tileSpeed: 3,
    spawnRate: 600,
    hitZoneStart: 80,
    hitZoneEnd: 100,
    perfectZoneStart: 90,
    perfectZoneEnd: 100,
    basePoints: 15
  },
  hard: {
    numLanes: 4,
    tileSpeed: 4,
    spawnRate: 400,
    hitZoneStart: 80,
    hitZoneEnd: 100,
    perfectZoneStart: 90,
    perfectZoneEnd: 100,
    basePoints: 25
  }
};

export interface MusicTilesHookReturn {
  gameState: MusicTilesGameState;
  stats: MusicTilesStats;
  config: MusicTilesConfig;
  startGame: (difficulty: MusicTilesDifficulty) => void;
  stopGame: () => void;
  resetGame: () => void;
  handleLanePress: (lane: number) => void;
  isLoading: boolean;
  error: string | null;
}

export interface MusicTilesScoreResult {
  score: number;
  combo: number;
  maxCombo: number;
  hits: number;
  misses: number;
  perfectHits: number;
  accuracy: number;
  performance: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
}
