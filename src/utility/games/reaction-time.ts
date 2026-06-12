/**
 * Utility functions for Reaction Time Game
 */

import type {
  ReactionBenchmark,
  ReactionPerformance,
  ScoreBreakdown,
  ReactionDifficulty,
  DifficultyInfo
} from '@/types/games/reaction-time';

/**
 * Reaction time benchmarks (in milliseconds)
 */
export const REACTION_BENCHMARKS: Record<ReactionPerformance, ReactionBenchmark> = {
  elite: {
    max: 200,
    label: 'Elite',
    color: 'yellow',
    description: 'Professional athlete level reflexes'
  },
  excellent: {
    max: 250,
    label: 'Excellent',
    color: 'green',
    description: 'Outstanding reaction time'
  },
  good: {
    max: 300,
    label: 'Good',
    color: 'blue',
    description: 'Above average performance'
  },
  average: {
    max: 350,
    label: 'Average',
    color: 'purple',
    description: 'Typical human reaction time'
  },
  belowAverage: {
    max: 400,
    label: 'Below Average',
    color: 'orange',
    description: 'Room for improvement'
  },
  slow: {
    max: Infinity,
    label: 'Needs Practice',
    color: 'red',
    description: 'Keep practicing to improve'
  }
};

/**
 * Difficulty configurations
 */
export const DIFFICULTY_CONFIGS: Record<ReactionDifficulty, DifficultyInfo> = {
  easy: {
    name: 'Easy',
    description: 'Predictable timing with longer delays',
    minDelay: 2000,
    maxDelay: 4000,
    multiplier: 1.0
  },
  medium: {
    name: 'Medium',
    description: 'Standard reaction test timing',
    minDelay: 1000,
    maxDelay: 3000,
    multiplier: 1.25
  },
  hard: {
    name: 'Hard',
    description: 'Quick reactions required',
    minDelay: 500,
    maxDelay: 2000,
    multiplier: 1.5
  },
  extreme: {
    name: 'Extreme',
    description: 'Lightning-fast reflexes needed',
    minDelay: 200,
    maxDelay: 1000,
    multiplier: 2.0
  }
};

/**
 * Calculate score from reaction times
 */
export function calculateScore(
  averageTime: number,
  bestTime: number,
  allTimes: number[],
  difficulty: ReactionDifficulty = 'medium',
  falseStarts: number = 0
): { score: number; breakdown: ScoreBreakdown } {
  // Base score: 500 for 200ms average, decreasing as average increases
  const baseScore = Math.max(0, Math.round(500 - (averageTime - 200) * 0.5));

  // Consistency bonus (lower variance = higher bonus)
  const variance = Math.max(...allTimes) - Math.min(...allTimes);
  const consistencyBonus = Math.max(0, Math.round((1 - variance / averageTime) * 50));

  // Best time bonus
  let bestTimeBonus = 0;
  if (bestTime < 200) bestTimeBonus = 50;
  else if (bestTime < 250) bestTimeBonus = 25;
  else if (bestTime < 300) bestTimeBonus = 10;

  // Difficulty multiplier
  const difficultyMultiplier = DIFFICULTY_CONFIGS[difficulty].multiplier;

  // False start penalty (10 points per false start)
  const penaltyDeduction = falseStarts * 10;

  // Calculate total score
  const totalScore = Math.max(0, Math.round((baseScore + consistencyBonus + bestTimeBonus) * difficultyMultiplier - penaltyDeduction));

  return {
    score: totalScore,
    breakdown: {
      baseScore,
      consistencyBonus,
      bestTimeBonus,
      difficultyMultiplier,
      penaltyDeduction,
      totalScore
    }
  };
}

/**
 * Get performance category based on average time
 */
export function getPerformanceCategory(averageTime: number): ReactionPerformance {
  if (averageTime <= 200) return 'elite';
  if (averageTime <= 250) return 'excellent';
  if (averageTime <= 300) return 'good';
  if (averageTime <= 350) return 'average';
  if (averageTime <= 400) return 'belowAverage';
  return 'slow';
}

/**
 * Get performance message
 */
export function getPerformanceMessage(performance: ReactionPerformance): string {
  const messages: Record<ReactionPerformance, string> = {
    elite: '⚡ Elite! You have lightning-fast reflexes!',
    excellent: '🌟 Excellent! Outstanding reaction time!',
    good: '👍 Good! Above average performance!',
    average: '✅ Average! Typical human reaction time.',
    belowAverage: '📈 Below Average. Keep practicing to improve!',
    slow: '🎯 Needs Practice. Try to react faster!'
  };

  return messages[performance];
}

/**
 * Validate reaction time (detect if too fast/suspicious)
 */
export function validateReactionTime(reactionTime: number): { valid: boolean; reason?: string } {
  // Too fast (likely cheating or accidental click before stimulus)
  if (reactionTime < 100) {
    return { valid: false, reason: 'Too fast - clicked before stimulus appeared' };
  }

  // Unreasonably slow
  if (reactionTime > 5000) {
    return { valid: false, reason: 'Too slow - likely distracted' };
  }

  return { valid: true };
}

/**
 * Calculate percentile rank
 */
export function calculatePercentile(userTime: number, allTimes: number[]): number {
  if (allTimes.length === 0) return 100;
  
  const betterTimes = allTimes.filter(t => t < userTime).length;
  return Math.round((betterTimes / allTimes.length) * 100);
}

/**
 * Get benchmark for specific time
 */
export function getBenchmark(time: number): ReactionBenchmark {
  const performance = getPerformanceCategory(time);
  return REACTION_BENCHMARKS[performance];
}

/**
 * Get difficulty info
 */
export function getDifficultyInfo(difficulty: ReactionDifficulty): DifficultyInfo {
  return DIFFICULTY_CONFIGS[difficulty];
}

/**
 * Generate random delay within difficulty range
 */
export function generateDelay(difficulty: ReactionDifficulty): number {
  const config = DIFFICULTY_CONFIGS[difficulty];
  return Math.floor(Math.random() * (config.maxDelay - config.minDelay + 1)) + config.minDelay;
}

/**
 * Calculate consistency score (0-100, higher is better)
 */
export function calculateConsistencyScore(times: number[]): number {
  if (times.length === 0) return 0;
  
  const avg = times.reduce((sum, t) => sum + t, 0) / times.length;
  const variance = Math.max(...times) - Math.min(...times);
  
  // Perfect consistency = 100, decreases as variance increases
  return Math.max(0, Math.round(100 - (variance / avg) * 100));
}

/**
 * Get color for performance
 */
export function getPerformanceColor(performance: ReactionPerformance): string {
  return REACTION_BENCHMARKS[performance].color;
}

/**
 * Format time for display
 */
export function formatTime(milliseconds: number): string {
  return `${milliseconds}ms`;
}

/**
 * Get improvement message
 */
export function getImprovementMessage(improvementRate: number): string {
  if (improvementRate > 20) return '🚀 Amazing improvement! Keep it up!';
  if (improvementRate > 10) return '📈 Great progress! You\'re getting faster!';
  if (improvementRate > 5) return '👍 Steady improvement! Nice work!';
  if (improvementRate > 0) return '✨ Slight improvement. Keep practicing!';
  if (improvementRate === 0) return '➡️ Consistent performance.';
  return '📊 Focus on improving your reaction time.';
}

/**
 * Get tips based on performance
 */
export function getPerformanceTips(performance: ReactionPerformance): string[] {
  const tips: Record<ReactionPerformance, string[]> = {
    elite: [
      'Maintain your exceptional reflexes with regular practice',
      'Try harder difficulty levels for more challenge',
      'Focus on consistency to maximize your score'
    ],
    excellent: [
      'Great job! Try to reach elite level',
      'Work on consistency between attempts',
      'Practice daily to maintain your speed'
    ],
    good: [
      'Focus on the center of the screen',
      'Stay relaxed but ready',
      'Try to anticipate without guessing'
    ],
    average: [
      'Eliminate distractions during the test',
      'Stay focused on the stimulus area',
      'Practice regularly to improve'
    ],
    belowAverage: [
      'Make sure you\'re well-rested',
      'Position your hand comfortably',
      'Focus intently on the target area',
      'Practice daily for improvement'
    ],
    slow: [
      'Ensure good lighting conditions',
      'Minimize distractions',
      'Practice focus and concentration',
      'Try caffeine for improved alertness',
      'Consider time of day - most alert in morning'
    ]
  };

  return tips[performance];
}

/**
 * Analyze session performance
 */
export function analyzePerformance(
  averageTime: number,
  bestTime: number,
  worstTime: number,
  consistency: number
): {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
} {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  // Analyze average time
  if (averageTime <= 250) {
    strengths.push('Excellent average reaction time');
  } else if (averageTime > 350) {
    weaknesses.push('Slow average reaction time');
    recommendations.push('Practice more to improve overall speed');
  }

  // Analyze best time
  if (bestTime < 200) {
    strengths.push('Outstanding peak performance');
  }

  // Analyze consistency
  const consistencyScore = calculateConsistencyScore([bestTime, worstTime]);
  if (consistencyScore > 80) {
    strengths.push('Very consistent performance');
  } else if (consistencyScore < 50) {
    weaknesses.push('Inconsistent reaction times');
    recommendations.push('Focus on maintaining steady performance');
  }

  // Analyze variance
  if (consistency > averageTime * 0.5) {
    weaknesses.push('Large variance between attempts');
    recommendations.push('Work on concentration and focus');
  }

  if (strengths.length === 0) {
    strengths.push('Room for improvement in all areas');
  }

  if (recommendations.length === 0) {
    recommendations.push('Keep practicing to maintain your performance');
  }

  return { strengths, weaknesses, recommendations };
}
