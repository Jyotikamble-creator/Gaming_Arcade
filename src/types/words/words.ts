// Word client type declarations mapping to games/word types
import {
  WordDefinition,
  WordCategory,
  WordDifficulty,
  WordSearchQuery,
  WordSearchResult,
  WordValidationResult,
  WordAnalytics,
  WordImportRequest,
  WordRecommendation
} from '../games/word';

export type IWord = WordDefinition;

export type WordGameType = 'word-guess' | 'word-scramble' | 'word-builder' | 'hangman';

export type { WordCategory, WordDifficulty, WordAnalytics, WordRecommendation };

export interface FetchWordsParams {
  category?: string;
  difficulty?: string;
  limit?: number;
  offset?: number;
  includeHints?: boolean;
  includeDefinitions?: boolean;
}

export interface WordsResponse {
  words: IWord[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface WordResponse {
  word: IWord;
}

export type WordValidation = WordValidationResult;

export type WordStats = WordAnalytics;

export type WordSearchParams = WordSearchQuery;

export type WordSearchResponse = WordSearchResult;

export interface WordListConfig {
  defaultLanguage: string;
  defaultCategory: string;
  defaultDifficulty: string;
  autoVerification: boolean;
}

export interface UserWordHistory {
  history: any[];
  statistics: {
    totalWords: number;
    correctGuesses: number;
  };
}

export interface WordGenerationParams {
  game: string;
  count: number;
  targetDifficulty?: string;
}

export type WordImportData = WordImportRequest;

export interface WordExportData {
  totalCount: number;
  format: string;
  data: any;
}

export interface WordCacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
  strategy: 'lru' | 'fifo';
  prefetch: {
    enabled: boolean;
    categories: string[];
    count: number;
  };
}
