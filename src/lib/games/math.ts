/**
 * Game logic and database operations for Math Quiz Game
 */

import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/api/prisma';
import type {
  MathQuizSession,
  MathQuestion,
  MathDifficultyLevel,
  QuizConfig,
  MathQuizStats,
  OperationStats,
  MathOperation,
  UserAnswer
} from '@/types/games/math';

function mapToSession(dbSession: any): MathQuizSession {
  const state = JSON.parse(dbSession.state || '{}');
  let timeLimit: number | undefined;
  try {
    const meta = JSON.parse(dbSession.meta || '{}');
    if (typeof meta.timeLimit === 'number') {
      timeLimit = meta.timeLimit;
    }
  } catch (e) {}

  const questions = state.questions || [];
  const answers = state.answers || [];

  return {
    _id: dbSession.id,
    userId: dbSession.userId || undefined,
    sessionId: dbSession.sessionId,
    questions,
    answers,
    startTime: dbSession.startedAt,
    endTime: dbSession.completedAt || undefined,
    score: dbSession.score,
    totalQuestions: questions.length,
    correctAnswers: answers.filter((a: any) => a.isCorrect).length,
    difficulty: (dbSession.difficulty || 'Easy') as MathDifficultyLevel,
    timeLimit,
    completed: dbSession.completed,
    createdAt: dbSession.createdAt,
    updatedAt: dbSession.updatedAt
  };
}

function addAnswerToSession(
  state: any,
  questionId: number,
  answer: string,
  timeTaken: number
): boolean {
  const questions: MathQuestion[] = state.questions || [];
  const answers: UserAnswer[] = state.answers || [];

  const question = questions.find(q => q.id === questionId);
  if (!question) return false;

  const correctAnswer = question.ans;
  const isCorrect = answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

  // Remove existing answer for this question if any
  const existingIndex = answers.findIndex(a => a.questionId === questionId);
  if (existingIndex !== -1) {
    answers.splice(existingIndex, 1);
  }

  answers.push({
    questionId,
    userAnswer: answer,
    correctAnswer,
    isCorrect,
    timeTaken,
    timestamp: new Date()
  });

  state.answers = answers;
  return isCorrect;
}

function calculateScore(state: any, difficulty: MathDifficultyLevel): number {
  const answers: UserAnswer[] = state.answers || [];
  const correctCount = answers.filter(a => a.isCorrect).length;
  
  // BaseScore
  const baseScore = correctCount * 100;
  
  // Time bonus
  let timeBonus = 0;
  const correctAnswers = answers.filter(a => a.isCorrect);
  if (correctAnswers.length > 0) {
    const avgTime = correctAnswers.reduce((sum, a) => sum + a.timeTaken, 0) / correctAnswers.length;
    const avgTimeSeconds = avgTime / 1000;
    if (avgTimeSeconds < 5) {
      timeBonus = Math.round(correctAnswers.length * (5 - avgTimeSeconds) * 20);
    }
  }

  let multiplier = 1;
  if (difficulty === 'Medium') multiplier = 1.5;
  else if (difficulty === 'Hard') multiplier = 2;
  else if (difficulty === 'Expert') multiplier = 2.5;

  return Math.round((baseScore + timeBonus) * multiplier);
}

/**
 * Create a new math quiz session
 */
export async function createQuizSession(
  questions: MathQuestion[],
  config: QuizConfig,
  userId?: string
): Promise<MathQuizSession> {
  const session = await prisma.gameSession.create({
    data: {
      userId: userId || null,
      sessionId: uuidv4(),
      game: 'math',
      difficulty: config.difficulty,
      state: JSON.stringify({
        questions,
        answers: []
      }),
      meta: JSON.stringify({ timeLimit: config.timeLimit }),
      startedAt: new Date(),
      completed: false,
      score: 0
    }
  });

  return mapToSession(session);
}

/**
 * Get a quiz session by session ID
 */
export async function getQuizSession(sessionId: string): Promise<MathQuizSession | null> {
  const session = await prisma.gameSession.findUnique({
    where: { sessionId }
  });
  if (!session) return null;
  return mapToSession(session);
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
  const session = await prisma.gameSession.findUnique({
    where: { sessionId }
  });
  
  if (!session) {
    return { correct: false, session: null };
  }

  if (session.completed) {
    return { correct: false, session: mapToSession(session) };
  }

  const state = JSON.parse(session.state || '{}');
  const correct = addAnswerToSession(state, questionId, answer, timeTaken);

  const updatedSession = await prisma.gameSession.update({
    where: { sessionId },
    data: {
      state: JSON.stringify(state)
    }
  });

  return { correct, session: mapToSession(updatedSession) };
}

/**
 * Submit multiple answers at once
 */
export async function submitMultipleAnswers(
  sessionId: string,
  answers: { questionId: number; answer: string; timeTaken?: number }[]
): Promise<MathQuizSession | null> {
  const session = await prisma.gameSession.findUnique({
    where: { sessionId }
  });
  
  if (!session || session.completed) {
    return session ? mapToSession(session) : null;
  }

  const state = JSON.parse(session.state || '{}');
  answers.forEach(({ questionId, answer, timeTaken = 0 }) => {
    addAnswerToSession(state, questionId, answer, timeTaken);
  });

  const updatedSession = await prisma.gameSession.update({
    where: { sessionId },
    data: {
      state: JSON.stringify(state)
    }
  });

  return mapToSession(updatedSession);
}

/**
 * Complete a quiz session
 */
export async function completeQuizSession(sessionId: string): Promise<MathQuizSession | null> {
  const session = await prisma.gameSession.findUnique({
    where: { sessionId }
  });

  if (!session) return null;

  const state = JSON.parse(session.state || '{}');
  const score = calculateScore(state, (session.difficulty || 'Easy') as MathDifficultyLevel);
  const completedAt = new Date();

  const updatedSession = await prisma.gameSession.update({
    where: { sessionId },
    data: {
      completed: true,
      completedAt,
      score
    }
  });

  return mapToSession(updatedSession);
}

/**
 * Get user's quiz statistics
 */
export async function getUserQuizStats(userId: string): Promise<MathQuizStats> {
  const dbSessions = await prisma.gameSession.findMany({
    where: { userId, game: 'math', completed: true }
  });

  if (dbSessions.length === 0) {
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

  const sessions = dbSessions.map(mapToSession);
  const totalQuizzesTaken = sessions.length;
  const totalQuestionsAnswered = sessions.reduce((sum, s) => sum + s.totalQuestions, 0);
  const correctAnswers = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
  const accuracy = totalQuestionsAnswered > 0 ? (correctAnswers / totalQuestionsAnswered) * 100 : 0;
  const averageScore = sessions.reduce((sum, s) => sum + s.score, 0) / totalQuizzesTaken;
  const bestScore = Math.max(...sessions.map(s => s.score));

  const totalTime = sessions.reduce((sum, s) => {
    if (s.endTime) {
      return sum + (s.endTime.getTime() - s.startTime.getTime());
    }
    return sum;
  }, 0);
  const averageTimePerQuestion = totalQuestionsAnswered > 0 ? totalTime / totalQuestionsAnswered : 0;

  const operationStats: Record<MathOperation, { correct: number; total: number }> = {
    '+': { correct: 0, total: 0 },
    '-': { correct: 0, total: 0 },
    '*': { correct: 0, total: 0 },
    '/': { correct: 0, total: 0 }
  };

  sessions.forEach(session => {
    session.answers.forEach(answer => {
      const question = session.questions.find(q => q.id === answer.questionId);
      if (question?.operation && operationStats[question.operation]) {
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

  const difficultyStats: Record<MathDifficultyLevel, { total: number; avgScore: number }> = {
    Easy: { total: 0, avgScore: 0 },
    Medium: { total: 0, avgScore: 0 },
    Hard: { total: 0, avgScore: 0 },
    Expert: { total: 0, avgScore: 0 }
  };

  sessions.forEach(session => {
    if (difficultyStats[session.difficulty]) {
      difficultyStats[session.difficulty].total += 1;
      difficultyStats[session.difficulty].avgScore += session.score;
    }
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
    currentStreak: 0,
    bestStreak: 0
  };
}

/**
 * Get operation statistics
 */
export async function getOperationStats(userId: string): Promise<OperationStats[]> {
  const dbSessions = await prisma.gameSession.findMany({
    where: { userId, game: 'math', completed: true }
  });

  const sessions = dbSessions.map(mapToSession);

  const stats: Record<MathOperation, { total: number; correct: number; totalTime: number }> = {
    '+': { total: 0, correct: 0, totalTime: 0 },
    '-': { total: 0, correct: 0, totalTime: 0 },
    '*': { total: 0, correct: 0, totalTime: 0 },
    '/': { total: 0, correct: 0, totalTime: 0 }
  };

  sessions.forEach(session => {
    session.answers.forEach(answer => {
      const question = session.questions.find(q => q.id === answer.questionId);
      if (question?.operation && stats[question.operation]) {
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
  const dbSessions = await prisma.gameSession.findMany({
    where: { userId, game: 'math', completed: true },
    orderBy: { createdAt: 'desc' },
    take: limit
  });

  return dbSessions.map(mapToSession);
}

/**
 * Delete old incomplete sessions (cleanup)
 */
export async function deleteOldIncompleteSessions(daysOld: number = 7): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await prisma.gameSession.deleteMany({
    where: {
      game: 'math',
      completed: false,
      createdAt: { lt: cutoffDate }
    }
  });

  return result.count;
}
