/**
 * Game logic and database operations for Math Quiz Game
 */

import { v4 as uuidv4 } from 'uuid';
import MathQuizSessionModel from '@/models/games/math';
import type {
  MathQuizSession,
  MathQuestion,
  MathDifficultyLevel,
  QuizConfig,
  MathQuizStats,
  OperationStats,
  MathOperation
} from '@/types/games/math';

/**
 * Create a new math quiz session
 */
export async function createQuizSession(
  questions: MathQuestion[],
  config: QuizConfig,
  userId?: string
): Promise<MathQuizSession> {
  const session = await MathQuizSessionModel.create({
    userId,
    sessionId: uuidv4(),
    questions,
    answers: [],
    startTime: new Date(),
    score: 0,
    totalQuestions: questions.length,
    correctAnswers: 0,
    difficulty: config.difficulty,
    timeLimit: config.timeLimit,
    completed: false
  });

  return session.toObject();
}

/**
 * Get a quiz session by session ID
 */
export async function getQuizSession(sessionId: string): Promise<MathQuizSession | null> {
  const session = await MathQuizSessionModel.findOne({ sessionId }).lean();
  return session;
}

/**
 * Submit an answer to a quiz session
 */
export async function submitAnswer(
  sessionId: string,
  questionId: number,
  answer: string,
  timeTaken: number = 0
): Promise<{ correct: boolean; session: MathQuizSession | null }> {
  const session = await MathQuizSessionModel.findOne({ sessionId });
  
  if (!session) {
    return { correct: false, session: null };
  }

  if (session.completed) {
    return { correct: false, session: session.toObject() };
  }

  const correct = session.addAnswer(questionId, answer, timeTaken);
  await session.save();

  return { correct, session: session.toObject() };
}

/**
 * Submit multiple answers at once
 */
export async function submitMultipleAnswers(
  sessionId: string,
  answers: { questionId: number; answer: string; timeTaken?: number }[]
): Promise<MathQuizSession | null> {
  const session = await MathQuizSessionModel.findOne({ sessionId });
  
  if (!session || session.completed) {
    return session ? session.toObject() : null;
  }

  answers.forEach(({ questionId, answer, timeTaken = 0 }) => {
    session.addAnswer(questionId, answer, timeTaken);
  });

  await session.save();
  return session.toObject();
}

/**
 * Complete a quiz session
 */
export async function completeQuizSession(sessionId: string): Promise<MathQuizSession | null> {
  const session = await MathQuizSessionModel.findOneAndUpdate(
    { sessionId },
    {
      completed: true,
      endTime: new Date()
    },
    { new: true }
  );

  if (session) {
    session.score = session.calculateScore();
    await session.save();
  }

  return session ? session.toObject() : null;
}

/**
 * Get user's quiz statistics
 */
export async function getUserQuizStats(userId: string): Promise<MathQuizStats> {
  const sessions = await MathQuizSessionModel.find({ userId, completed: true }).lean();

  if (sessions.length === 0) {
    return {
      totalQuizzesTaken: 0,
      totalQuestionsAnswered: 0,
      correctAnswers: 0,
      accuracy: 0,
      averageScore: 0,
      averageTimePerQuestion: 0,
      bestScore: 0,
      favoriteOperation: '+',
      strengthsByOperation: { '+': 0, '-': 0, '*': 0, '/': 0 },
      difficultiesMastered: [],
      currentStreak: 0,
      bestStreak: 0
    };
  }

  const totalQuizzesTaken = sessions.length;
  const totalQuestionsAnswered = sessions.reduce((sum, s) => sum + s.totalQuestions, 0);
  const correctAnswers = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
  const accuracy = (correctAnswers / totalQuestionsAnswered) * 100;
  const averageScore = sessions.reduce((sum, s) => sum + s.score, 0) / totalQuizzesTaken;
  const bestScore = Math.max(...sessions.map(s => s.score));

  // Calculate average time per question
  const totalTime = sessions.reduce((sum, s) => {
    if (s.endTime) {
      return sum + (s.endTime.getTime() - s.startTime.getTime());
    }
    return sum;
  }, 0);
  const averageTimePerQuestion = totalTime / totalQuestionsAnswered;

  // Calculate strengths by operation
  const operationStats: Record<MathOperation, { correct: number; total: number }> = {
    '+': { correct: 0, total: 0 },
    '-': { correct: 0, total: 0 },
    '*': { correct: 0, total: 0 },
    '/': { correct: 0, total: 0 }
  };

  sessions.forEach(session => {
    session.answers.forEach(answer => {
      const question = session.questions.find(q => q.id === answer.questionId);
      if (question?.operation) {
        operationStats[question.operation].total += 1;
        if (answer.isCorrect) {
          operationStats[question.operation].correct += 1;
        }
      }
    });
  });

  const strengthsByOperation: Record<MathOperation, number> = {
    '+': operationStats['+'].total > 0 ? (operationStats['+'].correct / operationStats['+'].total) * 100 : 0,
    '-': operationStats['-'].total > 0 ? (operationStats['-'].correct / operationStats['-'].total) * 100 : 0,
    '*': operationStats['*'].total > 0 ? (operationStats['*'].correct / operationStats['*'].total) * 100 : 0,
    '/': operationStats['/'].total > 0 ? (operationStats['/'].correct / operationStats['/'].total) * 100 : 0
  };

  const favoriteOperation = (Object.keys(strengthsByOperation) as MathOperation[]).reduce((a, b) =>
    strengthsByOperation[a] > strengthsByOperation[b] ? a : b
  );

  // Calculate mastered difficulties
  const difficultyStats: Record<MathDifficultyLevel, { total: number; avgScore: number }> = {
    Easy: { total: 0, avgScore: 0 },
    Medium: { total: 0, avgScore: 0 },
    Hard: { total: 0, avgScore: 0 },
    Expert: { total: 0, avgScore: 0 }
  };

  sessions.forEach(session => {
    difficultyStats[session.difficulty].total += 1;
    difficultyStats[session.difficulty].avgScore += session.score;
  });

  const difficultiesMastered = (Object.keys(difficultyStats) as MathDifficultyLevel[]).filter(
    diff => {
      const stats = difficultyStats[diff];
      return stats.total > 0 && (stats.avgScore / stats.total) >= 70;
    }
  );

  return {
    totalQuizzesTaken,
    totalQuestionsAnswered,
    correctAnswers,
    accuracy,
    averageScore,
    averageTimePerQuestion,
    bestScore,
    favoriteOperation,
    strengthsByOperation,
    difficultiesMastered,
    currentStreak: 0, // TODO: Implement streak calculation
    bestStreak: 0
  };
}

/**
 * Get operation statistics
 */
export async function getOperationStats(userId: string): Promise<OperationStats[]> {
  const sessions = await MathQuizSessionModel.find({ userId, completed: true }).lean();

  const stats: Record<MathOperation, { total: number; correct: number; totalTime: number }> = {
    '+': { total: 0, correct: 0, totalTime: 0 },
    '-': { total: 0, correct: 0, totalTime: 0 },
    '*': { total: 0, correct: 0, totalTime: 0 },
    '/': { total: 0, correct: 0, totalTime: 0 }
  };

  sessions.forEach(session => {
    session.answers.forEach(answer => {
      const question = session.questions.find(q => q.id === answer.questionId);
      if (question?.operation) {
        stats[question.operation].total += 1;
        stats[question.operation].totalTime += answer.timeTaken;
        if (answer.isCorrect) {
          stats[question.operation].correct += 1;
        }
      }
    });
  });

  return (Object.keys(stats) as MathOperation[]).map(operation => ({
    operation,
    totalAttempts: stats[operation].total,
    correctAttempts: stats[operation].correct,
    accuracy: stats[operation].total > 0 
      ? (stats[operation].correct / stats[operation].total) * 100 
      : 0,
    averageTime: stats[operation].total > 0
      ? stats[operation].totalTime / stats[operation].total
      : 0
  }));
}

/**
 * Get recent quiz sessions
 */
export async function getRecentSessions(
  userId: string,
  limit: number = 10
): Promise<MathQuizSession[]> {
  const sessions = await MathQuizSessionModel
    .find({ userId, completed: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return sessions;
}

/**
 * Delete old incomplete sessions (cleanup)
 */
export async function deleteOldIncompleteSessions(daysOld: number = 7): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await MathQuizSessionModel.deleteMany({
    completed: false,
    createdAt: { $lt: cutoffDate }
  });

  return result.deletedCount;
}
