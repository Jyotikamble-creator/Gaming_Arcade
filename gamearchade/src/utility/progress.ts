/**
 * Utility functions for User Progress
 */

import type {
  GameType,
  Achievement,
  CategoryStats,
  UserLeaderboardPosition,
  TimePeriod
} from '@/types/progress';

/**
 * Game categories mapping
 */
export const GAME_CATEGORIES: Record<GameType, 'word' | 'math' | 'logic' | 'memory' | 'speed' | 'strategy'> = {
  'word-guess': 'word',
  'word-scramble': 'word',
  'word-builder': 'word',
  'hangman': 'word',
  'brain-teaser': 'logic',
  'coding-puzzle': 'logic',
  'sudoku': 'logic',
  'quiz': 'logic',
  'emoji-guess': 'logic',
  'math-quiz': 'math',
  'speed-math': 'math',
  'number-maze': 'math',
  'memory-card': 'memory',
  'simon-says': 'memory',
  'reaction-time': 'speed',
  'typing-test': 'speed',
  'whack-a-mole': 'speed',
  'sliding-puzzle': 'strategy',
  'tower-stacker': 'strategy',
  'tic-tac-toe': 'strategy',
  '2048': 'strategy',
  'pixel-art': 'strategy'
};

/**
 * Game display names
 */
export const GAME_NAMES: Record<GameType, string> = {
  'word-guess': 'Word Guess',
  'word-scramble': 'Word Scramble',
  'word-builder': 'Word Builder',
  'hangman': 'Hangman',
  'brain-teaser': 'Brain Teaser',
  'coding-puzzle': 'Coding Puzzle',
  'sudoku': 'Sudoku',
  'quiz': 'Quiz',
  'emoji-guess': 'Emoji Guess',
  'math-quiz': 'Math Quiz',
  'speed-math': 'Speed Math',
  'number-maze': 'Number Maze',
  'memory-card': 'Memory Card',
  'simon-says': 'Simon Says',
  'reaction-time': 'Reaction Time',
  'typing-test': 'Typing Test',
  'whack-a-mole': 'Whack-a-Mole',
  'sliding-puzzle': 'Sliding Puzzle',
  'tower-stacker': 'Tower Stacker',
  'tic-tac-toe': 'Tic-Tac-Toe',
  '2048': '2048',
  'pixel-art': 'Pixel Art'
};

/**
 * Game icons/emojis
 */
export const GAME_ICONS: Record<GameType, string> = {
  'word-guess': '📝',
  'word-scramble': '🔤',
  'word-builder': '🏗️',
  'hangman': '🎯',
  'brain-teaser': '🧠',
  'coding-puzzle': '💻',
  'sudoku': '🔢',
  'quiz': '❓',
  'emoji-guess': '😀',
  'math-quiz': '➕',
  'speed-math': '⚡',
  'number-maze': '🔢',
  'memory-card': '🃏',
  'simon-says': '🎵',
  'reaction-time': '⏱️',
  'typing-test': '⌨️',
  'whack-a-mole': '🔨',
  'sliding-puzzle': '🧩',
  'tower-stacker': '🏗️',
  'tic-tac-toe': '❌',
  '2048': '🎮',
  'pixel-art': '🎨'
};

/**
 * Predefined achievements
 */
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-game',
    name: 'First Steps',
    description: 'Play your first game',
    icon: '🎮',
    maxProgress: 1,
    category: 'games'
  },
  {
    id: 'play-10',
    name: 'Getting Started',
    description: 'Play 10 games',
    icon: '🎯',
    maxProgress: 10,
    category: 'games'
  },
  {
    id: 'play-50',
    name: 'Dedicated Player',
    description: 'Play 50 games',
    icon: '🏆',
    maxProgress: 50,
    category: 'games'
  },
  {
    id: 'play-100',
    name: 'Century Club',
    description: 'Play 100 games',
    icon: '💯',
    maxProgress: 100,
    category: 'games'
  },
  {
    id: 'score-1000',
    name: 'Score Master',
    description: 'Reach a score of 1000 in any game',
    icon: '⭐',
    maxProgress: 1000,
    category: 'scores'
  },
  {
    id: 'score-5000',
    name: 'High Scorer',
    description: 'Reach a score of 5000 in any game',
    icon: '🌟',
    maxProgress: 5000,
    category: 'scores'
  },
  {
    id: 'streak-3',
    name: 'On a Roll',
    description: 'Play for 3 days in a row',
    icon: '🔥',
    maxProgress: 3,
    category: 'streaks'
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Play for 7 days in a row',
    icon: '🔥🔥',
    maxProgress: 7,
    category: 'streaks'
  },
  {
    id: 'streak-30',
    name: 'Monthly Master',
    description: 'Play for 30 days in a row',
    icon: '🔥🔥🔥',
    maxProgress: 30,
    category: 'streaks'
  },
  {
    id: 'all-games',
    name: 'Game Explorer',
    description: 'Play all available games',
    icon: '🗺️',
    maxProgress: 22,
    category: 'games'
  }
];

/**
 * Check unlocked achievements based on user progress
 */
export function checkAchievements(
  totalGames: number,
  bestScores: Record<string, number>,
  currentStreak: number,
  gamesPlayed: Record<string, number>
): Achievement[] {
  const unlockedAchievements: Achievement[] = [];

  ACHIEVEMENTS.forEach(achievement => {
    let unlocked = false;
    let progress = 0;

    switch (achievement.id) {
      case 'first-game':
        progress = totalGames >= 1 ? 1 : 0;
        unlocked = totalGames >= 1;
        break;
      case 'play-10':
        progress = Math.min(totalGames, 10);
        unlocked = totalGames >= 10;
        break;
      case 'play-50':
        progress = Math.min(totalGames, 50);
        unlocked = totalGames >= 50;
        break;
      case 'play-100':
        progress = Math.min(totalGames, 100);
        unlocked = totalGames >= 100;
        break;
      case 'score-1000':
        const maxScore = Math.max(...Object.values(bestScores), 0);
        progress = Math.min(maxScore, 1000);
        unlocked = maxScore >= 1000;
        break;
      case 'score-5000':
        const maxScore5k = Math.max(...Object.values(bestScores), 0);
        progress = Math.min(maxScore5k, 5000);
        unlocked = maxScore5k >= 5000;
        break;
      case 'streak-3':
        progress = Math.min(currentStreak, 3);
        unlocked = currentStreak >= 3;
        break;
      case 'streak-7':
        progress = Math.min(currentStreak, 7);
        unlocked = currentStreak >= 7;
        break;
      case 'streak-30':
        progress = Math.min(currentStreak, 30);
        unlocked = currentStreak >= 30;
        break;
      case 'all-games':
        progress = Object.keys(gamesPlayed).length;
        unlocked = Object.keys(gamesPlayed).length >= 22;
        break;
    }

    if (unlocked) {
      unlockedAchievements.push({
        ...achievement,
        progress,
        unlockedAt: new Date()
      });
    } else {
      unlockedAchievements.push({
        ...achievement,
        progress
      });
    }
  });

  return unlockedAchievements;
}

/**
 * Format time period to readable string
 */
export function formatTimePeriod(period: TimePeriod): string {
  switch (period) {
    case 'day': return 'Today';
    case 'week': return 'This Week';
    case 'month': return 'This Month';
    case 'year': return 'This Year';
    case 'all': return 'All Time';
    default: return 'Unknown';
  }
}

/**
 * Get game category
 */
export function getGameCategory(game: GameType): string {
  return GAME_CATEGORIES[game] || 'strategy';
}

/**
 * Get game display name
 */
export function getGameName(game: GameType): string {
  return GAME_NAMES[game] || game;
}

/**
 * Get game icon
 */
export function getGameIcon(game: GameType): string {
  return GAME_ICONS[game] || '🎮';
}

/**
 * Calculate percentile rank
 */
export function calculatePercentile(userScore: number, allScores: number[]): number {
  if (allScores.length === 0) return 100;
  
  const lowerScores = allScores.filter(s => s < userScore).length;
  return Math.round((lowerScores / allScores.length) * 100);
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format date to relative time
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

/**
 * Calculate improvement trend
 */
export function calculateTrend(
  currentAverage: number,
  previousAverage: number
): 'improving' | 'stable' | 'declining' {
  const difference = currentAverage - previousAverage;
  const percentChange = (difference / previousAverage) * 100;

  if (percentChange > 5) return 'improving';
  if (percentChange < -5) return 'declining';
  return 'stable';
}

/**
 * Get trend emoji
 */
export function getTrendEmoji(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving': return '📈';
    case 'declining': return '📉';
    case 'stable': return '➡️';
  }
}

/**
 * Get rank badge color
 */
export function getRankBadgeColor(level: number): string {
  if (level >= 50) return 'text-purple-600';
  if (level >= 40) return 'text-red-600';
  if (level >= 30) return 'text-orange-600';
  if (level >= 20) return 'text-yellow-600';
  if (level >= 10) return 'text-blue-600';
  return 'text-green-600';
}

/**
 * Get streak emoji
 */
export function getStreakEmoji(streak: number): string {
  if (streak >= 30) return '🔥🔥🔥';
  if (streak >= 7) return '🔥🔥';
  if (streak >= 3) return '🔥';
  return '✨';
}

/**
 * Sanitize game name for use as identifier
 */
export function sanitizeGameName(gameName: string): GameType {
  return gameName.toLowerCase().replace(/\s+/g, '-') as GameType;
}

/**
 * Group games by category
 */
export function groupGamesByCategory(
  gamesPlayed: Record<string, number>
): Record<string, string[]> {
  const grouped: Record<string, string[]> = {
    word: [],
    math: [],
    logic: [],
    memory: [],
    speed: [],
    strategy: []
  };

  Object.keys(gamesPlayed).forEach(game => {
    const category = getGameCategory(game as GameType);
    grouped[category].push(game);
  });

  return grouped;
}
