/**
 * Database operations for Quiz Game
 */

import QuizSessionModel from '@/models/games/quiz';
import type {
  QuizSession,
  QuizAnswer,
  QuizStats,
  QuizCategory,
  QuizDifficulty,
  QuizSessionSummary,
  CategoryPerformance,
  DifficultyPerformance
} from '@/types/games/quiz';

/**
 * Create a new quiz session
 */
export async function createQuizSession(
  sessionData: Omit<QuizSession, 'answers' | 'currentQuestionIndex' | 'score' | 'correctAnswers' | 'completed' | 'bonusPoints' | 'accuracy'>
): Promise<QuizSession> {
  const session = new QuizSessionModel({
    ...sessionData,
    answers: [],
    currentQuestionIndex: 0,
    score: 0,
    correctAnswers: 0,
    completed: false,
    bonusPoints: 0
  });

  await session.save();

  return session.toObject();
}

/**
 * Get quiz session by ID
 */
export async function getQuizSession(sessionId: string): Promise<QuizSession | null> {
  const session = await QuizSessionModel.findOne({ sessionId }).lean();
  return session;
}

/**
 * Submit answer for a question
 */
export async function submitAnswer(
  sessionId: string,
  answer: QuizAnswer
): Promise<QuizSession | null> {
  const session = await QuizSessionModel.findOne({ sessionId });
  
  if (!session) return null;
  if (session.completed) {
    throw new Error('Quiz session already completed');
  }

  // Find the question
  const question = session.questions.find(q => q.id === answer.questionId);
  if (!question) {
    throw new Error('Question not found in session');
  }

  // Check if already answered
  const existingAnswer = session.answers.find(a => a.questionId === answer.questionId);
  if (existingAnswer) {
    throw new Error('Question already answered');
  }

  // Check answer
  const isCorrect = session.checkAnswer(answer.questionId, answer.selectedAnswer);
  const pointsEarned = isCorrect ? (question.points || 10) : 0;

  // Add answer
  session.answers.push({
    ...answer,
    correct: isCorrect,
    pointsEarned
  });

  // Update score and correct count
  if (isCorrect) {
    session.correctAnswers += 1;
  }
  session.score += pointsEarned;

  // Move to next question
  session.currentQuestionIndex += 1;

  await session.save();

  return session.toObject();
}

/**
 * Complete quiz session
 */
export async function completeQuizSession(
  sessionId: string
): Promise<QuizSession | null> {
  const session = await QuizSessionModel.findOne({ sessionId });
  
  if (!session) return null;
  if (session.completed) return session.toObject();

  session.completed = true;
  session.endTime = new Date();
  session.duration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000);

  // Calculate final score with bonuses
  session.calculateScore();

  await session.save();

  return session.toObject();
}

/**
 * Submit all answers at once
 */
export async function submitQuizAnswers(
  sessionId: string,
  answers: Omit<QuizAnswer, 'correct' | 'pointsEarned'>[]
): Promise<QuizSession | null> {
  const session = await QuizSessionModel.findOne({ sessionId });
  
  if (!session) return null;
  if (session.completed) {
    throw new Error('Quiz session already completed');
  }

  // Process all answers
  const processedAnswers: QuizAnswer[] = [];
  let correctCount = 0;
  let totalScore = 0;

  answers.forEach(answer => {
    const question = session.questions.find(q => q.id === answer.questionId);
    if (question) {
      const isCorrect = question.ans === answer.selectedAnswer;
      const pointsEarned = isCorrect ? (question.points || 10) : 0;

      processedAnswers.push({
        ...answer,
        correct: isCorrect,
        pointsEarned
      });

      if (isCorrect) correctCount++;
      totalScore += pointsEarned;
    }
  });

  session.answers = processedAnswers;
  session.correctAnswers = correctCount;
  session.score = totalScore;
  session.completed = true;
  session.endTime = new Date();
  session.duration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000);

  // Calculate final score with bonuses
  session.calculateScore();

  await session.save();

  return session.toObject();
}

/**
 * Get user's quiz statistics
 */
export async function getUserQuizStats(userId: string): Promise<QuizStats> {
  const sessions = await QuizSessionModel
    .find({ userId, completed: true })
    .sort({ startTime: -1 })
    .lean();

  if (sessions.length === 0) {
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

  const totalQuizzes = sessions.length;
  const totalQuestions = sessions.reduce((sum, s) => sum + s.totalQuestions, 0);
  const correctAnswers = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
  const overallAccuracy = Math.round((correctAnswers / totalQuestions) * 100);
  const averageScore = Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / totalQuizzes);
  const bestScore = Math.max(...sessions.map(s => s.score));
  const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const averageTimePerQuestion = Math.round(totalTime / totalQuestions);
  const perfectQuizzes = sessions.filter(s => s.correctAnswers === s.totalQuestions).length;

  // Category statistics
  const categoryGroups: Record<string, typeof sessions> = {};
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
      accuracy: Math.round((correct / questionsAnswered) * 100),
      averageScore: Math.round(catSessions.reduce((sum, s) => sum + s.score, 0) / catSessions.length),
      averageTime: Math.round(totalDuration / questionsAnswered)
    };
  });

  // Difficulty statistics
  const difficultyGroups: Record<string, typeof sessions> = {};
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
      accuracy: Math.round((correct / questionsAnswered) * 100),
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
  const sessions = await QuizSessionModel
    .find({ userId, completed: true })
    .sort({ endTime: -1 })
    .limit(limit)
    .lean();

  return sessions.map(s => ({
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
}

/**
 * Delete expired sessions (older than 24 hours and not completed)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const expiryTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const result = await QuizSessionModel.deleteMany({
    completed: false,
    startTime: { $lt: expiryTime }
  });

  return result.deletedCount || 0;
}
