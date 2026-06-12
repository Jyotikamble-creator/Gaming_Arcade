// Score management API client for Next.js with TypeScript

import { apiClient, ApiResponse, ApiError } from "@/lib/api/client";
import { logger, LogTags } from "@/lib/logger";
import type {
  IScore,
  ScorePayload,
  SaveScoreRequest,
  SaveScoreResponse,
  FetchScoresParams,
  ScoresResponse,
  MyScoresParams,
  UserProgress,
  LeaderboardResponse,
  ScoreStats,
  ProgressComparison,
  ScoreValidationResult,
  BulkScoreOperation,
  BulkScoreResult,
  ScoreExportRequest,
  ScoreExportResponse,
  GameType,
  DifficultyLevel
} from "@/types/scores/scores";

/**
 * Score API Client for managing game scores and user progress
 */
export class ScoreApiClient {
  private readonly baseUrl = '/api/scores';
  private readonly progressUrl = '/api/progress';

  /**
   * Save a new score
   * @param payload - Score data to save
   * @returns Promise with saved score data and ranking information
   */
  async saveScore(payload: SaveScoreRequest): Promise<SaveScoreResponse> {
    try {
      logger.info("Saving score", payload, LogTags.SAVE_SCORE);

      // Validate payload before sending
      this.validateScorePayload(payload);

      const response = await apiClient.post<SaveScoreResponse>(
        this.baseUrl,
        payload
      );

      if (response.success && response.data) {
        logger.info(
          "Score saved successfully",
          { 
            scoreId: response.data.score._id,
            score: response.data.score.score,
            game: response.data.score.game,
            isPersonalBest: response.data.isPersonalBest,
            rank: response.data.rank
          },
          LogTags.SAVE_SCORE
        );
        return response.data;
      }

      throw new Error(response.error || "Failed to save score");
    } catch (error) {
      logger.error("Failed to save score", error, payload, LogTags.SAVE_SCORE);
      throw this.handleError(error, "save score");
    }
  }

  /**
   * Fetch scores with filtering and pagination
   * @param params - Query parameters for filtering scores
   * @returns Promise with scores list and pagination info
   */
  async fetchScores(params: FetchScoresParams = {}): Promise<ScoresResponse> {
    try {
      const { 
        game = "word-guess", 
        limit = 10,
        offset = 0,
        difficulty,
        timeRange = 'all',
        sortBy = 'score',
        sortOrder = 'desc'
      } = params;

      logger.debug("Fetching scores", { game, limit, offset, difficulty, timeRange }, LogTags.FETCH_SCORES);

      const queryParams = {
        game,
        limit: Math.min(limit, 100), // Cap at 100
        offset: Math.max(offset, 0),
        ...(difficulty && { difficulty }),
        timeRange,
        sortBy,
        sortOrder
      };

      const response = await apiClient.get<ScoresResponse>(
        this.baseUrl,
        { params: queryParams }
      );

      if (response.success && response.data) {
        logger.debug(
          "Scores fetched successfully",
          { 
            game, 
            count: response.data.scores.length,
            total: response.data.total,
            hasMore: response.data.hasMore
          },
          LogTags.FETCH_SCORES
        );
        return response.data;
      }

      throw new Error(response.error || "Failed to fetch scores");
    } catch (error) {
      logger.error(
        "Failed to fetch scores",
        error,
        params,
        LogTags.FETCH_SCORES
      );
      throw this.handleError(error, "fetch scores");
    }
  }

  /**
   * Fetch current user's scores
   * @param params - Query parameters for filtering user scores
   * @returns Promise with user's scores
   */
  async fetchMyScores(params: MyScoresParams = {}): Promise<ScoresResponse> {
    try {
      const { game, limit = 10, offset = 0, difficulty } = params;

      logger.debug("Fetching my scores", { game, limit, offset, difficulty }, LogTags.MY_SCORES);

      const queryParams = {
        ...(game && { game }),
        limit: Math.min(limit, 100),
        offset: Math.max(offset, 0),
        ...(difficulty && { difficulty })
      };

      const response = await apiClient.get<ScoresResponse>(
        `${this.baseUrl}/me`,
        { params: queryParams }
      );

      if (response.success && response.data) {
        logger.debug(
          "My scores fetched successfully",
          { 
            game, 
            count: response.data.scores.length,
            total: response.data.total
          },
          LogTags.MY_SCORES
        );
        return response.data;
      }

      throw new Error(response.error || "Failed to fetch user scores");
    } catch (error) {
      logger.error(
        "Failed to fetch my scores",
        error,
        params,
        LogTags.MY_SCORES
      );
      throw this.handleError(error, "fetch user scores");
    }
  }

  /**
   * Fetch user progress and statistics
   * @returns Promise with comprehensive user progress data
   */
  async fetchProgress(): Promise<UserProgress> {
    try {
      logger.debug("Fetching user progress", {}, LogTags.FETCH_PROGRESS);

      const response = await apiClient.get<UserProgress>(
        `${this.progressUrl}/me`
      );

      if (response.success && response.data) {
        logger.debug(
          "User progress fetched successfully",
          { 
            totalGames: response.data.totalGames,
            totalScore: response.data.totalScore,
            averageScore: response.data.averageScore,
            achievementsCount: response.data.achievements.length
          },
          LogTags.FETCH_PROGRESS
        );
        return response.data;
      }

      throw new Error(response.error || "Failed to fetch progress");
    } catch (error) {
      logger.error(
        "Failed to fetch user progress",
        error,
        {},
        LogTags.FETCH_PROGRESS
      );
      throw this.handleError(error, "fetch progress");
    }
  }

  /**
   * Fetch leaderboard for a specific game
   * @param game - Game type
   * @param timeRange - Time range for leaderboard
   * @param difficulty - Optional difficulty filter
   * @param limit - Number of entries to fetch
   * @returns Promise with leaderboard data
   */
  async fetchLeaderboard(
    game: GameType,
    timeRange: 'day' | 'week' | 'month' | 'all' = 'all',
    difficulty?: DifficultyLevel,
    limit: number = 10
  ): Promise<LeaderboardResponse> {
    try {
      logger.debug("Fetching leaderboard", { game, timeRange, difficulty, limit });

      const params = {
        game,
        timeRange,
        limit: Math.min(limit, 100),
        ...(difficulty && { difficulty })
      };

      const response = await apiClient.get<LeaderboardResponse>(
        `${this.baseUrl}/leaderboard`,
        { params }
      );

      if (response.success && response.data) {
        logger.debug(
          "Leaderboard fetched successfully",
          { game, entriesCount: response.data.entries.length }
        );
        return response.data;
      }

      throw new Error(response.error || "Failed to fetch leaderboard");
    } catch (error) {
      logger.error("Failed to fetch leaderboard", error, { game, timeRange });
      throw this.handleError(error, "fetch leaderboard");
    }
  }

  /**
   * Get score statistics for a game
   * @param game - Game type
   * @returns Promise with score statistics
   */
  async getScoreStats(game: GameType): Promise<ScoreStats> {
    try {
      logger.debug("Fetching score statistics", { game });

      const response = await apiClient.get<ScoreStats>(
        `${this.baseUrl}/stats/${game}`
      );

      if (response.success && response.data) {
        logger.debug("Score statistics fetched successfully", { game });
        return response.data;
      }

      throw new Error(response.error || "Failed to fetch score statistics");
    } catch (error) {
      logger.error("Failed to fetch score statistics", error, { game });
      throw this.handleError(error, "fetch score statistics");
    }
  }

  /**
   * Compare user progress with previous period
   * @param period - Comparison period
   * @returns Promise with progress comparison
   */
  async compareProgress(period: 'week' | 'month' | 'quarter' = 'week'): Promise<ProgressComparison> {
    try {
      logger.debug("Comparing user progress", { period });

      const response = await apiClient.get<ProgressComparison>(
        `${this.progressUrl}/compare`,
        { params: { period } }
      );

      if (response.success && response.data) {
        logger.debug("Progress comparison fetched successfully", { period });
        return response.data;
      }

      throw new Error(response.error || "Failed to compare progress");
    } catch (error) {
      logger.error("Failed to compare progress", error, { period });
      throw this.handleError(error, "compare progress");
    }
  }

  /**
   * Validate score before submission
   * @param payload - Score data to validate
   * @returns Promise with validation result
   */
  async validateScore(payload: ScorePayload): Promise<ScoreValidationResult> {
    try {
      logger.debug("Validating score", payload);

      const response = await apiClient.post<ScoreValidationResult>(
        `${this.baseUrl}/validate`,
        payload
      );

      if (response.success && response.data) {
        logger.debug(
          "Score validation completed",
          { valid: response.data.valid, errorsCount: response.data.errors.length }
        );
        return response.data;
      }

      throw new Error(response.error || "Failed to validate score");
    } catch (error) {
      logger.error("Failed to validate score", error, payload);
      throw this.handleError(error, "validate score");
    }
  }

  /**
   * Perform bulk score operations
   * @param operation - Bulk operation details
   * @returns Promise with bulk operation result
   */
  async bulkScoreOperation(operation: BulkScoreOperation): Promise<BulkScoreResult> {
    try {
      logger.info("Performing bulk score operation", {
        operation: operation.operation,
        count: operation.scores.length
      });

      const response = await apiClient.post<BulkScoreResult>(
        `${this.baseUrl}/bulk`,
        operation
      );

      if (response.success && response.data) {
        logger.info(
          "Bulk score operation completed",
          {
            processed: response.data.processed,
            failed: response.data.failed,
            success: response.data.success
          }
        );
        return response.data;
      }

      throw new Error(response.error || "Failed to perform bulk operation");
    } catch (error) {
      logger.error("Failed to perform bulk score operation", error, operation);
      throw this.handleError(error, "perform bulk operation");
    }
  }

  /**
   * Export user scores
   * @param request - Export request parameters
   * @returns Promise with export response
   */
  async exportScores(request: ScoreExportRequest): Promise<ScoreExportResponse> {
    try {
      logger.info("Exporting user scores", request);

      const response = await apiClient.post<ScoreExportResponse>(
        `${this.baseUrl}/export`,
        request
      );

      if (response.success && response.data) {
        logger.info(
          "Score export completed",
          { format: request.format, success: response.data.success }
        );
        return response.data;
      }

      throw new Error(response.error || "Failed to export scores");
    } catch (error) {
      logger.error("Failed to export scores", error, request);
      throw this.handleError(error, "export scores");
    }
  }

  /**
   * Delete a user's score
   * @param scoreId - ID of the score to delete
   * @returns Promise with deletion result
   */
  async deleteScore(scoreId: string): Promise<{ success: boolean; message?: string }> {
    try {
      logger.info("Deleting score", { scoreId });

      const response = await apiClient.delete<{ success: boolean; message?: string }>(
        `${this.baseUrl}/${scoreId}`
      );

      if (response.success && response.data) {
        logger.info("Score deleted successfully", { scoreId });
        return response.data;
      }

      throw new Error(response.error || "Failed to delete score");
    } catch (error) {
      logger.error("Failed to delete score", error, { scoreId });
      throw this.handleError(error, "delete score");
    }
  }

  /**
   * Get user's achievements
   * @returns Promise with user achievements
   */
  async getAchievements(): Promise<UserProgress['achievements']> {
    try {
      logger.debug("Fetching user achievements");

      const response = await apiClient.get<UserProgress['achievements']>(
        `${this.progressUrl}/achievements`
      );

      if (response.success && response.data) {
        logger.debug(
          "Achievements fetched successfully",
          { count: response.data.length }
        );
        return response.data;
      }

      throw new Error(response.error || "Failed to fetch achievements");
    } catch (error) {
      logger.error("Failed to fetch achievements", error);
      throw this.handleError(error, "fetch achievements");
    }
  }

  /**
   * Validate score payload
   * @private
   */
  private validateScorePayload(payload: SaveScoreRequest): void {
    if (!payload.game) {
      throw new Error("Game type is required");
    }
    if (typeof payload.score !== 'number' || payload.score < 0) {
      throw new Error("Valid score is required");
    }
    if (payload.accuracy && (payload.accuracy < 0 || payload.accuracy > 100)) {
      throw new Error("Accuracy must be between 0 and 100");
    }
    if (payload.duration && payload.duration < 0) {
      throw new Error("Duration must be positive");
    }
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
export const scoreApiClient = new ScoreApiClient();

// Export convenience functions for backward compatibility
export async function saveScore(payload: SaveScoreRequest): Promise<SaveScoreResponse> {
  return scoreApiClient.saveScore(payload);
}

export async function fetchScores(params?: FetchScoresParams): Promise<ScoresResponse> {
  return scoreApiClient.fetchScores(params);
}

export async function fetchMyScores(params?: MyScoresParams): Promise<ScoresResponse> {
  return scoreApiClient.fetchMyScores(params);
}

export async function fetchProgress(): Promise<UserProgress> {
  return scoreApiClient.fetchProgress();
}