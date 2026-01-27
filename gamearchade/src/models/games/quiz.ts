/**
 * MongoDB model for Quiz Game sessions
 */

import mongoose, { Schema, Document } from 'mongoose';
// import type { QuizSession, QuizAnswer, QuizCategory, QuizDifficulty } from '@/types/games/quiz';\n\n// Local type definitions to avoid import issues\ntype QuizSession = any;\ntype QuizAnswer = any;\ntype QuizCategory = any;\ntype QuizDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Quiz session document interface
 */
export interface QuizSessionDocument extends Omit<QuizSession, 'sessionId'>, Document {
  sessionId: string;
  calculateScore(): number;
  checkAnswer(questionId: number, selectedAnswer: string): boolean;
}

/**
 * Quiz answer sub-schema
 */
const quizAnswerSchema = new Schema({
  questionId: { type: Number, required: true },
  selectedAnswer: { type: String, required: true },
  timeSpent: { type: Number, required: true },
  correct: { type: Boolean, default: false },
  pointsEarned: { type: Number, default: 0 }
}, { _id: false });

/**
 * Quiz session schema
 */
const quizSessionSchema = new Schema<QuizSessionDocument>({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    index: true
  },
  questions: [{
    id: { type: Number, required: true },
    q: { type: String, required: true },
    options: [{ type: String, required: true }],
    ans: { type: String, required: true },
    category: { type: String, required: true },
    difficulty: { type: String, required: true },
    explanation: String,
    points: { type: Number, default: 10 },
    timeLimit: Number
  }],
  answers: [quizAnswerSchema],
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now,
    required: true
  },
  endTime: Date,
  duration: Number,
  category: String,
  difficulty: String,
  completed: {
    type: Boolean,
    default: false
  },
  timeLimit: Number,
  bonusPoints: {
    type: Number,
    default: 0
  },
  accuracy: Number
}, {
  timestamps: true
});

/**
 * Calculate total score
 */
quizSessionSchema.methods.calculateScore = function(): number {
  let baseScore = this.answers.reduce((sum: number, answer: any) => sum + (answer.pointsEarned || 0), 0);
  
  // Calculate accuracy
  this.accuracy = this.totalQuestions > 0 
    ? Math.round((this.correctAnswers / this.totalQuestions) * 100)
    : 0;

  // Bonus points
  let bonusPoints = 0;

  // Perfect quiz bonus (100% correct)
  if (this.correctAnswers === this.totalQuestions && this.totalQuestions > 0) {
    bonusPoints += 50;
  }

  // Speed bonus (answered quickly)
  if (this.duration && this.totalQuestions > 0) {
    const avgTimePerQuestion = this.duration / this.totalQuestions;
    if (avgTimePerQuestion < 10) {
      bonusPoints += 30;
    } else if (avgTimePerQuestion < 15) {
      bonusPoints += 20;
    } else if (avgTimePerQuestion < 20) {
      bonusPoints += 10;
    }
  }

  // High accuracy bonus
  if (this.accuracy >= 90) {
    bonusPoints += 25;
  } else if (this.accuracy >= 80) {
    bonusPoints += 15;
  } else if (this.accuracy >= 70) {
    bonusPoints += 10;
  }

  this.bonusPoints = bonusPoints;
  this.score = baseScore + bonusPoints;

  return this.score;
};

/**
 * Check if answer is correct
 */
quizSessionSchema.methods.checkAnswer = function(questionId: number, selectedAnswer: string): boolean {
  const question = this.questions.find((q: any) => q.id === questionId);
  if (!question) return false;
  
  return question.ans === selectedAnswer;
};

/**
 * Indexes for performance
 */
quizSessionSchema.index({ userId: 1, completed: 1 });
quizSessionSchema.index({ startTime: -1 });
quizSessionSchema.index({ category: 1, completed: 1 });
quizSessionSchema.index({ difficulty: 1, completed: 1 });

/**
 * Export model with hot-reload protection
 */
const QuizSessionModel = mongoose.models.QuizSession || 
  mongoose.model<QuizSessionDocument>('QuizSession', quizSessionSchema);

export default QuizSessionModel;
