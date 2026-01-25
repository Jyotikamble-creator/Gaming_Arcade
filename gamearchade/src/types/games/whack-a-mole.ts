// Whack-a-Mole Game Types
export interface WhackMolePosition {
  row: number;
  col: number;
  index: number;
}

export interface WhackMole {
  id: string;
  position: WhackMolePosition;
  type: WhackMoleType;
  spawnTime: Date;
  despawnTime: Date;
  isActive: boolean;
  isHit: boolean;
  hitTime?: Date;
  points: number;
  speed: number; // Time visible in milliseconds
  size: number; // Relative size multiplier
  color: string;
  animation: WhackMoleAnimation;
  specialEffect?: WhackSpecialEffect;
}

export interface WhackGameGrid {
  rows: number;
  cols: number;
  totalHoles: number;
  activeMoles: WhackMole[];
  maxSimultaneousMoles: number;
}

export interface WhackGameSession {
  sessionId: string;
  userId: string;
  gameMode: WhackGameMode;
  difficulty: WhackDifficulty;
  gridSize: number;
  duration: number; // seconds
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  isPaused: boolean;
  pausedTime: number; // Total time paused
  currentScore: number;
  molesSpawned: number;
  molesHit: number;
  molesMissed: number;
  perfectHits: number; // Hit within first 200ms
  streakCurrent: number;
  streakBest: number;
  comboMultiplier: number;
  totalReactionTime: number;
  fastestReaction: number;
  slowestReaction: number;
  powerUpsUsed: number;
  specialMolesHit: number;
  moleHistory: WhackMoleHit[];
  powerUps: WhackPowerUp[];
  settings: WhackGameSettings;
  statistics: WhackGameStatistics;
  achievements: WhackAchievement[];
}

export interface WhackMoleHit {
  moleId: string;
  moleType: WhackMoleType;
  hitPosition: WhackMolePosition;
  reactionTime: number;
  accuracy: number; // Distance from center
  points: number;
  timestamp: Date;
  streakCount: number;
  comboMultiplier: number;
  isPerfect: boolean;
  isSpecial: boolean;
}

export interface WhackPowerUp {
  id: string;
  type: WhackPowerUpType;
  name: string;
  description: string;
  effect: WhackPowerUpEffect;
  duration: number; // milliseconds
  activatedAt?: Date;
  isActive: boolean;
  cooldown: number;
  lastUsed?: Date;
}

export interface WhackPowerUpEffect {
  slowMotion?: number; // Speed multiplier
  freezeMoles?: number; // Freeze duration
  doublePoints?: boolean;
  biggerTargets?: number; // Size multiplier
  autoHit?: number; // Auto-hit next N moles
  extraTime?: number; // Add seconds
  scoreBonus?: number; // Instant points
}

export interface WhackGameSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  showReactionTime: boolean;
  showStreakCounter: boolean;
  showComboMultiplier: boolean;
  highlightMoles: boolean;
  difficulty: WhackDifficulty;
  gameMode: WhackGameMode;
  customDuration?: number;
  customGridSize?: number;
  enablePowerUps: boolean;
  enableSpecialMoles: boolean;
  autoRestart: boolean;
}

export interface WhackGameStatistics {
  accuracy: number; // Percentage of moles hit
  averageReactionTime: number;
  molesPerSecond: number;
  scorePerSecond: number;
  perfectHitRate: number; // Percentage of perfect hits
  consistency: number; // Reaction time consistency
  efficiency: number; // Points per mole spawned
  endurance: number; // Performance over time
  precision: number; // Hit accuracy (distance from center)
  focus: number; // Ability to hit consecutive moles
  overallRating: number;
}

export interface WhackSessionResult {
  sessionId: string;
  finalScore: number;
  rank: WhackRank;
  grade: WhackGrade;
  statistics: WhackGameStatistics;
  performance: WhackPerformanceMetrics;
  achievements: WhackAchievement[];
  personalBest: boolean;
  improvements: string[];
  weakAreas: string[];
  strongAreas: string[];
  nextRecommendation: string;
  comparison: {
    averageScore: number;
    percentileRank: number;
    globalRank?: number;
  };
}

export interface WhackAchievement {
  id: string;
  name: string;
  description: string;
  condition: string;
  category: WhackAchievementCategory;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  target?: number;
  icon: string;
  points: number;
}

export interface WhackProfile {
  userId: string;
  totalSessions: number;
  totalPlayTime: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  totalMolesHit: number;
  totalMolesSpawned: number;
  averageAccuracy: number;
  bestAccuracy: number;
  averageReactionTime: number;
  fastestReaction: number;
  longestStreak: number;
  totalPowerUpsUsed: number;
  favoriteGameMode: WhackGameMode;
  preferredDifficulty: WhackDifficulty;
  achievements: WhackAchievement[];
  rank: WhackRank;
  level: number;
  experience: number;
  streaks: {
    current: number;
    longest: number;
    dailyGoal: number;
  };
  skillRatings: {
    speed: number;
    accuracy: number;
    consistency: number;
    endurance: number;
    focus: number;
  };
  playHistory: {
    sessionsToday: number;
    bestDay: Date;
    totalDaysPlayed: number;
    averageSessionsPerDay: number;
  };
  lastPlayed: Date;
  createdAt: Date;
}

export interface WhackLeaderboard {
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
  category: 'score' | 'accuracy' | 'streak' | 'reaction-time';
  gameMode?: WhackGameMode;
  difficulty?: WhackDifficulty;
  entries: WhackLeaderboardEntry[];
  userRank?: number;
  totalPlayers: number;
  updatedAt: Date;
}

export interface WhackLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  accuracy: number;
  reactionTime: number;
  streak: number;
  gameMode: WhackGameMode;
  difficulty: WhackDifficulty;
  achievedAt: Date;
  sessionDuration: number;
}

export interface WhackPerformanceMetrics {
  speed: number; // Reaction time rating
  accuracy: number; // Hit percentage
  consistency: number; // Reaction time consistency
  endurance: number; // Performance over time
  focus: number; // Streak maintenance
  adaptability: number; // Performance across difficulties
  overallRating: number;
}

export interface WhackGameConfiguration {
  gridSizes: Record<WhackDifficulty, number>;
  durations: Record<WhackGameMode, number>;
  spawnRates: Record<WhackDifficulty, number>;
  moleVisibilityTime: Record<WhackDifficulty, number>;
  maxSimultaneousMoles: Record<WhackDifficulty, number>;
  pointValues: Record<WhackMoleType, number>;
  powerUpFrequency: number;
  specialMoleFrequency: number;
}

export interface WhackChallenge {
  id: string;
  name: string;
  description: string;
  type: WhackChallengeType;
  difficulty: WhackDifficulty;
  requirements: {
    minScore?: number;
    minAccuracy?: number;
    minStreak?: number;
    maxReactionTime?: number;
    gameMode: WhackGameMode;
    duration: number;
  };
  rewards: {
    points: number;
    achievements: string[];
    powerUps?: WhackPowerUpType[];
  };
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  participants: number;
  completions: number;
}

export type WhackMoleType = 
  | 'normal' 
  | 'fast' 
  | 'slow' 
  | 'bonus' 
  | 'golden' 
  | 'bomb' 
  | 'freeze' 
  | 'double'
  | 'giant'
  | 'mini';

export type WhackMoleAnimation = 
  | 'popup' 
  | 'slide' 
  | 'bounce' 
  | 'spin' 
  | 'fade' 
  | 'zoom'
  | 'shake'
  | 'glow';

export type WhackSpecialEffect = 
  | 'sparkle' 
  | 'explosion' 
  | 'rainbow' 
  | 'lightning' 
  | 'fire'
  | 'ice'
  | 'star'
  | 'heart';

export type WhackGameMode = 
  | 'classic' 
  | 'arcade' 
  | 'zen' 
  | 'survival' 
  | 'time-attack' 
  | 'precision'
  | 'endurance'
  | 'chaos';

export type WhackDifficulty = 
  | 'easy' 
  | 'normal' 
  | 'hard' 
  | 'expert' 
  | 'insane';

export type WhackPowerUpType = 
  | 'slow-motion' 
  | 'freeze' 
  | 'double-points' 
  | 'big-targets'
  | 'auto-hit' 
  | 'extra-time' 
  | 'score-bonus'
  | 'multi-hit';

export type WhackGrade = 'F' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';

export type WhackRank = 
  | 'Rookie' 
  | 'Amateur' 
  | 'Skilled' 
  | 'Expert' 
  | 'Master' 
  | 'Champion'
  | 'Legend'
  | 'Grandmaster';

export type WhackAchievementCategory = 
  | 'score' 
  | 'accuracy' 
  | 'speed' 
  | 'streak' 
  | 'endurance'
  | 'special' 
  | 'milestone' 
  | 'challenge';

export type WhackChallengeType = 
  | 'score-attack' 
  | 'accuracy-test' 
  | 'speed-demon' 
  | 'endurance-run'
  | 'perfect-game' 
  | 'streak-master' 
  | 'reaction-master';

export interface WhackAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface WhackStartRequest {
  userId: string;
  gameMode?: WhackGameMode;
  difficulty?: WhackDifficulty;
  customSettings?: Partial<WhackGameSettings>;
}

export interface WhackHitRequest {
  sessionId: string;
  moleId: string;
  hitPosition: { x: number; y: number };
  reactionTime: number;
  timestamp: Date;
}

export interface WhackUpdateRequest {
  sessionId: string;
  action: 'hit' | 'miss' | 'powerup' | 'pause' | 'resume';
  data: any;
  timestamp: Date;
}

export interface WhackStatsQuery {
  userId?: string;
  gameMode?: WhackGameMode;
  difficulty?: WhackDifficulty;
  startDate?: Date;
  endDate?: Date;
  minScore?: number;
  maxScore?: number;
  limit?: number;
  sortBy?: 'score' | 'accuracy' | 'date' | 'streak';
  sortOrder?: 'asc' | 'desc';
}