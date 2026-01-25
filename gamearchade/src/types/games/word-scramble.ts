// Word Scramble Game Type Definitions

export type WordScrambleDifficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'insane';

export type WordScrambleGameMode = 'classic' | 'timed' | 'streak' | 'marathon' | 'blitz' | 'zen';

export type WordGuessStatus = 'correct' | 'incorrect' | 'too_short' | 'invalid_chars' | 'already_guessed';

export type WordScrambleCategory = 'programming' | 'science' | 'animals' | 'countries' | 'technology' | 'general' | 'mixed';

export interface WordScrambleWord {
  id: number;
  original: string;
  scrambled: string;
  category: WordScrambleCategory;
  difficulty: WordScrambleDifficulty;
  hints: string[];
  definition?: string;
  length: number;
  points: number;
}

export interface WordScrambleAttempt {
  word: string;
  guess: string;
  isCorrect: boolean;
  reactionTime: number;
  hintsUsed: number;
  score: number;
  timestamp: Date;
  attemptsCount: number;
}

export interface WordScramblePowerUp {
  id: string;
  type: 'reveal-letter' | 'extra-time' | 'double-points' | 'hint-boost' | 'skip-word';
  name: string;
  description: string;
  duration?: number;
  effect: number;
  cost: number;
  isActive: boolean;
  usesRemaining?: number;
}

export interface WordScrambleGameSession {
  sessionId: string;
  userId?: string;
  difficulty: WordScrambleDifficulty;
  gameMode: WordScrambleGameMode;
  category: WordScrambleCategory;
  
  // Game State
  currentWord: WordScrambleWord | null;
  currentWordIndex: number;
  totalWords: number;
  wordsCompleted: number;
  currentScore: number;
  
  // Timing
  startTime: Date;
  endTime?: Date;
  timeRemaining?: number;
  totalDuration: number;
  isPaused: boolean;
  pausedAt?: Date;
  
  // Performance Metrics
  totalGuesses: number;
  correctGuesses: number;
  incorrectGuesses: number;
  accuracy: number;
  averageReactionTime: number;
  fastestSolve: number;
  slowestSolve: number;
  
  // Streaks and Bonuses
  currentStreak: number;
  maxStreak: number;
  perfectWords: number;
  oneGuessWords: number;
  
  // Power-ups and Hints
  activePowerUps: WordScramblePowerUp[];
  totalHintsUsed: number;
  maxHints: number;
  
  // Progress
  isCompleted: boolean;
  completionPercentage: number;
  finalRating: string;
  achievements: string[];
  
  // Advanced Features
  categoryStats: Record<WordScrambleCategory, number>;
  difficultyProgression: boolean;
  bonusMultiplier: number;
  consistencyScore: number;
  
  // Attempts tracking
  attempts: WordScrambleAttempt[];
  
  // Word history
  completedWords: WordScrambleWord[];
  skippedWords: string[];
}

export interface WordGuessRequest {
  guess: string;
  sessionId: string;
  reactionTime?: number;
  hintsUsed?: number;
}

export interface WordGuessResponse {
  status: WordGuessStatus;
  isCorrect: boolean;
  correctWord?: string;
  score: number;
  bonusMultiplier: number;
  streakBonus: number;
  newStreak: number;
  message: string;
  achievement?: string;
  nextWord?: WordScrambleWord;
}

export interface WordScrambleGameConfig {
  difficulty: WordScrambleDifficulty;
  gameMode: WordScrambleGameMode;
  category: WordScrambleCategory;
  customWords?: string[];
  customTimeLimit?: number;
  enablePowerUps: boolean;
  enableHints: boolean;
  enableAchievements: boolean;
  autoProgress: boolean;
  showDefinitions: boolean;
  allowSkipping: boolean;
}

export interface WordScrambleHint {
  type: 'first-letter' | 'last-letter' | 'vowels' | 'definition' | 'category' | 'length';
  content: string;
  cost: number;
  revealedInfo: string;
}

export interface WordScrambleAchievement {
  id: string;
  name: string;
  description: string;
  category: 'speed' | 'accuracy' | 'streak' | 'completion' | 'difficulty' | 'special';
  requirement: {
    type: string;
    value: number;
  };
  reward: {
    type: 'points' | 'powerup' | 'badge';
    value: number;
  };
  isUnlocked: boolean;
  unlockedAt?: Date;
}

export interface WordScramblePerformanceMetrics {
  // Speed Metrics
  averageReactionTime: number;
  fastestGuess: {
    word: string;
    time: number;
  };
  slowestGuess: {
    word: string;
    time: number;
  };
  
  // Accuracy Metrics
  totalAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  accuracy: number;
  firstTrySuccess: number;
  
  // Streak Metrics
  longestStreak: number;
  currentStreak: number;
  streakBreaks: number;
  perfectRounds: number;
  
  // Word Difficulty Metrics
  easiestWordSolved: string;
  hardestWordSolved: string;
  averageWordDifficulty: number;
  difficultyProgression: number;
  
  // Consistency Metrics
  reactionTimeVariance: number;
  consistencyRating: number;
  improvementRate: number;
  
  // Overall Rating
  speedRating: number;
  accuracyRating: number;
  streakRating: number;
  difficultyRating: number;
  overallRating: number;
}

export interface WordScrambleLeaderboard {
  userId: string;
  username: string;
  difficulty: WordScrambleDifficulty;
  gameMode: WordScrambleGameMode;
  score: number;
  wordsCompleted: number;
  accuracy: number;
  averageTime: number;
  maxStreak: number;
  achievements: string[];
  playedAt: Date;
  rank?: number;
}

export interface WordScrambleStats {
  totalGamesPlayed: number;
  totalWordsCompleted: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  totalPlayTime: number;
  favoriteCategory: WordScrambleCategory;
  masteredDifficulties: WordScrambleDifficulty[];
  longestStreak: number;
  averageReactionTime: number;
  achievementsUnlocked: number;
}

export interface WordScrambleWordBank {
  [key in WordScrambleDifficulty]: {
    [category in WordScrambleCategory]: string[];
  };
}

// Default Word Banks by Difficulty and Category
export const defaultWordBank: WordScrambleWordBank = {
  easy: {
    programming: ['HTML', 'CODE', 'BYTE', 'DATA', 'FILE', 'LOOP', 'JAVA', 'NODE'],
    science: ['ATOM', 'GENE', 'CELL', 'WAVE', 'STAR', 'MOON', 'ROCK', 'ACID'],
    animals: ['CAT', 'DOG', 'BIRD', 'FISH', 'BEAR', 'LION', 'DUCK', 'FROG'],
    countries: ['USA', 'UK', 'JAPAN', 'INDIA', 'CHINA', 'SPAIN', 'ITALY', 'PERU'],
    technology: ['WIFI', 'CHIP', 'DISK', 'MOUSE', 'SCREEN', 'CABLE', 'PHONE'],
    general: ['HOUSE', 'WATER', 'LIGHT', 'MUSIC', 'HAPPY', 'QUICK', 'QUIET'],
    mixed: ['CODE', 'STAR', 'LION', 'JAPAN', 'PHONE', 'MUSIC', 'HAPPY']
  },
  medium: {
    programming: ['REACT', 'PYTHON', 'ANGULAR', 'DOCKER', 'GITHUB', 'SYNTAX', 'OBJECT'],
    science: ['PHOTON', 'ENZYME', 'OXYGEN', 'CARBON', 'PLASMA', 'GRAVITY', 'ENERGY'],
    animals: ['ELEPHANT', 'PENGUIN', 'DOLPHIN', 'GIRAFFE', 'CHEETAH', 'OCTOPUS'],
    countries: ['FRANCE', 'GERMANY', 'AUSTRALIA', 'CANADA', 'BRAZIL', 'MEXICO'],
    technology: ['ROUTER', 'SERVER', 'LAPTOP', 'TABLET', 'MOBILE', 'DEVICE'],
    general: ['PUZZLE', 'GARDEN', 'BRIDGE', 'CASTLE', 'FOREST', 'ORANGE'],
    mixed: ['REACT', 'PHOTON', 'ELEPHANT', 'FRANCE', 'ROUTER', 'PUZZLE']
  },
  hard: {
    programming: ['JAVASCRIPT', 'ALGORITHM', 'DATABASE', 'FRAMEWORK', 'TYPESCRIPT', 'DEBUGGING'],
    science: ['CHROMOSOME', 'MOLECULE', 'QUANTUM', 'RELATIVITY', 'PERIODIC', 'NUCLEAR'],
    animals: ['RHINOCEROS', 'CHAMELEON', 'PLATYPUS', 'FLAMINGO', 'KANGAROO', 'MONGOOSE'],
    countries: ['SWITZERLAND', 'NETHERLANDS', 'ARGENTINA', 'BANGLADESH', 'UZBEKISTAN'],
    technology: ['BLOCKCHAIN', 'ARTIFICIAL', 'CYBERSECURITY', 'QUANTUM', 'BIOMETRIC'],
    general: ['PSYCHOLOGY', 'PHILOSOPHY', 'ARCHITECTURE', 'LITERATURE', 'MATHEMATICS'],
    mixed: ['ALGORITHM', 'QUANTUM', 'RHINOCEROS', 'SWITZERLAND', 'BLOCKCHAIN', 'PSYCHOLOGY']
  },
  expert: {
    programming: ['ASYNCHRONOUS', 'POLYMORPHISM', 'ENCAPSULATION', 'INHERITANCE', 'ABSTRACTION'],
    science: ['THERMODYNAMICS', 'ELECTROMAGNETIC', 'CRYSTALLOGRAPHY', 'BIOCHEMISTRY'],
    animals: ['ARCHAEOPTERYX', 'TYRANNOSAURUS', 'BRACHIOSAURUS', 'PARASAUROLOPHUS'],
    countries: ['CZECHOSLOVAKIA', 'LIECHTENSTEIN', 'KAZAKHSTAN', 'TURKMENISTAN'],
    technology: ['NANOTECHNOLOGY', 'BIOTECHNOLOGY', 'CRYPTOCURRENCY', 'VIRTUALIZATION'],
    general: ['CONSCIOUSNESS', 'EXISTENTIALISM', 'TRANSCENDENTAL', 'METAMORPHOSIS'],
    mixed: ['POLYMORPHISM', 'THERMODYNAMICS', 'ARCHAEOPTERYX', 'LIECHTENSTEIN', 'NANOTECHNOLOGY']
  },
  insane: {
    programming: ['MICROARCHITECTURE', 'MULTITHREADING', 'SERIALIZATION', 'CONTAINERIZATION'],
    science: ['DEOXYRIBONUCLEIC', 'SUPERCONDUCTIVITY', 'SPECTROPHOTOMETRY', 'CHROMATOGRAPHY'],
    animals: ['MICRORAPTOR', 'CARNOTAURUS', 'THERIZINOSAURUS', 'DIPLODOCUS'],
    countries: ['CZECHOSLOVAKIA', 'YUGOSLAVIA', 'MESOPOTAMIA', 'CONSTANTINOPLE'],
    technology: ['PHOTOLITHOGRAPHY', 'BIOENGINEERING', 'SEMICONDUCTORS', 'TELECOMMUNICATIONS'],
    general: ['INCOMPREHENSIBILITY', 'UNCHARACTERISTICALLY', 'INSTITUTIONALIZATION'],
    mixed: ['MICROARCHITECTURE', 'SUPERCONDUCTIVITY', 'THERIZINOSAURUS', 'PHOTOLITHOGRAPHY']
  }
};

// Game Constants
export const WORD_SCRAMBLE_CONSTANTS = {
  MIN_WORD_LENGTH: 3,
  MAX_WORD_LENGTH: 20,
  BASE_WORD_SCORE: 100,
  LENGTH_MULTIPLIER: 10,
  SPEED_BONUS_THRESHOLD: 5000, // 5 seconds
  STREAK_MULTIPLIER: 1.2,
  MAX_HINTS: 3,
  HINT_COSTS: {
    'first-letter': 10,
    'last-letter': 10,
    'vowels': 15,
    'definition': 20,
    'category': 5,
    'length': 5
  },
  POWERUP_DURATION: 30000, // 30 seconds
  AUTO_SAVE_INTERVAL: 15000, // 15 seconds
  
  DIFFICULTY_MULTIPLIERS: {
    easy: 1.0,
    medium: 1.2,
    hard: 1.5,
    expert: 2.0,
    insane: 3.0
  },
  
  TIME_LIMITS: {
    easy: 60,
    medium: 45,
    hard: 30,
    expert: 20,
    insane: 15
  },
  
  ACHIEVEMENTS: {
    SPEED_MASTER: { requirement: 3, reward: 200 }, // Solve in under 3 seconds
    STREAK_KING: { requirement: 10, reward: 500 }, // 10 word streak
    PERFECT_ROUND: { requirement: 1, reward: 300 }, // 100% accuracy for 5+ words
    HINT_FREE: { requirement: 5, reward: 250 }, // Solve 5 words without hints
    DIFFICULTY_MASTER: { requirement: 1, reward: 1000 } // Complete expert/insane level
  }
} as const;

// Scrambling algorithms
export type ScrambleAlgorithm = 'random' | 'reverse' | 'shuffle_pairs' | 'rotate' | 'complex';

export interface ScrambleOptions {
  algorithm: ScrambleAlgorithm;
  difficulty: WordScrambleDifficulty;
  preserveFirst?: boolean;
  preserveLast?: boolean;
  minChanges?: number;
}

export interface WordProgress {
  wordId: number;
  attempts: number;
  hintsUsed: number;
  timeSpent: number;
  isCompleted: boolean;
  score: number;
}