// Score management utility functions and helpers

import type {
  IScore,
  ScorePayload,
  GameType,
  DifficultyLevel,
  UserProgress,
  Achievement,
  ScoreValidationResult,
  LeaderboardEntry
} from "@/types/scores/scores";

/**
 * Score validation utilities
 */
export class ScoreValidator {
  /**
   * Validate a score payload
   */
  static validateScorePayload(payload: ScorePayload): ScoreValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field validation
    if (!payload.game) {
      errors.push("Game type is required");
    }

    if (typeof payload.score !== 'number') {
      errors.push("Score must be a number");
    } else if (payload.score < 0) {
      errors.push("Score cannot be negative");
    } else if (payload.score > 1000000) {
      warnings.push("Unusually high score detected");
    }

    // Optional field validation
    if (payload.level !== undefined) {
      if (typeof payload.level !== 'number' || payload.level < 1) {
        errors.push("Level must be a positive number");
      }
    }

    if (payload.accuracy !== undefined) {
      if (typeof payload.accuracy !== 'number' || payload.accuracy < 0 || payload.accuracy > 100) {
        errors.push("Accuracy must be between 0 and 100");
      }
    }

    if (payload.duration !== undefined) {
      if (typeof payload.duration !== 'number' || payload.duration < 0) {
        errors.push("Duration must be a positive number");
      } else if (payload.duration < 1000) {
        warnings.push("Very short game duration detected");
      } else if (payload.duration > 3600000) { // 1 hour
        warnings.push("Unusually long game duration detected");
      }
    }

    if (payload.attempts !== undefined) {
      if (typeof payload.attempts !== 'number' || payload.attempts < 1) {
        errors.push("Attempts must be a positive number");
      }
    }

    return {
      valid: errors.length === 0,
      score: payload.score,
      errors,
      warnings
    };
  }

  /**
   * Validate game-specific score ranges
   */
  static validateGameSpecificScore(game: GameType, score: number): boolean {
    const gameRanges: Record<GameType, { min: number; max: number }> = {
      'word-guess': { min: 0, max: 10000 },
      'word-scramble': { min: 0, max: 5000 },
      'word-builder': { min: 0, max: 8000 },
      'hangman': { min: 0, max: 3000 },
      'typing': { min: 0, max: 200 }, // WPM
      'quiz': { min: 0, max: 100 }, // Percentage
      'brain-teaser': { min: 0, max: 1000 },
      'coding-puzzle': { min: 0, max: 5000 },
      'emoji-guess': { min: 0, max: 2000 },
      'math-quiz': { min: 0, max: 100 },
      'memory-card': { min: 0, max: 10000 },
      'number-maze': { min: 0, max: 3000 },
      'reaction-time': { min: 0, max: 2000 }, // milliseconds (lower is better)
      'simon-says': { min: 0, max: 100 }, // rounds
      'sliding-puzzle': { min: 0, max: 10000 },
      'speed-math': { min: 0, max: 1000 },
      'sudoku': { min: 0, max: 5000 },
      'tower-stacker': { min: 0, max: 1000 },
      'whack-mole': { min: 0, max: 5000 },
      'game-2048': { min: 0, max: 100000 },
      'tic-tac-toe': { min: 0, max: 100 },
      'music-tiles': { min: 0, max: 10000 },
      'pixel-art-creator': { min: 0, max: 1000 }
    };

    const range = gameRanges[game];
    if (!range) return true; // Unknown game, allow any score

    return score >= range.min && score <= range.max;
  }
}

/**
 * Score formatting utilities
 */
export class ScoreFormatter {
  /**
   * Format score for display
   */
  static formatScore(score: number, game?: GameType): string {
    if (game === 'typing') {
      return `${score} WPM`;
    } else if (game === 'quiz' || game === 'math-quiz') {
      return `${score}%`;
    } else if (game === 'reaction-time') {
      return `${score}ms`;
    } else {
      return score.toLocaleString();
    }
  }

  /**
   * Format duration for display
   */
  static formatDuration(duration: number): string {
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    } else if (minutes > 0) {
      return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Format accuracy for display
   */
  static formatAccuracy(accuracy: number): string {
    return `${accuracy.toFixed(1)}%`;
  }

  /**
   * Get score color based on performance
   */
  static getScoreColor(score: number, game: GameType, userBest?: number): string {
    if (userBest && score >= userBest) {
      return 'text-green-500'; // Personal best
    }

    // Game-specific performance thresholds
    const thresholds = this.getPerformanceThresholds(game);
    
    if (score >= thresholds.excellent) {
      return 'text-purple-500'; // Excellent
    } else if (score >= thresholds.good) {
      return 'text-blue-500'; // Good
    } else if (score >= thresholds.average) {
      return 'text-yellow-500'; // Average
    } else {
      return 'text-gray-500'; // Below average
    }
  }

  /**
   * Get performance thresholds for a game
   */
  private static getPerformanceThresholds(game: GameType): { excellent: number; good: number; average: number } {
    const thresholds: Record<GameType, { excellent: number; good: number; average: number }> = {
      'word-guess': { excellent: 8000, good: 5000, average: 2000 },
      'word-scramble': { excellent: 4000, good: 2500, average: 1000 },
      'word-builder': { excellent: 6000, good: 4000, average: 1500 },
      'hangman': { excellent: 2500, good: 1500, average: 500 },
      'typing': { excellent: 80, good: 60, average: 40 },
      'quiz': { excellent: 90, good: 75, average: 60 },
      'brain-teaser': { excellent: 800, good: 500, average: 200 },
      'coding-puzzle': { excellent: 4000, good: 2500, average: 1000 },
      'emoji-guess': { excellent: 1500, good: 1000, average: 400 },
      'math-quiz': { excellent: 90, good: 75, average: 60 },
      'memory-card': { excellent: 8000, good: 5000, average: 2000 },
      'number-maze': { excellent: 2500, good: 1500, average: 500 },
      'reaction-time': { excellent: 300, good: 500, average: 800 }, // Lower is better
      'simon-says': { excellent: 20, good: 15, average: 10 },
      'sliding-puzzle': { excellent: 8000, good: 5000, average: 2000 },
      'speed-math': { excellent: 800, good: 500, average: 200 },
      'sudoku': { excellent: 4000, good: 2500, average: 1000 },
      'tower-stacker': { excellent: 800, good: 500, average: 200 },
      'whack-mole': { excellent: 4000, good: 2500, average: 1000 },
      'game-2048': { excellent: 50000, good: 20000, average: 5000 },
      'tic-tac-toe': { excellent: 90, good: 70, average: 50 },
      'music-tiles': { excellent: 8000, good: 5000, average: 2000 },
      'pixel-art-creator': { excellent: 800, good: 500, average: 200 }
    };

    return thresholds[game] || { excellent: 1000, good: 500, average: 100 };
  }
}

/**
 * Score calculation utilities
 */
export class ScoreCalculator {
  /**
   * Calculate score based on game performance
   */
  static calculateScore(params: {
    baseScore: number;
    accuracy?: number;
    duration?: number;
    attempts?: number;
    difficulty?: DifficultyLevel;
    level?: number;
  }): number {
    let { baseScore, accuracy, duration, attempts, difficulty, level } = params;
    let finalScore = baseScore;

    // Apply accuracy bonus
    if (accuracy !== undefined) {
      const accuracyMultiplier = 1 + (accuracy - 50) / 100; // 50% accuracy = 1x, 100% = 1.5x, 0% = 0.5x
      finalScore *= Math.max(accuracyMultiplier, 0.1);
    }

    // Apply time bonus (faster completion = higher score)
    if (duration !== undefined && duration > 0) {
      const timeBonus = Math.max(0, 1 - (duration / 300000)); // 5 minute baseline
      finalScore *= (1 + timeBonus * 0.2);
    }

    // Apply attempt penalty
    if (attempts !== undefined && attempts > 1) {
      const attemptPenalty = Math.min(0.5, (attempts - 1) * 0.1);
      finalScore *= (1 - attemptPenalty);
    }

    // Apply difficulty multiplier
    if (difficulty) {
      const difficultyMultipliers: Record<DifficultyLevel, number> = {
        easy: 1,
        medium: 1.25,
        hard: 1.5,
        expert: 2
      };
      finalScore *= difficultyMultipliers[difficulty];
    }

    // Apply level bonus
    if (level !== undefined && level > 1) {
      finalScore *= (1 + (level - 1) * 0.1);
    }

    return Math.round(Math.max(finalScore, 0));
  }

  /**
   * Calculate user ranking position
   */
  static calculateRanking(userScore: number, allScores: number[]): number {
    if (allScores.length === 0) return 1;
    
    const sortedScores = allScores.sort((a, b) => b - a);
    const rank = sortedScores.findIndex(score => userScore >= score) + 1;
    
    return rank || sortedScores.length + 1;
  }

  /**
   * Calculate percentile ranking
   */
  static calculatePercentile(userScore: number, allScores: number[]): number {
    if (allScores.length === 0) return 100;
    
    const lowerScores = allScores.filter(score => score < userScore).length;
    return Math.round((lowerScores / allScores.length) * 100);
  }
}

/**
 * Progress analysis utilities
 */
export class ProgressAnalyzer {
  /**
   * Analyze user improvement over time
   */
  static analyzeImprovement(scores: IScore[]): {
    trend: 'improving' | 'declining' | 'stable';
    improvement: number; // percentage
    consistency: number; // 0-100
  } {
    if (scores.length < 2) {
      return { trend: 'stable', improvement: 0, consistency: 0 };
    }

    const sortedScores = scores.sort((a, b) => 
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );

    // Calculate trend using linear regression
    const n = sortedScores.length;
    const sumX = (n * (n + 1)) / 2;
    const sumY = sortedScores.reduce((sum, score) => sum + score.score, 0);
    const sumXY = sortedScores.reduce((sum, score, index) => sum + (index + 1) * score.score, 0);
    const sumXX = (n * (n + 1) * (2 * n + 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const improvement = (slope / (sumY / n)) * 100;

    // Calculate consistency (lower variance = higher consistency)
    const average = sumY / n;
    const variance = sortedScores.reduce((sum, score) => 
      sum + Math.pow(score.score - average, 2), 0
    ) / n;
    const standardDeviation = Math.sqrt(variance);
    const consistencyScore = Math.max(0, 100 - (standardDeviation / average) * 100);

    let trend: 'improving' | 'declining' | 'stable';
    if (improvement > 5) {
      trend = 'improving';
    } else if (improvement < -5) {
      trend = 'declining';
    } else {
      trend = 'stable';
    }

    return {
      trend,
      improvement: Math.round(improvement),
      consistency: Math.round(consistencyScore)
    };
  }

  /**
   * Get improvement suggestions based on performance
   */
  static getImprovementSuggestions(
    userProgress: UserProgress,
    recentScores: IScore[]
  ): string[] {
    const suggestions: string[] = [];

    // Analyze recent performance
    const analysis = this.analyzeImprovement(recentScores);
    
    if (analysis.trend === 'declining') {
      suggestions.push("Take a break and come back refreshed");
      suggestions.push("Review your strategy and try different approaches");
    }

    if (analysis.consistency < 50) {
      suggestions.push("Focus on consistent performance rather than high scores");
      suggestions.push("Practice regularly to improve stability");
    }

    // Game-specific suggestions
    const gamesNeedingWork = Object.entries(userProgress.gamesPlayed)
      .filter(([_, count]) => count < 5)
      .map(([game, _]) => game);

    if (gamesNeedingWork.length > 0) {
      suggestions.push(`Try playing more: ${gamesNeedingWork.slice(0, 3).join(', ')}`);
    }

    // Achievement-based suggestions
    const totalAchievements = userProgress.achievements.length;
    if (totalAchievements < 10) {
      suggestions.push("Work on unlocking more achievements for rewards");
    }

    return suggestions;
  }

  /**
   * Calculate completion percentage for profile
   */
  static calculateProfileCompletion(progress: UserProgress): {
    percentage: number;
    missingElements: string[];
  } {
    const elements = [
      { key: 'totalGames', condition: progress.totalGames >= 10, label: 'Play 10 games' },
      { key: 'achievements', condition: progress.achievements.length >= 5, label: 'Unlock 5 achievements' },
      { key: 'gamesVariety', condition: Object.keys(progress.gamesPlayed).length >= 5, label: 'Try 5 different games' },
      { key: 'averageScore', condition: progress.averageScore >= 500, label: 'Achieve 500+ average score' },
      { key: 'currentStreak', condition: progress.stats.streaks.current >= 3, label: 'Maintain 3-day streak' }
    ];

    const completed = elements.filter(element => element.condition).length;
    const percentage = Math.round((completed / elements.length) * 100);
    const missingElements = elements
      .filter(element => !element.condition)
      .map(element => element.label);

    return { percentage, missingElements };
  }
}

/**
 * Leaderboard utilities
 */
export class LeaderboardUtils {
  /**
   * Sort leaderboard entries
   */
  static sortLeaderboard(
    entries: LeaderboardEntry[],
    sortBy: 'score' | 'accuracy' | 'duration' = 'score'
  ): LeaderboardEntry[] {
    return entries.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'accuracy':
          return (b.accuracy || 0) - (a.accuracy || 0);
        case 'duration':
          return (a.duration || Infinity) - (b.duration || Infinity);
        default:
          return b.score - a.score;
      }
    }).map((entry, index) => ({ ...entry, rank: index + 1 }));
  }

  /**
   * Filter leaderboard by time range
   */
  static filterByTimeRange(
    entries: LeaderboardEntry[],
    timeRange: 'day' | 'week' | 'month' | 'all'
  ): LeaderboardEntry[] {
    if (timeRange === 'all') return entries;

    const now = new Date();
    const cutoffTime = new Date();

    switch (timeRange) {
      case 'day':
        cutoffTime.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoffTime.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffTime.setMonth(now.getMonth() - 1);
        break;
    }

    return entries.filter(entry => 
      new Date(entry.completedAt) >= cutoffTime
    );
  }

  /**
   * Find user position in leaderboard
   */
  static findUserPosition(entries: LeaderboardEntry[], userId: string): number {
    const position = entries.findIndex(entry => entry.userId === userId);
    return position >= 0 ? position + 1 : -1;
  }
}

/**
 * Export all utilities as a combined object
 */
export const ScoreUtils = {
  Validator: ScoreValidator,
  Formatter: ScoreFormatter,
  Calculator: ScoreCalculator,
  Analyzer: ProgressAnalyzer,
  Leaderboard: LeaderboardUtils
};