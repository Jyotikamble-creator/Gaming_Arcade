/**
 * Database operations for Quiz Game
 */

import { prisma } from '@/lib/api/prisma';
import type {
  QuizSession,
  QuizAnswer,
  QuizStats,
  QuizCategory,
  QuizDifficulty,
  QuizSessionSummary,
  CategoryPerformance,
  DifficultyPerformance,
  QuizQuestion
} from '@/types/games/quiz';

function mapToSession(dbSession: any): QuizSession {
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
    sessionId: dbSession.sessionId,
    userId: dbSession.userId || undefined,
    questions,
    answers,
    currentQuestionIndex: state.currentQuestionIndex ?? 0,
    score: dbSession.score,
    correctAnswers: state.correctAnswers ?? 0,
    totalQuestions: questions.length,
    startTime: dbSession.startedAt,
    endTime: dbSession.completedAt || undefined,
    duration: dbSession.duration || undefined,
    category: (dbSession.category || 'general') as QuizCategory,
    difficulty: (dbSession.difficulty || 'medium') as QuizDifficulty,
    completed: dbSession.completed,
    timeLimit,
    bonusPoints: state.bonusPoints || 0,
    accuracy: state.accuracy || 0
  };
}

function calculateQuizScore(state: any, duration: number, difficulty: QuizDifficulty): { score: number; bonusPoints: number; accuracy: number } {
  const answers: QuizAnswer[] = state.answers || [];
  const questions: QuizQuestion[] = state.questions || [];
  const correctCount = answers.filter(a => a.correct).length;
  
  const baseScore = answers.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);
  
  // Speed bonus
  let speedBonus = 0;
  if (correctCount > 0) {
    const avgTime = answers.reduce((sum, a) => sum + a.timeSpent, 0) / answers.length;
    if (avgTime < 5) {
      speedBonus = correctCount * 15;
    } else if (avgTime < 10) {
      speedBonus = correctCount * 5;
    }
  }

  // Perfect score bonus
  let perfectBonus = 0;
  if (correctCount === questions.length && questions.length > 0) {
    perfectBonus = 200;
  }

  const bonusPoints = speedBonus + perfectBonus;
  
  let difficultyMultiplier = 1.0;
  if (difficulty === 'medium') difficultyMultiplier = 1.2;
  else if (difficulty === 'hard') difficultyMultiplier = 1.5;
  else if (difficulty === 'expert') difficultyMultiplier = 2.0;

  const score = Math.round((baseScore + bonusPoints) * difficultyMultiplier);
  const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  return { score, bonusPoints, accuracy };
}

/**
 * Create a new quiz session
 */
export async function createQuizSession(
  sessionData: Omit<QuizSession, 'answers' | 'currentQuestionIndex' | 'score' | 'correctAnswers' | 'completed' | 'bonusPoints' | 'accuracy'>
): Promise<QuizSession> {
  const session = await prisma.gameSession.create({
    data: {
      userId: sessionData.userId || null,
      sessionId: sessionData.sessionId,
      game: 'quiz',
      difficulty: sessionData.difficulty || 'medium',
      category: sessionData.category || 'general',
      state: JSON.stringify({
        questions: sessionData.questions,
        answers: [],
        currentQuestionIndex: 0,
        correctAnswers: 0,
        bonusPoints: 0,
        accuracy: 0
      }),
      meta: JSON.stringify({ timeLimit: sessionData.timeLimit }),
      startedAt: sessionData.startTime || new Date(),
      completed: false,
      score: 0
    }
  });

  return mapToSession(session);
}

/**
 * Get quiz session by ID
 */
export async function getQuizSession(sessionId: string): Promise<QuizSession | null> {
  const session = await prisma.gameSession.findUnique({
    where: { sessionId }
  });
  if (!session) return null;
  return mapToSession(session);
}

/**
 * Submit answer for a question
 */
export async function submitAnswer(
  sessionId: string,
  answer: QuizAnswer
): Promise<QuizSession | null> {
  const session = await prisma.gameSession.findUnique({
    where: { sessionId }
  });
  
  if (!session) return null;
  if (session.completed) {
    throw new Error('Quiz session already completed');
  }

  const state = JSON.parse(session.state || '{}');
  const questions: QuizQuestion[] = state.questions || [];
  const question = questions.find(q => q.id === answer.questionId);
  if (!question) {
    throw new Error('Question not found in session');
  }

  const answers: QuizAnswer[] = state.answers || [];
  const existingAnswer = answers.find(a => a.questionId === answer.questionId);
  if (existingAnswer) {
    throw new Error('Question already answered');
  }

  const isCorrect = question.ans.trim().toLowerCase() === answer.selectedAnswer.trim().toLowerCase();
  const pointsEarned = isCorrect ? (question.points || 10) : 0;

  answers.push({
    ...answer,
    correct: isCorrect,
    pointsEarned
  });

  state.answers = answers;
  state.correctAnswers = (state.correctAnswers || 0) + (isCorrect ? 1 : 0);
  state.currentQuestionIndex = (state.currentQuestionIndex || 0) + 1;

  const newScore = session.score + pointsEarned;

  const updatedSession = await prisma.gameSession.update({
    where: { sessionId },
    data: {
      state: JSON.stringify(state),
      score: newScore
    }
  });

  return mapToSession(updatedSession);
}

/**
 * Complete quiz session
 */
export async function completeQuizSession(
  sessionId: string
): Promise<QuizSession | null> {
  const session = await prisma.gameSession.findUnique({
    where: { sessionId }
  });
  
  if (!session) return null;
  if (session.completed) return mapToSession(session);

  const state = JSON.parse(session.state || '{}');
  const completedAt = new Date();
  const duration = Math.floor((completedAt.getTime() - session.startedAt.getTime()) / 1000);

  const scoreStats = calculateQuizScore(state, duration, (session.difficulty || 'medium') as QuizDifficulty);
  state.bonusPoints = scoreStats.bonusPoints;
  state.accuracy = scoreStats.accuracy;

  const updatedSession = await prisma.gameSession.update({
    where: { sessionId },
    data: {
      completed: true,
      completedAt,
      duration,
      score: scoreStats.score,
      state: JSON.stringify(state)
    }
  });

  return mapToSession(updatedSession);
}

/**
 * Submit all answers at once
 */
export async function submitQuizAnswers(
  sessionId: string,
  answers: Omit<QuizAnswer, 'correct' | 'pointsEarned'>[]
): Promise<QuizSession | null> {
  const session = await prisma.gameSession.findUnique({
    where: { sessionId }
  });
  
  if (!session) return null;
  if (session.completed) {
    throw new Error('Quiz session already completed');
  }

  const state = JSON.parse(session.state || '{}');
  const questions: QuizQuestion[] = state.questions || [];

  const processedAnswers: QuizAnswer[] = [];
  let correctCount = 0;
  let baseScore = 0;

  answers.forEach(answer => {
    const question = questions.find(q => q.id === answer.questionId);
    if (question) {
      const isCorrect = question.ans.trim().toLowerCase() === answer.selectedAnswer.trim().toLowerCase();
      const pointsEarned = isCorrect ? (question.points || 10) : 0;

      processedAnswers.push({
        ...answer,
        correct: isCorrect,
        pointsEarned
      });

      if (isCorrect) correctCount++;
      baseScore += pointsEarned;
    }
  });

  state.answers = processedAnswers;
  state.correctAnswers = correctCount;
  state.currentQuestionIndex = questions.length;

  const completedAt = new Date();
  const duration = Math.floor((completedAt.getTime() - session.startedAt.getTime()) / 1000);

  const scoreStats = calculateQuizScore(state, duration, (session.difficulty || 'medium') as QuizDifficulty);
  state.bonusPoints = scoreStats.bonusPoints;
  state.accuracy = scoreStats.accuracy;

  const updatedSession = await prisma.gameSession.update({
    where: { sessionId },
    data: {
      completed: true,
      completedAt,
      duration,
      score: scoreStats.score,
      state: JSON.stringify(state)
    }
  });

  return mapToSession(updatedSession);
}

/**
 * Get user's quiz statistics
 */
export async function getUserQuizStats(userId: string): Promise<QuizStats> {
  const dbSessions = await prisma.gameSession.findMany({
    where: { userId, game: 'quiz', completed: true },
    orderBy: { startedAt: 'desc' }
  });

  if (dbSessions.length === 0) {
    return {
      userId,
      totalQuizzes: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      overallAccuracy: 0,
      averageScore: 0,
      bestScore: 0,
      averageTimePerQuestion: 0,
      perfectQuizzes: 0,
      categoryStats: [],
      difficultyStats: [],
      recentQuizzes: [],
      favoriteCategory: 'general',
      strongestCategory: 'general',
      weakestCategory: 'general'
    };
  }

  const sessions = dbSessions.map(mapToSession);
  const totalQuizzes = sessions.length;
  const totalQuestions = sessions.reduce((sum, s) => sum + s.totalQuestions, 0);
  const correctAnswers = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
  const overallAccuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const averageScore = Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / totalQuizzes);
  const bestScore = Math.max(...sessions.map(s => s.score));
  const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const averageTimePerQuestion = totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : 0;
  const perfectQuizzes = sessions.filter(s => s.correctAnswers === s.totalQuestions).length;

  // Category statistics
  const categoryGroups: Record<string, QuizSession[]> = {};
  sessions.forEach(session => {
    const cat = session.category || 'general';
    if (!categoryGroups[cat]) categoryGroups[cat] = [];
    categoryGroups[cat].push(session);
  });

  const categoryStats: CategoryPerformance[] = Object.entries(categoryGroups).map(([category, catSessions]) => {
    const questionsAnswered = catSessions.reduce((sum, s) => sum + s.totalQuestions, 0);
    const correct = catSessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const totalDuration = catSessions.reduce((sum, s) => sum + (s.duration || 0), 0);

    return {
      category: category as QuizCategory,
      quizzesPlayed: catSessions.length,
      questionsAnswered,
      correctAnswers: correct,
      accuracy: questionsAnswered > 0 ? Math.round((correct / questionsAnswered) * 100) : 0,
      averageScore: Math.round(catSessions.reduce((sum, s) => sum + s.score, 0) / catSessions.length),
      averageTime: questionsAnswered > 0 ? Math.round(totalDuration / questionsAnswered) : 0
    };
  });

  // Difficulty statistics
  const difficultyGroups: Record<string, QuizSession[]> = {};
  sessions.forEach(session => {
    const diff = session.difficulty || 'medium';
    if (!difficultyGroups[diff]) difficultyGroups[diff] = [];
    difficultyGroups[diff].push(session);
  });

  const difficultyStats: DifficultyPerformance[] = Object.entries(difficultyGroups).map(([difficulty, diffSessions]) => {
    const questionsAnswered = diffSessions.reduce((sum, s) => sum + s.totalQuestions, 0);
    const correct = diffSessions.reduce((sum, s) => sum + s.correctAnswers, 0);

    return {
      difficulty: difficulty as QuizDifficulty,
      quizzesPlayed: diffSessions.length,
      questionsAnswered,
      correctAnswers: correct,
      accuracy: questionsAnswered > 0 ? Math.round((correct / questionsAnswered) * 100) : 0,
      averageScore: Math.round(diffSessions.reduce((sum, s) => sum + s.score, 0) / diffSessions.length)
    };
  });

  // Recent quizzes
  const recentQuizzes: QuizSessionSummary[] = sessions.slice(0, 10).map(s => ({
    sessionId: s.sessionId,
    score: s.score,
    correctAnswers: s.correctAnswers,
    totalQuestions: s.totalQuestions,
    accuracy: s.accuracy || 0,
    duration: s.duration || 0,
    category: s.category,
    difficulty: s.difficulty,
    completedAt: s.endTime || s.startTime
  }));

  // Favorite category (most played)
  const favoriteCategory = (categoryStats.sort((a, b) => b.quizzesPlayed - a.quizzesPlayed)[0]?.category || 'general') as QuizCategory;

  // Strongest category (highest accuracy)
  const strongestCategory = (categoryStats.sort((a, b) => b.accuracy - a.accuracy)[0]?.category || 'general') as QuizCategory;

  // Weakest category (lowest accuracy)
  const weakestCategory = (categoryStats.sort((a, b) => a.accuracy - b.accuracy)[0]?.category || 'general') as QuizCategory;

  return {
    userId,
    totalQuizzes,
    totalQuestions,
    correctAnswers,
    overallAccuracy,
    averageScore,
    bestScore,
    averageTimePerQuestion,
    perfectQuizzes,
    categoryStats,
    difficultyStats,
    recentQuizzes,
    favoriteCategory,
    strongestCategory,
    weakestCategory
  };
}

/**
 * Get recent quiz sessions
 */
export async function getRecentQuizSessions(
  userId: string,
  limit: number = 10
): Promise<QuizSessionSummary[]> {
  const dbSessions = await prisma.gameSession.findMany({
    where: { userId, game: 'quiz', completed: true },
    orderBy: { completedAt: 'desc' },
    take: limit
  });

  return dbSessions.map(s => {
    const state = JSON.parse(s.state || '{}');
    const questionsCount = state.questions ? state.questions.length : 0;
    const correctCount = state.correctAnswers || 0;
    const accuracy = questionsCount > 0 ? Math.round((correctCount / questionsCount) * 100) : 0;

    return {
      sessionId: s.sessionId,
      score: s.score,
      correctAnswers: correctCount,
      totalQuestions: questionsCount,
      accuracy,
      duration: s.duration || 0,
      category: s.category as QuizCategory,
      difficulty: s.difficulty as QuizDifficulty,
      completedAt: s.completedAt || s.startedAt
    };
  });
}

/**
 * Delete expired sessions (older than 24 hours and not completed)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const expiryTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const result = await prisma.gameSession.deleteMany({
    where: {
      game: 'quiz',
      completed: false,
      startedAt: { lt: expiryTime }
    }
  });

  return result.count;
}
