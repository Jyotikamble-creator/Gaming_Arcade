/**
 * Game logic and database operations for Emoji Guess Game
 */

import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/api/prisma';
import type {
  EmojiGameSession,
  EmojiPuzzle,
  DifficultyLevel,
  PuzzleCategory,
  ValidateAnswerResponse,
  EmojiGameStats,
  CategoryStats
} from '@/types/games/emoji';

function mapToSession(dbSession: any): EmojiGameSession {
  const state = JSON.parse(dbSession.state || '{}');
  return {
    _id: dbSession.id,
    userId: dbSession.userId || undefined,
    sessionId: dbSession.sessionId,
    currentPuzzle: state.currentPuzzle,
    startTime: dbSession.startedAt,
    endTime: dbSession.completedAt || undefined,
    attempts: state.attempts || [],
    score: dbSession.score,
    hintsUsed: state.hintsUsed || 0,
    completed: dbSession.completed,
    difficulty: (dbSession.difficulty || 'Easy') as DifficultyLevel,
    createdAt: dbSession.createdAt,
    updatedAt: dbSession.updatedAt
  };
}

/**
 * Create a new game session
 */
export async function createGameSession(
  puzzle: EmojiPuzzle,
  userId?: string,
  difficulty?: DifficultyLevel
): Promise<EmojiGameSession> {
  const session = await prisma.gameSession.create({
    data: {
      userId: userId || null,
      sessionId: uuidv4(),
      game: 'emoji',
      difficulty: difficulty || puzzle.difficulty,
      category: puzzle.category,
      state: JSON.stringify({
        currentPuzzle: puzzle,
        attempts: [],
        hintsUsed: 0
      }),
      startedAt: new Date(),
      completed: false,
      score: 0
    }
  });

  return mapToSession(session);
}

/**
 * Get a game session by session ID
 */
export async function getGameSession(sessionId: string): Promise<EmojiGameSession | null> {
  const session = await prisma.gameSession.findUnique({
    where: { sessionId }
  });
  if (!session) return null;
  return mapToSession(session);
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
      feedback: "You're on the right track! Try again.",
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
  const session = await prisma.gameSession.findUnique({
    where: { sessionId }
  });
  if (!session) return null;

  const state = JSON.parse(session.state || '{}');
  const attempts = state.attempts || [];
  attempts.push({
    guess,
    correct,
    timestamp: new Date(),
    timeTaken
  });
  state.attempts = attempts;

  const completed = correct ? true : session.completed;
  const completedAt = correct ? new Date() : session.completedAt;
  const newScore = session.score + score;

  const updatedSession = await prisma.gameSession.update({
    where: { sessionId },
    data: {
      state: JSON.stringify(state),
      completed,
      completedAt,
      score: newScore
    }
  });

  return mapToSession(updatedSession);
}

/**
 * Get user's game statistics
 */
export async function getUserGameStats(userId: string): Promise<EmojiGameStats> {
  const dbSessions = await prisma.gameSession.findMany({
    where: { userId, game: 'emoji', completed: true }
  });

  if (dbSessions.length === 0) {
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

  const sessions = dbSessions.map(mapToSession);
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
  const accuracyRate = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

  // Find favorite category
  const categoryCount: Record<string, number> = {};
  sessions.forEach(s => {
    if (s.currentPuzzle && s.currentPuzzle.category) {
      categoryCount[s.currentPuzzle.category] = (categoryCount[s.currentPuzzle.category] || 0) + 1;
    }
  });
  let favoriteCategory: PuzzleCategory = 'Nature';
  if (Object.keys(categoryCount).length > 0) {
    favoriteCategory = Object.keys(categoryCount).reduce((a, b) =>
      categoryCount[a] > categoryCount[b] ? a : b
    ) as PuzzleCategory;
  }

  // Find mastered difficulties
  const difficultySuccess: Record<DifficultyLevel, number> = { Easy: 0, Medium: 0, Hard: 0 };
  const difficultyTotal: Record<DifficultyLevel, number> = { Easy: 0, Medium: 0, Hard: 0 };
  sessions.forEach(s => {
    if (s.difficulty && difficultyTotal[s.difficulty] !== undefined) {
      difficultyTotal[s.difficulty]++;
      if (s.score >= 80) difficultySuccess[s.difficulty]++;
    }
  });
  const difficultiesMastered = (Object.keys(difficultySuccess) as DifficultyLevel[]).filter(
    diff => difficultyTotal[diff] > 0 && (difficultySuccess[diff] / difficultyTotal[diff] >= 0.7)
  );

  return {
    totalPuzzlesSolved,
    averageAttempts,
    averageTimePerPuzzle,
    accuracyRate,
    favoriteCategory,
    difficultiesMastered,
    bestStreak: 0,
    currentStreak: 0
  };
}

/**
 * Get category statistics
 */
export async function getCategoryStats(): Promise<CategoryStats[]> {
  return [];
}

/**
 * Delete old incomplete sessions (cleanup)
 */
export async function deleteOldIncompleteSessions(daysOld: number = 7): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await prisma.gameSession.deleteMany({
    where: {
      game: 'emoji',
      completed: false,
      createdAt: { lt: cutoffDate }
    }
  });

  return result.count;
}
