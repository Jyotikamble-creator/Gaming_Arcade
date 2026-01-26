// Word game type definitions and interfaces

/**
 * Word game types that support word fetching
 */
export type WordGameType = 
  | 'word-guess'
  | 'word-scramble' 
  | 'word-builder'
  | 'hangman'
  | 'typing';

/**
 * Word categories for different game contexts
 */
export type WordCategory = 
  | 'general'
  | 'animals'
  | 'colors'
  | 'countries'
  | 'food'
  | 'sports'
  | 'technology'
  | 'nature'
  | 'science'
  | 'history'
  | 'entertainment'
  | 'education'
  | 'business'
  | 'travel';

/**
 * Word difficulty levels
 */
export type WordDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

/**
 * Word length categories
 */
export type WordLength = 'short' | 'medium' | 'long' | 'any';

/**
 * Base word interface
 */
export interface IWord {
  id: string;
  word: string;
  definition?: string;
  category: WordCategory;
  difficulty: WordDifficulty;
  length: number;
  hints?: string[];
  pronunciation?: string;
  partOfSpeech?: 'noun' | 'verb' | 'adjective' | 'adverb' | 'other';
  frequency?: number; // Word usage frequency (1-10)
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Word fetch parameters
 */
export interface FetchWordsParams {
  game: WordGameType;
  category?: WordCategory;
  difficulty?: WordDifficulty;
  length?: WordLength;
  minLength?: number;
  maxLength?: number;
  limit?: number;
  offset?: number;
  includeHints?: boolean;
  includeDefinitions?: boolean;
  excludeUsed?: boolean; // Exclude words user has seen recently
  seed?: string; // For consistent randomization
}

/**
 * Words response interface
 */
export interface WordsResponse {
  words: IWord[];
  total: number;
  hasMore: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    limit: number;
    offset: number;
  };
  filters: {
    game: WordGameType;
    category?: WordCategory;
    difficulty?: WordDifficulty;
    length?: WordLength;
  };
}

/**
 * Single word fetch response
 */
export interface WordResponse {
  word: IWord;
  alternatives?: IWord[]; // Similar words for variety
  relatedWords?: string[];
}

/**
 * Word validation interface
 */
export interface WordValidation {
  word: string;
  isValid: boolean;
  exists: boolean;
  suggestions?: string[];
  difficulty?: WordDifficulty;
  category?: WordCategory;
}

/**
 * Word statistics interface
 */
export interface WordStats {
  totalWords: number;
  categoryCounts: Record<WordCategory, number>;
  difficultyDistribution: Record<WordDifficulty, number>;
  averageLength: number;
  mostUsedWords: Array<{
    word: string;
    usageCount: number;
  }>;
  recentlyAdded: IWord[];
}

/**
 * Word search parameters
 */
export interface WordSearchParams {
  query: string;
  category?: WordCategory;
  difficulty?: WordDifficulty;
  exact?: boolean;
  fuzzy?: boolean;
  limit?: number;
}

/**
 * Word search response
 */
export interface WordSearchResponse {
  results: IWord[];
  totalResults: number;
  searchTime: number;
  query: string;
  suggestions?: string[];
}

/**
 * Word list configuration for games
 */
export interface WordListConfig {
  game: WordGameType;
  categories: WordCategory[];
  difficulties: WordDifficulty[];
  lengthRange: {
    min: number;
    max: number;
  };
  maxWords: number;
  refreshInterval?: number; // Minutes
  allowRepeats: boolean;
}

/**
 * User word history
 */
export interface UserWordHistory {
  userId: string;
  game: WordGameType;
  wordsUsed: Array<{
    wordId: string;
    word: string;
    usedAt: Date;
    correct?: boolean;
    attempts?: number;
  }>;
  preferences: {
    favoriteCategories: WordCategory[];
    preferredDifficulty: WordDifficulty;
    avoidedWords: string[];
  };
  statistics: {
    totalWords: number;
    correctGuesses: number;
    averageAttempts: number;
    fastestSolve: number; // milliseconds
    longestStreak: number;
  };
}

/**
 * Word hint system
 */
export interface WordHint {
  id: string;
  wordId: string;
  type: 'definition' | 'synonym' | 'category' | 'length' | 'letter' | 'rhyme';
  content: string;
  difficulty: WordDifficulty;
  order: number; // Hint sequence
  revealed?: boolean;
}

/**
 * Word generation parameters
 */
export interface WordGenerationParams {
  game: WordGameType;
  playerLevel?: number;
  previousWords?: string[];
  targetDifficulty?: WordDifficulty;
  categories?: WordCategory[];
  constraints?: {
    minLength?: number;
    maxLength?: number;
    mustInclude?: string[];
    mustExclude?: string[];
    pattern?: string; // Regex pattern
  };
  count?: number;
}

/**
 * Word puzzle configuration
 */
export interface WordPuzzleConfig {
  targetWord: string;
  hints: WordHint[];
  timeLimit?: number; // seconds
  maxAttempts?: number;
  showProgress: boolean;
  allowSkip: boolean;
  difficulty: WordDifficulty;
  category: WordCategory;
}

/**
 * Word game session
 */
export interface WordGameSession {
  sessionId: string;
  userId: string;
  game: WordGameType;
  currentWord?: IWord;
  wordsCompleted: string[];
  wordsSkipped: string[];
  startedAt: Date;
  lastActivity: Date;
  config: WordListConfig;
  progress: {
    currentIndex: number;
    totalWords: number;
    correctCount: number;
    skippedCount: number;
  };
}

/**
 * Word analytics data
 */
export interface WordAnalytics {
  wordId: string;
  word: string;
  usage: {
    totalUses: number;
    successRate: number;
    averageAttempts: number;
    averageTime: number;
    skipRate: number;
  };
  difficulty: {
    perceived: WordDifficulty;
    actual: WordDifficulty;
    adjustmentSuggestion?: WordDifficulty;
  };
  performance: {
    byCategory: Record<WordCategory, number>;
    byLength: Record<number, number>;
    trends: Array<{
      date: Date;
      successRate: number;
      usageCount: number;
    }>;
  };
}

/**
 * Word import/export interfaces
 */
export interface WordImportData {
  words: Partial<IWord>[];
  format: 'json' | 'csv' | 'txt';
  options: {
    skipDuplicates: boolean;
    validateWords: boolean;
    autoCategories: boolean;
    autoDifficulty: boolean;
  };
}

export interface WordExportData {
  words: IWord[];
  format: 'json' | 'csv' | 'txt' | 'pdf';
  filters: FetchWordsParams;
  exportedAt: Date;
  totalCount: number;
}

/**
 * Word API error types
 */
export interface WordApiError {
  code: string;
  message: string;
  details?: {
    game?: WordGameType;
    word?: string;
    category?: WordCategory;
    suggestion?: string;
  };
}

/**
 * Word cache configuration
 */
export interface WordCacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in minutes
  maxSize: number; // Maximum cached words
  strategy: 'lru' | 'lfu' | 'ttl';
  prefetch: {
    enabled: boolean;
    categories: WordCategory[];
    count: number;
  };
}

/**
 * Real-time word updates
 */
export interface WordUpdate {
  type: 'added' | 'modified' | 'deleted';
  word: IWord;
  timestamp: Date;
  userId?: string;
}

/**
 * Word recommendation system
 */
export interface WordRecommendation {
  word: IWord;
  score: number; // 0-100
  reason: string;
  factors: {
    userLevel: number;
    difficulty: number;
    category: number;
    freshness: number;
    popularity: number;
  };
}