// Word Builder Game Type Definitions

export type WordBuilderDifficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'master';

export type WordBuilderGameMode = 'classic' | 'timed' | 'endless' | 'puzzle' | 'challenge';

export type WordValidationStatus = 'valid' | 'invalid' | 'already_used' | 'too_short' | 'invalid_letters';

export interface WordBuilderChallenge {
  id: number;
  difficulty: WordBuilderDifficulty;
  letters: string[];
  targetWords: string[];
  minWords: number;
  maxScore: number;
  timeLimit?: number;
  description?: string;
  category?: string;
}

export interface WordBuilderAttempt {
  word: string;
  isValid: boolean;
  score: number;
  reactionTime: number;
  timestamp: Date;
  bonusMultiplier: number;
  letterCount: number;
}

export interface WordBuilderPowerUp {
  id: string;
  type: 'hint' | 'extra-time' | 'score-boost' | 'reveal-word' | 'shuffle-letters';
  name: string;
  description: string;
  duration?: number;
  effect: number;
  cost: number;
  isActive: boolean;
}

export interface WordBuilderGameSession {
  sessionId: string;
  userId?: string;
  challengeId: number;
  difficulty: WordBuilderDifficulty;
  gameMode: WordBuilderGameMode;
  
  // Game State
  letters: string[];
  foundWords: string[];
  currentScore: number;
  wordsFound: number;
  targetWordsCount: number;
  
  // Timing
  startTime: Date;
  endTime?: Date;
  timeRemaining?: number;
  totalDuration: number;
  isPaused: boolean;
  pausedAt?: Date;
  
  // Performance Metrics
  averageWordTime: number;
  longestWord: string;
  shortestWord: string;
  wordsPerMinute: number;
  accuracy: number;
  perfectWords: number;
  
  // Power-ups and Bonuses
  activePowerUps: WordBuilderPowerUp[];
  hintsUsed: number;
  maxHints: number;
  comboStreak: number;
  maxComboStreak: number;
  
  // Progress
  isCompleted: boolean;
  completionPercentage: number;
  finalRating: string;
  achievements: string[];
  
  // Advanced Features
  letterUsageStats: Record<string, number>;
  wordLengthDistribution: Record<number, number>;
  categoryBonus: number;
  consistencyRating: number;
}

export interface WordValidationRequest {
  word: string;
  challengeId: number;
  sessionId: string;
  availableLetters: string[];
  reactionTime?: number;
}

export interface WordValidationResponse {
  status: WordValidationStatus;
  isValid: boolean;
  score: number;
  bonusMultiplier: number;
  newWord: boolean;
  wordLength: number;
  remainingLetters: string[];
  message: string;
  achievement?: string;
}

export interface WordBuilderGameConfig {
  difficulty: WordBuilderDifficulty;
  gameMode: WordBuilderGameMode;
  customLetters?: string[];
  customTargetWords?: string[];
  customTimeLimit?: number;
  enablePowerUps: boolean;
  enableHints: boolean;
  enableAchievements: boolean;
  autoShuffle: boolean;
  showProgress: boolean;
}

export interface WordBuilderHint {
  type: 'first-letter' | 'word-length' | 'definition' | 'rhyme' | 'category';
  content: string;
  targetWord: string;
  cost: number;
}

export interface WordBuilderAchievement {
  id: string;
  name: string;
  description: string;
  category: 'speed' | 'accuracy' | 'length' | 'discovery' | 'consistency' | 'special';
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

export interface WordBuilderPerformanceMetrics {
  // Speed Metrics
  averageWordTime: number;
  fastestWord: {
    word: string;
    time: number;
  };
  slowestWord: {
    word: string;
    time: number;
  };
  
  // Accuracy Metrics
  totalAttempts: number;
  validAttempts: number;
  invalidAttempts: number;
  accuracy: number;
  
  // Word Quality Metrics
  longestWord: string;
  shortestValidWord: string;
  averageWordLength: number;
  wordLengthVariety: number;
  
  // Discovery Metrics
  wordsFound: number;
  targetWordsFound: number;
  completionRate: number;
  hiddenWordsFound: number;
  
  // Consistency Metrics
  streakLength: number;
  maxStreak: number;
  consistencyScore: number;
  
  // Overall Rating
  speedRating: number;
  accuracyRating: number;
  discoveryRating: number;
  consistencyRating: number;
  overallRating: number;
}

export interface WordBuilderLeaderboard {
  userId: string;
  username: string;
  difficulty: WordBuilderDifficulty;
  gameMode: WordBuilderGameMode;
  score: number;
  wordsFound: number;
  completionTime: number;
  accuracy: number;
  longestWord: string;
  achievements: string[];
  playedAt: Date;
  rank?: number;
}

export interface WordBuilderStats {
  totalGamesPlayed: number;
  totalWordsFound: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  favoriteLetters: string[];
  masteredDifficulties: WordBuilderDifficulty[];
  totalPlayTime: number;
  streakRecord: number;
  achievementsUnlocked: number;
  powerUpsUsed: number;
}

export interface WordBuilderLetterTile {
  letter: string;
  isSelected: boolean;
  isUsed: boolean;
  position: number;
  value: number;
  multiplier: number;
}

export interface WordBuilderWordResult {
  word: string;
  isValid: boolean;
  score: number;
  length: number;
  category?: string;
  definition?: string;
  difficulty: number;
  rarity: number;
}

export interface WordBuilderChallengeProgress {
  challengeId: number;
  wordsFound: string[];
  wordsRemaining: string[];
  currentScore: number;
  targetScore: number;
  completionPercentage: number;
  hintsUsed: number;
  timeElapsed: number;
  attempts: number;
}

// Default Challenges
export const defaultWordBuilderChallenges: WordBuilderChallenge[] = [
  {
    id: 1,
    difficulty: 'easy',
    letters: ['C', 'A', 'T', 'S', 'R', 'E'],
    targetWords: ['CAT', 'CATS', 'CAST', 'CARE', 'CASE', 'RACE', 'SCARE', 'CRATE', 'STARE', 'CARES', 'REACT', 'CASTER', 'RECAST', 'TRACES', 'CRATES'],
    minWords: 5,
    maxScore: 1500,
    category: 'Animals & Actions'
  },
  {
    id: 2,
    difficulty: 'easy',
    letters: ['D', 'O', 'G', 'S', 'R', 'E'],
    targetWords: ['DOG', 'DOGS', 'DOSE', 'DOES', 'RODE', 'ROSE', 'GOES', 'SORE', 'REDO', 'DOERS', 'GOERS', 'GORED', 'RODES'],
    minWords: 5,
    maxScore: 1300,
    category: 'Animals & Nature'
  },
  {
    id: 3,
    difficulty: 'easy',
    letters: ['F', 'I', 'S', 'H', 'E', 'R'],
    targetWords: ['FISH', 'FIRE', 'HIRE', 'FRESH', 'FRIES', 'FISHER', 'SHERIF'],
    minWords: 5,
    maxScore: 1400,
    category: 'Nature & Jobs'
  },
  {
    id: 4,
    difficulty: 'medium',
    letters: ['P', 'L', 'A', 'Y', 'E', 'R', 'S'],
    targetWords: ['PLAY', 'PLAYS', 'LAYER', 'RELAY', 'EARLY', 'YEARS', 'SPRAY', 'REPAY', 'LEAPS', 'SLAYER', 'PLAYER', 'PARLEY', 'REPLAY', 'PLAYERS', 'PARSLEY'],
    minWords: 7,
    maxScore: 2500,
    category: 'Sports & Activities'
  },
  {
    id: 5,
    difficulty: 'medium',
    letters: ['T', 'R', 'A', 'I', 'N', 'E', 'D'],
    targetWords: ['TRAIN', 'TRADE', 'TREND', 'DRAIN', 'DINER', 'TREAD', 'RATED', 'RETINA', 'DETAIN', 'RAINED', 'TRAINED'],
    minWords: 7,
    maxScore: 2200,
    category: 'Transportation & Learning'
  },
  {
    id: 6,
    difficulty: 'medium',
    letters: ['G', 'A', 'R', 'D', 'E', 'N', 'S'],
    targetWords: ['GARDEN', 'GRADE', 'GRAND', 'RANGE', 'SNARE', 'DANGER', 'GANDERS', 'GARDENS'],
    minWords: 7,
    maxScore: 2400,
    category: 'Nature & Places'
  },
  {
    id: 7,
    difficulty: 'hard',
    letters: ['C', 'R', 'E', 'A', 'T', 'I', 'V', 'E'],
    targetWords: ['CREATE', 'ACTIVE', 'NATIVE', 'REACTIVE', 'CREATIVE'],
    minWords: 3,
    maxScore: 3000,
    timeLimit: 180,
    category: 'Creativity & Innovation'
  },
  {
    id: 8,
    difficulty: 'hard',
    letters: ['S', 'T', 'U', 'D', 'E', 'N', 'T', 'S'],
    targetWords: ['STUDENT', 'STUDENTS', 'STUNTED', 'DENTIST', 'NESTED'],
    minWords: 3,
    maxScore: 2800,
    timeLimit: 200,
    category: 'Education & Learning'
  },
  {
    id: 9,
    difficulty: 'hard',
    letters: ['M', 'O', 'U', 'N', 'T', 'A', 'I', 'N'],
    targetWords: ['MOUNTAIN', 'AMOUNT', 'NATION', 'MANIA', 'MAINTAIN'],
    minWords: 3,
    maxScore: 3200,
    timeLimit: 240,
    category: 'Geography & Nature'
  }
];

// Game Constants
export const WORD_BUILDER_CONSTANTS = {
  MIN_WORD_LENGTH: 3,
  MAX_WORD_LENGTH: 15,
  BASE_WORD_SCORE: 10,
  LENGTH_MULTIPLIER: 2,
  PERFECT_WORD_BONUS: 50,
  STREAK_MULTIPLIER: 1.5,
  MAX_HINTS: 3,
  POWERUP_DURATION: 30000, // 30 seconds
  AUTO_SAVE_INTERVAL: 10000, // 10 seconds
  
  SCORING: {
    LETTER_VALUES: {
      'A': 1, 'E': 1, 'I': 1, 'O': 1, 'U': 1, 'N': 1, 'R': 1, 'T': 1, 'L': 1, 'S': 1,
      'D': 2, 'G': 2,
      'B': 3, 'C': 3, 'M': 3, 'P': 3,
      'F': 4, 'H': 4, 'V': 4, 'W': 4, 'Y': 4,
      'K': 5,
      'J': 8, 'X': 8,
      'Q': 10, 'Z': 10
    }
  },
  
  ACHIEVEMENTS: {
    SPEED_DEMON: { requirement: 5, reward: 100 }, // Find word in under 5 seconds
    WORD_MASTER: { requirement: 10, reward: 200 }, // Find 10 words in one game
    PERFECT_GAME: { requirement: 1, reward: 500 }, // 100% accuracy
    LONG_WORD: { requirement: 8, reward: 150 }, // Find 8+ letter word
    STREAK_KING: { requirement: 5, reward: 300 } // 5 word streak
  }
} as const;