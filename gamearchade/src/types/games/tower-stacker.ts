// Tower Stacker Game Types
export interface TowerStackerDifficultyBenchmark {
  minLevel: number;
  maxLevel: number;
}

export interface TowerStackerDifficultyBenchmarks {
  beginner: TowerStackerDifficultyBenchmark;
  intermediate: TowerStackerDifficultyBenchmark;
  advanced: TowerStackerDifficultyBenchmark;
  expert: TowerStackerDifficultyBenchmark;
  master: TowerStackerDifficultyBenchmark;
}

export interface TowerStackerBlock {
  id: string;
  width: number;
  position: number;
  speed: number;
  direction: 'left' | 'right';
  color: string;
}

export interface TowerStackerLevel {
  level: number;
  targetWidth: number;
  speed: number;
  blocks: TowerStackerBlock[];
  perfectDrop: boolean;
  accuracy: number;
}

export interface TowerStackerMove {
  level: number;
  dropPosition: number;
  targetPosition: number;
  accuracy: number;
  perfectDrop: boolean;
  blockWidth: number;
  timestamp: Date;
  timeTaken: number;
}

export interface TowerStackerGameSession {
  sessionId: string;
  userId: string;
  currentLevel: number;
  maxLevel: number;
  perfectDrops: number;
  totalDrops: number;
  score: number;
  gameState: 'playing' | 'completed' | 'failed';
  tower: TowerStackerBlock[];
  moves: TowerStackerMove[];
  startTime: Date;
  endTime?: Date;
  totalTime: number;
  averageAccuracy: number;
  bestStreak: number;
  currentStreak: number;
}

export interface TowerStackerScoreCalculation {
  level: number;
  perfectDrops: number;
  totalDrops: number;
  averageAccuracy: number;
  completionBonus: number;
  accuracyBonus: number;
  speedBonus: number;
  streakBonus: number;
  totalScore: number;
}

export interface TowerStackerScoreResult {
  score: number;
  rating: TowerStackerRating;
  message: string;
  breakdown: TowerStackerScoreCalculation;
  achievements: TowerStackerAchievement[];
}

export interface TowerStackerAchievement {
  id: string;
  name: string;
  description: string;
  condition: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface TowerStackerStatistics {
  userId: string;
  totalGames: number;
  gamesCompleted: number;
  highestLevel: number;
  bestScore: number;
  totalPerfectDrops: number;
  totalDrops: number;
  averageAccuracy: number;
  bestAccuracy: number;
  totalPlayTime: number;
  averageGameTime: number;
  bestTime: number;
  longestStreak: number;
  achievements: TowerStackerAchievement[];
  lastPlayed: Date;
  levelDistribution: Record<number, number>;
  accuracyHistory: number[];
  scoreHistory: number[];
}

export interface TowerStackerLeaderboard {
  rank: number;
  userId: string;
  username: string;
  score: number;
  level: number;
  accuracy: number;
  perfectDrops: number;
  completionTime: number;
  achievedAt: Date;
}

export interface TowerStackerPerformanceMetrics {
  reactionTime: number;
  precision: number;
  consistency: number;
  progression: number;
  efficiency: number;
  overallRating: number;
}

export interface TowerStackerGameConfiguration {
  initialWidth: number;
  minWidth: number;
  baseSpeed: number;
  speedIncrement: number;
  maxSpeed: number;
  perfectDropThreshold: number;
  colors: string[];
  levelProgressionRules: {
    speedIncrease: number;
    widthDecrease: number;
    colorChange: boolean;
  };
}

export interface TowerStackerValidation {
  isValidDrop: boolean;
  accuracy: number;
  newWidth: number;
  isPerfect: boolean;
  blocksLost: number;
  canContinue: boolean;
}

export type TowerStackerRating = 
  | 'Beginner' 
  | 'Good' 
  | 'Great' 
  | 'Excellent' 
  | 'Tower Master'
  | 'Perfect Architect'
  | 'Sky Scraper Builder';

export type TowerStackerDifficulty = 
  | 'beginner' 
  | 'intermediate' 
  | 'advanced' 
  | 'expert' 
  | 'master';

export interface TowerStackerAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface TowerStackerSessionRequest {
  userId: string;
  difficulty?: TowerStackerDifficulty;
  configuration?: Partial<TowerStackerGameConfiguration>;
}

export interface TowerStackerDropRequest {
  sessionId: string;
  dropPosition: number;
  reactionTime: number;
  level: number;
}

export interface TowerStackerValidateRequest {
  sessionId: string;
  currentBlock: TowerStackerBlock;
  previousBlock: TowerStackerBlock;
  dropPosition: number;
}

export interface TowerStackerStatsQuery {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  minLevel?: number;
  maxLevel?: number;
  difficulty?: TowerStackerDifficulty;
  limit?: number;
  sortBy?: 'score' | 'level' | 'accuracy' | 'time' | 'date';
  sortOrder?: 'asc' | 'desc';
}