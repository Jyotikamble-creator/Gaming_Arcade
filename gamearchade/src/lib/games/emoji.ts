/**
 * Game logic and database operations for Emoji Guess Game
 */

import { v4 as uuidv4 } from 'uuid';
import EmojiGameSessionModel from '@/models/games/emoji';
import type {
  EmojiGameSession,
  EmojiPuzzle,
  DifficultyLevel,
  PuzzleCategory,
  ValidateAnswerResponse,
  EmojiGameStats,
  CategoryStats
} from '@/types/games/emoji';

/**
 * Create a new game session
 */
export async function createGameSession(
  puzzle: EmojiPuzzle,
  userId?: string,
  difficulty?: DifficultyLevel
): Promise<EmojiGameSession> {
  const session = await EmojiGameSessionModel.create({
    userId,
    sessionId: uuidv4(),
    currentPuzzle: puzzle,
    startTime: new Date(),
    attempts: [],
    score: 0,
    hintsUsed: 0,
    completed: false,
    difficulty: difficulty || puzzle.difficulty
  });

  return session.toObject();
}

/**
 * Get a game session by session ID
 */
export async function getGameSession(sessionId: string): Promise<EmojiGameSession | null> {
  const session = await EmojiGameSessionModel.findOne({ sessionId }).lean();
  return session;
}

/**
 * Validate user's answer
 */
export function validateAnswer(
  userAnswer: string,
  correctAnswer: string
): ValidateAnswerResponse {
  const normalizedUser = userAnswer.toLowerCase().trim();
  const normalizedCorrect = correctAnswer.toLowerCase().trim();

  // Exact match
  if (normalizedUser === normalizedCorrect) {
    return {
      correct: true,
      feedback: 'Perfect! You got it right!',
      score: 100,
      attempts: 1
    };
  }

  // Calculate similarity (simple approach)
  const similarity = calculateSimilarity(normalizedUser, normalizedCorrect);

  // Close enough (90% similarity)
  if (similarity >= 0.9) {
    return {
      correct: true,
      correctAnswer,
      similarity,
      feedback: 'Almost perfect! Close enough!',
      score: 90,
      attempts: 1
    };
  }

  // Partial match (contains key words)
  const userWords = normalizedUser.split(/\s+/);
  const correctWords = normalizedCorrect.split(/\s+/);
  const matchedWords = userWords.filter(word => correctWords.includes(word)).length;
  const matchPercentage = matchedWords / correctWords.length;

  if (matchPercentage >= 0.6) {
    return {
      correct: false,
      correctAnswer,
      similarity,
      feedback: 'You\'re on the right track! Try again.',
      score: 0,
      attempts: 1
    };
  }

  // Completely wrong
  return {
    correct: false,
    correctAnswer,
    similarity,
    feedback: 'Not quite. Keep trying!',
    score: 0,
    attempts: 1
  };
}

/**
 * Calculate string similarity (Levenshtein distance based)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Levenshtein distance algorithm
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Update game session with an attempt
 */
export async function updateSessionWithAttempt(
  sessionId: string,
  guess: string,
  correct: boolean,
  timeTaken: number,
  score: number
): Promise<EmojiGameSession | null> {
  const session = await EmojiGameSessionModel.findOneAndUpdate(
    { sessionId },
    {
      $push: {
        attempts: {
          guess,
          correct,
          timestamp: new Date(),
          timeTaken
        }
      },
      $inc: { score },
      ...(correct && { completed: true, endTime: new Date() })
    },
    { new: true }
  ).lean();

  return session;
}

/**
 * Get user's game statistics
 */
export async function getUserGameStats(userId: string): Promise<EmojiGameStats> {
  const sessions = await EmojiGameSessionModel.find({ userId, completed: true }).lean();

  if (sessions.length === 0) {
    return {
      totalPuzzlesSolved: 0,
      averageAttempts: 0,
      averageTimePerPuzzle: 0,
      accuracyRate: 0,
      favoriteCategory: 'Nature',
      difficultiesMastered: [],
      bestStreak: 0,
      currentStreak: 0
    };
  }

  const totalPuzzlesSolved = sessions.length;
  const totalAttempts = sessions.reduce((sum, s) => sum + s.attempts.length, 0);
  const averageAttempts = totalAttempts / totalPuzzlesSolved;

  const totalTime = sessions.reduce((sum, s) => {
    if (s.endTime) {
      return sum + (s.endTime.getTime() - s.startTime.getTime());
    }
    return sum;
  }, 0);
  const averageTimePerPuzzle = totalTime / totalPuzzlesSolved;

  const correctAttempts = sessions.reduce(
    (sum, s) => sum + s.attempts.filter(a => a.correct).length,
    0
  );
  const accuracyRate = (correctAttempts / totalAttempts) * 100;

  // Find favorite category
  const categoryCount: Record<string, number> = {};
  sessions.forEach(s => {
    categoryCount[s.currentPuzzle.category] = (categoryCount[s.currentPuzzle.category] || 0) + 1;
  });
  const favoriteCategory = Object.keys(categoryCount).reduce((a, b) =>
    categoryCount[a] > categoryCount[b] ? a : b
  ) as PuzzleCategory;

  // Find mastered difficulties
  const difficultySuccess: Record<DifficultyLevel, number> = { Easy: 0, Medium: 0, Hard: 0 };
  const difficultyTotal: Record<DifficultyLevel, number> = { Easy: 0, Medium: 0, Hard: 0 };
  sessions.forEach(s => {
    difficultyTotal[s.difficulty]++;
    if (s.score >= 80) difficultySuccess[s.difficulty]++;
  });
  const difficultiesMastered = (Object.keys(difficultySuccess) as DifficultyLevel[]).filter(
    diff => difficultySuccess[diff] / difficultyTotal[diff] >= 0.7
  );

  return {
    totalPuzzlesSolved,
    averageAttempts,
    averageTimePerPuzzle,
    accuracyRate,
    favoriteCategory,
    difficultiesMastered,
    bestStreak: 0, // TODO: Implement streak calculation
    currentStreak: 0
  };
}

/**
 * Get category statistics
 */
export async function getCategoryStats(): Promise<CategoryStats[]> {
  // This would typically aggregate from actual puzzle data
  // For now, returning empty array as placeholder
  return [];
}

/**
 * Delete old incomplete sessions (cleanup)
 */
export async function deleteOldIncompleteSessions(daysOld: number = 7): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await EmojiGameSessionModel.deleteMany({
    completed: false,
    createdAt: { $lt: cutoffDate }
  });

  return result.deletedCount;
}
