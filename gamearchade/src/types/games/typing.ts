// Typing Test Game Types
export interface TypingPassage {
  id: string;
  text: string;
  title: string;
  difficulty: TypingDifficulty;
  language: string;
  category: TypingCategory;
  wordCount: number;
  averageWordLength: number;
  commonWords: number;
  specialCharacters: number;
  source?: string;
  tags: string[];
}

export interface TypingCharacter {
  char: string;
  status: 'untyped' | 'correct' | 'incorrect' | 'extra';
  timestamp?: Date;
  timeTaken?: number;
}

export interface TypingWord {
  word: string;
  characters: TypingCharacter[];
  isCorrect: boolean;
  hasErrors: boolean;
  errorCount: number;
  timeTaken: number;
  startTime: Date;
  endTime?: Date;
}

export interface TypingStatistics {
  wpm: number; // Words per minute
  netWpm: number; // Net words per minute (accounting for errors)
  grossWpm: number; // Gross words per minute
  accuracy: number; // Percentage accuracy
  errorRate: number; // Errors per minute
  totalCharacters: number;
  correctCharacters: number;
  incorrectCharacters: number;
  totalWords: number;
  correctWords: number;
  incorrectWords: number;
  extraCharacters: number;
  missedCharacters: number;
  totalKeystrokes: number;
  backspaces: number;
  timeElapsed: number; // milliseconds
}

export interface TypingGameSession {
  sessionId: string;
  userId: string;
  passageId: string;
  passage: TypingPassage;
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
  isPaused: boolean;
  currentPosition: number;
  typedText: string;
  words: TypingWord[];
  characters: TypingCharacter[];
  statistics: TypingStatistics;
  gameMode: TypingGameMode;
  timeLimit?: number; // seconds
  wordLimit?: number;
  targetWpm?: number;
  settings: TypingGameSettings;
  mistakes: TypingMistake[];
  achievements: TypingAchievement[];
}

export interface TypingMistake {
  position: number;
  expected: string;
  typed: string;
  timestamp: Date;
  correctionTime?: number;
  wordIndex: number;
  characterIndex: number;
}

export interface TypingGameSettings {
  showWpm: boolean;
  showAccuracy: boolean;
  showTimer: boolean;
  showProgress: boolean;
  enableSound: boolean;
  highlightErrors: boolean;
  stopOnError: boolean;
  confidenceMode: boolean; // Can't see typed text
  cursorFollowing: boolean;
  fontSize: number;
  theme: string;
  keyboardLayout: string;
}

export interface TypingPerformanceMetrics {
  consistency: number; // WPM consistency over time
  rhythm: number; // Typing rhythm stability
  speed: number; // Overall speed rating
  accuracy: number; // Overall accuracy rating
  stamina: number; // Performance over longer texts
  adaptability: number; // Performance across different text types
  overallRating: number;
}

export interface TypingSessionResult {
  sessionId: string;
  finalStatistics: TypingStatistics;
  performance: TypingPerformanceMetrics;
  grade: TypingGrade;
  improvements: string[];
  weakAreas: string[];
  strongAreas: string[];
  nextRecommendation: string;
  achievements: TypingAchievement[];
  personalBest: boolean;
  rank: TypingRank;
}

export interface TypingAchievement {
  id: string;
  name: string;
  description: string;
  condition: string;
  category: 'speed' | 'accuracy' | 'consistency' | 'endurance' | 'special';
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  target?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface TypingProfile {
  userId: string;
  totalSessions: number;
  totalTimeTyped: number; // milliseconds
  totalCharactersTyped: number;
  totalWordsTyped: number;
  averageWpm: number;
  bestWpm: number;
  averageAccuracy: number;
  bestAccuracy: number;
  totalMistakes: number;
  averageSessionTime: number;
  preferredDifficulty: TypingDifficulty;
  preferredCategories: TypingCategory[];
  consistencyRating: number;
  improvementRate: number; // WPM improvement per week
  achievements: TypingAchievement[];
  rank: TypingRank;
  level: number;
  experience: number;
  streaks: {
    current: number;
    longest: number;
    dailyGoal: number;
  };
  weakKeys: string[];
  strongKeys: string[];
  typingHabits: {
    peakHours: number[];
    avgSessionsPerDay: number;
    preferredTextLength: number;
  };
  lastActive: Date;
  joinDate: Date;
}

export interface TypingLeaderboard {
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
  category: 'wpm' | 'accuracy' | 'consistency' | 'improvement';
  entries: TypingLeaderboardEntry[];
  userRank?: number;
  totalUsers: number;
  updatedAt: Date;
}

export interface TypingLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  wpm: number;
  accuracy: number;
  consistency: number;
  sessionsCount: number;
  totalTime: number;
  rank_tier: TypingRank;
  achievedAt: Date;
}

export interface TypingChallenge {
  id: string;
  name: string;
  description: string;
  type: 'speed' | 'accuracy' | 'endurance' | 'consistency' | 'custom';
  difficulty: TypingDifficulty;
  requirements: {
    minWpm?: number;
    minAccuracy?: number;
    minTime?: number;
    maxErrors?: number;
    passages: string[];
  };
  rewards: {
    experience: number;
    achievements?: string[];
    badges?: string[];
  };
  timeLimit?: number;
  startDate: Date;
  endDate: Date;
  participants: number;
  isActive: boolean;
}

export interface TypingProgress {
  userId: string;
  date: Date;
  sessionsCompleted: number;
  totalTimeTyped: number;
  averageWpm: number;
  averageAccuracy: number;
  improvementFromYesterday: {
    wpm: number;
    accuracy: number;
  };
  dailyGoal: {
    target: number;
    achieved: number;
    type: 'sessions' | 'time' | 'wpm' | 'words';
  };
  weeklyTrend: {
    wpm: number[];
    accuracy: number[];
    sessions: number[];
  };
}

export interface TypingAnalytics {
  userId: string;
  timeRange: 'day' | 'week' | 'month' | 'year';
  wpmProgression: { date: Date; wpm: number; accuracy: number }[];
  accuracyTrend: number[];
  errorPatterns: {
    character: string;
    frequency: number;
    improvement: number;
  }[];
  timeDistribution: {
    hour: number;
    sessions: number;
    averageWpm: number;
  }[];
  textPreferences: {
    difficulty: Record<TypingDifficulty, number>;
    category: Record<TypingCategory, number>;
    length: Record<string, number>;
  };
  performanceInsights: {
    bestTime: string;
    mostImprovedArea: string;
    suggestedPractice: string[];
    strengthAreas: string[];
    growthAreas: string[];
  };
}

export type TypingDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';

export type TypingCategory = 
  | 'literature' 
  | 'technology' 
  | 'business' 
  | 'science' 
  | 'quotes' 
  | 'poetry' 
  | 'news' 
  | 'programming' 
  | 'random' 
  | 'custom';

export type TypingGameMode = 
  | 'standard' 
  | 'zen' 
  | 'timed' 
  | 'word-count' 
  | 'quote' 
  | 'custom';

export type TypingGrade = 'F' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';

export type TypingRank = 
  | 'Novice' 
  | 'Apprentice' 
  | 'Skilled' 
  | 'Expert' 
  | 'Master' 
  | 'Grandmaster' 
  | 'Legend';

export interface TypingAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface TypingPassageRequest {
  difficulty?: TypingDifficulty;
  category?: TypingCategory;
  minWords?: number;
  maxWords?: number;
  language?: string;
  excludeUsed?: boolean;
  userId?: string;
}

export interface TypingSessionRequest {
  userId: string;
  passageId?: string;
  gameMode: TypingGameMode;
  timeLimit?: number;
  wordLimit?: number;
  settings?: Partial<TypingGameSettings>;
}

export interface TypingUpdateRequest {
  sessionId: string;
  currentPosition: number;
  typedText: string;
  timestamp: Date;
  keystroke?: {
    key: string;
    isCorrect: boolean;
    timeTaken: number;
  };
}

export interface TypingStatsQuery {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  difficulty?: TypingDifficulty;
  category?: TypingCategory;
  gameMode?: TypingGameMode;
  minWpm?: number;
  maxWpm?: number;
  minAccuracy?: number;
  limit?: number;
  sortBy?: 'wpm' | 'accuracy' | 'date' | 'time';
  sortOrder?: 'asc' | 'desc';
}