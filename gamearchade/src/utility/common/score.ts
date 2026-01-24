// Utility functions for scoring and leaderboard features
import { LeaderboardEntry } from '@/types/common/score';

/**
 * Calculate rank change between two leaderboard positions
 */
export function calculateRankChange(
  previousRank: number,
  currentRank: number
): { change: number; direction: 'up' | 'down' | 'same' } {
  const change = previousRank - currentRank;
  
  if (change > 0) return { change, direction: 'up' };
  if (change < 0) return { change: Math.abs(change), direction: 'down' };
  return { change: 0, direction: 'same' };
}

/**
 * Format score with commas for display
 */
export function formatScore(score: number): string {
  return score.toLocaleString();
}

/**
 * Calculate percentile rank
 */
export function calculatePercentile(
  score: number,
  allScores: number[]
): number {
  const sorted = [...allScores].sort((a, b) => a - b);
  const index = sorted.findIndex(s => s >= score);
  
  if (index === -1) return 100;
  
  return Math.round((index / sorted.length) * 100);
}

/**
 * Get medal emoji based on rank
 */
export function getMedalEmoji(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return '';
}

/**
 * Get rank badge color
 */
export function getRankBadgeColor(rank: number): string {
  if (rank === 1) return 'text-yellow-500';
  if (rank === 2) return 'text-gray-400';
  if (rank === 3) return 'text-amber-600';
  if (rank <= 10) return 'text-blue-500';
  return 'text-gray-500';
}

/**
 * Filter leaderboard by date range
 */
export function filterLeaderboardByDate(
  entries: LeaderboardEntry[],
  startDate?: Date,
  endDate?: Date
): LeaderboardEntry[] {
  return entries.filter(entry => {
    const entryDate = new Date(entry.createdAt);
    
    if (startDate && entryDate < startDate) return false;
    if (endDate && entryDate > endDate) return false;
    
    return true;
  });
}

/**
 * Group scores by game
 */
export function groupScoresByGame(
  entries: LeaderboardEntry[]
): Record<string, LeaderboardEntry[]> {
  return entries.reduce((acc, entry) => {
    if (!acc[entry.game]) {
      acc[entry.game] = [];
    }
    acc[entry.game].push(entry);
    return acc;
  }, {} as Record<string, LeaderboardEntry[]>);
}

/**
 * Calculate average score for a player
 */
export function calculateAverageScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return Math.round(sum / scores.length);
}

/**
 * Find player position in leaderboard
 */
export function findPlayerRank(
  leaderboard: LeaderboardEntry[],
  playerName: string
): number | null {
  const index = leaderboard.findIndex(
    entry => entry.playerName.toLowerCase() === playerName.toLowerCase()
  );
  
  return index === -1 ? null : index + 1;
}

/**
 * Get recent achievement status
 */
export function getAchievementStatus(score: number): {
  isNewHighScore: boolean;
  isTopTen: boolean;
  message: string;
} {
  // This would typically compare against stored user data
  // For now, return based on score thresholds
  const isNewHighScore = score >= 1000;
  const isTopTen = score >= 500;
  
  let message = 'Good job!';
  if (isNewHighScore) message = '🎉 New High Score!';
  else if (isTopTen) message = '⭐ Great Performance!';
  
  return { isNewHighScore, isTopTen, message };
}

/**
 * Sort leaderboard entries
 */
export function sortLeaderboard(
  entries: LeaderboardEntry[],
  sortBy: 'score' | 'date' = 'score',
  order: 'asc' | 'desc' = 'desc'
): LeaderboardEntry[] {
  return [...entries].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'score') {
      comparison = a.score - b.score;
    } else {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
}

/**
 * Generate leaderboard summary statistics
 */
export function generateLeaderboardSummary(entries: LeaderboardEntry[]): {
  totalPlayers: number;
  highestScore: number;
  lowestScore: number;
  averageScore: number;
  medianScore: number;
} {
  if (entries.length === 0) {
    return {
      totalPlayers: 0,
      highestScore: 0,
      lowestScore: 0,
      averageScore: 0,
      medianScore: 0,
    };
  }
  
  const scores = entries.map(e => e.score).sort((a, b) => a - b);
  const uniquePlayers = new Set(entries.map(e => e.playerName)).size;
  
  const sum = scores.reduce((acc, score) => acc + score, 0);
  const median = scores[Math.floor(scores.length / 2)];
  
  return {
    totalPlayers: uniquePlayers,
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores),
    averageScore: Math.round(sum / scores.length),
    medianScore: median,
  };
}

/**
 * Sanitize player name for display
 */
export function sanitizePlayerName(name: string): string {
  return name
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 50);
}

/**
 * Format time ago from date
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return new Date(date).toLocaleDateString();
}
