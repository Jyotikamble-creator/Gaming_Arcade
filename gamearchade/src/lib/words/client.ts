// Word management API client for Next.js with TypeScript

import { apiClient, ApiResponse, ApiError } from "@/lib/api/client";
import { logger, LogTags } from "@/lib/logger";
import type {
  IWord,
  WordGameType,
  WordCategory,
  WordDifficulty,
  FetchWordsParams,
  WordsResponse,
  WordResponse,
  WordValidation,
  WordStats,
  WordSearchParams,
  WordSearchResponse,
  WordListConfig,
  UserWordHistory,
  WordGenerationParams,
  WordAnalytics,
  WordImportData,
  WordExportData,
  WordCacheConfig,
  WordRecommendation
} from "@/types/words/words";

/**
 * Word API Client for managing game words and word-related operations
 */
export class WordApiClient {
  private readonly baseUrl = '/api/games';
  private readonly wordsUrl = '/api/words';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly cacheConfig: WordCacheConfig = {
    enabled: true,
    ttl: 15, // 15 minutes
    maxSize: 1000,
    strategy: 'lru',
    prefetch: {
      enabled: true,
      categories: ['general', 'animals', 'food'],
      count: 50
    }
  };

  /**
   * Fetch words for a specific game
   * @param game - Game type (defaults to word-guess)
   * @param params - Additional fetch parameters
   * @returns Promise with words data
   */
  async fetchWords(game: WordGameType = "word-guess", params?: Partial<FetchWordsParams>): Promise<IWord[]> {
    try {
      logger.debug("Fetching words for game", { game, ...params }, LogTags.WORD_GUESS);

      // Create cache key for performance
      const cacheKey = this.getCacheKey('fetchWords', { game, ...params });
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        logger.debug("Words fetched from cache", { game, count: cached.length }, LogTags.WORD_GUESS);
        return cached;
      }

      // Map game name to correct endpoint
      const endpoint = game === "word-guess" ? "word" : encodeURIComponent(game);
      
      // Build query parameters
      const queryParams = {
        limit: 50,
        includeHints: false,
        includeDefinitions: false,
        ...params
      };

      const response = await apiClient.get<IWord[]>(
        `${this.baseUrl}/${endpoint}/words`,
        { params: queryParams }
      );

      if (response.success && response.data) {
        // Cache the result
        this.setCache(cacheKey, response.data);

        logger.debug(
          "Words fetched successfully",
          { 
            game, 
            count: response.data.length,
            category: params?.category,
            difficulty: params?.difficulty
          },
          LogTags.WORD_GUESS
        );
        return response.data;
      }

      throw new Error(response.error || "Failed to fetch words");
    } catch (error) {
      logger.error("Failed to fetch words", error, { game, ...params }, LogTags.WORD_GUESS);
      throw this.handleError(error, "fetch words");
    }
  }

  /**
   * Fetch words with advanced filtering and pagination
   * @param params - Detailed fetch parameters
   * @returns Promise with paginated words response
   */
  async fetchWordsAdvanced(params: FetchWordsParams): Promise<WordsResponse> {
    try {
      logger.debug("Fetching words with advanced filtering", params, LogTags.WORD_GUESS);

      const queryParams = {
        limit: Math.min(params.limit || 20, 100),
        offset: Math.max(params.offset || 0, 0),
        ...params
      };

      const response = await apiClient.get<WordsResponse>(
        `${this.wordsUrl}/search`,
        { params: queryParams }
      );

      if (response.success && response.data) {
        logger.debug(
          "Advanced word search completed",
          { 
            total: response.data.total,
            returned: response.data.words.length,
            hasMore: response.data.hasMore
          },
          LogTags.WORD_GUESS
        );
        return response.data;
      }

      throw new Error(response.error || "Failed to fetch words with advanced filtering");
    } catch (error) {
      logger.error("Failed to fetch words with advanced filtering", error, params, LogTags.WORD_GUESS);
      throw this.handleError(error, "fetch words advanced");
    }
  }

  /**
   * Get a single random word for a game
   * @param game - Game type
   * @param category - Word category
   * @param difficulty - Word difficulty
   * @returns Promise with single word response
   */
  async getRandomWord(
    game: WordGameType,
    category?: WordCategory,
    difficulty?: WordDifficulty
  ): Promise<WordResponse> {
    try {
      logger.debug("Fetching random word", { game, category, difficulty });

      const params = {
        game,
        limit: 1,
        random: true,
        ...(category && { category }),
        ...(difficulty && { difficulty })
      };

      const response = await apiClient.get<WordResponse>(
        `${this.wordsUrl}/random`,
        { params }
      );

      if (response.success && response.data) {
        logger.debug(
          "Random word fetched successfully",
          { 
            word: response.data.word.word,
            game,
            category: response.data.word.category,
            difficulty: response.data.word.difficulty
          }
        );
        return response.data;
      }

      throw new Error(response.error || "Failed to get random word");
    } catch (error) {
      logger.error("Failed to get random word", error, { game, category, difficulty });
      throw this.handleError(error, "get random word");
    }
  }

  /**
   * Validate a word
   * @param word - Word to validate
   * @param game - Game context
   * @returns Promise with validation result
   */
  async validateWord(word: string, game?: WordGameType): Promise<WordValidation> {
    try {
      logger.debug("Validating word", { word, game });

      const response = await apiClient.post<WordValidation>(
        `${this.wordsUrl}/validate`,
        { word, game }
      );

      if (response.success && response.data) {
        logger.debug(
          "Word validation completed",
          { 
            word,
            isValid: response.data.isValid,
            exists: response.data.exists
          }
        );
        return response.data;
      }

      throw new Error(response.error || "Failed to validate word");
    } catch (error) {
      logger.error("Failed to validate word", error, { word, game });
      throw this.handleError(error, "validate word");
    }
  }

  /**
   * Search for words
   * @param params - Search parameters
   * @returns Promise with search results
   */
  async searchWords(params: WordSearchParams): Promise<WordSearchResponse> {
    try {
      logger.debug("Searching words", params);

      const response = await apiClient.get<WordSearchResponse>(
        `${this.wordsUrl}/search`,
        { params }
      );

      if (response.success && response.data) {
        logger.debug(
          "Word search completed",
          { 
            query: params.query,
            results: response.data.totalResults,
            searchTime: response.data.searchTime
          }
        );
        return response.data;
      }

      throw new Error(response.error || "Failed to search words");
    } catch (error) {
      logger.error("Failed to search words", error, params);
      throw this.handleError(error, "search words");
    }
  }

  /**
   * Get word statistics
   * @returns Promise with word statistics
   */
  async getWordStats(): Promise<WordStats> {
    try {
      logger.debug("Fetching word statistics");

      const response = await apiClient.get<WordStats>(`${this.wordsUrl}/stats`);

      if (response.success && response.data) {
        logger.debug(
          "Word statistics fetched",
          { 
            totalWords: response.data.totalWords,
            averageLength: response.data.averageLength
          }
        );
        return response.data;
      }

      throw new Error(response.error || "Failed to fetch word statistics");
    } catch (error) {
      logger.error("Failed to fetch word statistics", error);
      throw this.handleError(error, "fetch word statistics");
    }
  }

  /**
   * Get user's word history
   * @param game - Game type
   * @param limit - Number of recent words
   * @returns Promise with user word history
   */
  async getUserWordHistory(game?: WordGameType, limit: number = 100): Promise<UserWordHistory> {
    try {
      logger.debug("Fetching user word history", { game, limit });

      const params = {
        ...(game && { game }),
        limit: Math.min(limit, 500)
      };

      const response = await apiClient.get<UserWordHistory>(
        `${this.wordsUrl}/history`,
        { params }
      );

      if (response.success && response.data) {
        logger.debug(
          "User word history fetched",
          { 
            game,
            totalWords: response.data.statistics.totalWords,
            correctGuesses: response.data.statistics.correctGuesses
          }
        );
        return response.data;
      }

      throw new Error(response.error || "Failed to fetch user word history");
    } catch (error) {
      logger.error("Failed to fetch user word history", error, { game, limit });
      throw this.handleError(error, "fetch user word history");
    }
  }

  /**
   * Generate words based on parameters
   * @param params - Word generation parameters
   * @returns Promise with generated words
   */
  async generateWords(params: WordGenerationParams): Promise<IWord[]> {
    try {
      logger.debug("Generating words", params);

      const response = await apiClient.post<IWord[]>(
        `${this.wordsUrl}/generate`,
        params
      );

      if (response.success && response.data) {
        logger.debug(
          "Words generated successfully",
          { 
            game: params.game,
            count: response.data.length,
            difficulty: params.targetDifficulty
          }
        );
        return response.data;
      }

      throw new Error(response.error || "Failed to generate words");
    } catch (error) {
      logger.error("Failed to generate words", error, params);
      throw this.handleError(error, "generate words");
    }
  }

  /**
   * Get word recommendations based on user performance
   * @param game - Game type
   * @param count - Number of recommendations
   * @returns Promise with word recommendations
   */
  async getWordRecommendations(game: WordGameType, count: number = 10): Promise<WordRecommendation[]> {
    try {
      logger.debug("Fetching word recommendations", { game, count });

      const params = { game, count: Math.min(count, 50) };

      const response = await apiClient.get<WordRecommendation[]>(
        `${this.wordsUrl}/recommendations`,
        { params }
      );

      if (response.success && response.data) {
        logger.debug(
          "Word recommendations fetched",
          { game, count: response.data.length }
        );
        return response.data;
      }

      throw new Error(response.error || "Failed to fetch word recommendations");
    } catch (error) {
      logger.error("Failed to fetch word recommendations", error, { game, count });
      throw this.handleError(error, "fetch word recommendations");
    }
  }

  /**
   * Get word analytics
   * @param wordId - Word ID
   * @returns Promise with word analytics
   */
  async getWordAnalytics(wordId: string): Promise<WordAnalytics> {
    try {
      logger.debug("Fetching word analytics", { wordId });

      const response = await apiClient.get<WordAnalytics>(
        `${this.wordsUrl}/${wordId}/analytics`
      );

      if (response.success && response.data) {
        logger.debug(
          "Word analytics fetched",
          { 
            wordId,
            word: response.data.word,
            successRate: response.data.usage.successRate
          }
        );
        return response.data;
      }

      throw new Error(response.error || "Failed to fetch word analytics");
    } catch (error) {
      logger.error("Failed to fetch word analytics", error, { wordId });
      throw this.handleError(error, "fetch word analytics");
    }
  }

  /**
   * Mark word as used for a user
   * @param wordId - Word ID
   * @param game - Game context
   * @param correct - Whether the word was guessed correctly
   * @param attempts - Number of attempts taken
   * @returns Promise with success status
   */
  async markWordUsed(
    wordId: string,
    game: WordGameType,
    correct: boolean,
    attempts: number = 1
  ): Promise<{ success: boolean; message?: string }> {
    try {
      logger.debug("Marking word as used", { wordId, game, correct, attempts });

      const response = await apiClient.post<{ success: boolean; message?: string }>(
        `${this.wordsUrl}/${wordId}/usage`,
        { game, correct, attempts }
      );

      if (response.success && response.data) {
        logger.debug("Word usage recorded", { wordId, game, correct });
        return response.data;
      }

      throw new Error(response.error || "Failed to mark word as used");
    } catch (error) {
      logger.error("Failed to mark word as used", error, { wordId, game, correct, attempts });
      throw this.handleError(error, "mark word as used");
    }
  }

  /**
   * Import words from external source
   * @param importData - Word import data
   * @returns Promise with import results
   */
  async importWords(importData: WordImportData): Promise<{ success: boolean; imported: number; errors: string[] }> {
    try {
      logger.info("Importing words", { count: importData.words.length, format: importData.format });

      const response = await apiClient.post<{ success: boolean; imported: number; errors: string[] }>(
        `${this.wordsUrl}/import`,
        importData
      );

      if (response.success && response.data) {
        logger.info(
          "Words imported successfully",
          { imported: response.data.imported, errors: response.data.errors.length }
        );
        return response.data;
      }

      throw new Error(response.error || "Failed to import words");
    } catch (error) {
      logger.error("Failed to import words", error, importData);
      throw this.handleError(error, "import words");
    }
  }

  /**
   * Export words with filters
   * @param filters - Export filters
   * @returns Promise with export data
   */
  async exportWords(filters: Partial<FetchWordsParams>): Promise<WordExportData> {
    try {
      logger.info("Exporting words", filters);

      const response = await apiClient.post<WordExportData>(
        `${this.wordsUrl}/export`,
        filters
      );

      if (response.success && response.data) {
        logger.info(
          "Words exported successfully",
          { count: response.data.totalCount, format: response.data.format }
        );
        return response.data;
      }

      throw new Error(response.error || "Failed to export words");
    } catch (error) {
      logger.error("Failed to export words", error, filters);
      throw this.handleError(error, "export words");
    }
  }

  /**
   * Clear word cache
   * @param pattern - Cache key pattern to clear (optional)
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
      logger.debug("Partial word cache cleared", { pattern });
    } else {
      this.cache.clear();
      logger.debug("Word cache completely cleared");
    }
  }

  /**
   * Get cache statistics
   * @returns Cache usage statistics
   */
  getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.cacheConfig.maxSize,
      hitRate: 0 // Would need to track hits/misses for actual implementation
    };
  }

  /**
   * Generate cache key
   * @private
   */
  private getCacheKey(method: string, params: any): string {
    return `word_${method}_${JSON.stringify(params)}`;
  }

  /**
   * Get data from cache
   * @private
   */
  private getFromCache<T>(key: string): T | null {
    if (!this.cacheConfig.enabled) return null;

    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    const age = now - cached.timestamp;
    const ttl = this.cacheConfig.ttl * 60 * 1000; // Convert to milliseconds

    if (age > ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set data in cache
   * @private
   */
  private setCache(key: string, data: any): void {
    if (!this.cacheConfig.enabled) return;

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.cacheConfig.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Handle and format errors
   * @private
   */
  private handleError(error: any, operation: string): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    const message = error?.message || `Failed to ${operation}`;
    const statusCode = error?.response?.status || error?.status || 500;

    return new ApiError(message, statusCode, error?.response?.data);
  }
}

// Export a singleton instance
export const wordApiClient = new WordApiClient();

// Export convenience function for backward compatibility
export async function fetchWords(game: WordGameType = "word-guess"): Promise<IWord[]> {
  return wordApiClient.fetchWords(game);
}