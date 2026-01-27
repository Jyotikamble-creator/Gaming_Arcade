/**
 * MongoDB model for Math Quiz Sessions
 */

import mongoose, { Schema, Model } from 'mongoose';
// import type { MathQuizSession, UserAnswer, MathQuestion } from '@/types/games/math';

// Local type definitions to avoid import issues
type MathQuestion = {
  questionId: string;
  question: string;
  answer: number;
  userAnswer?: number;
  isCorrect?: boolean;
  timeSpent?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  pointsEarned?: number;
};

type UserAnswer = any;
type MathQuizSession = any; // Will be properly typed by schema

/**
 * Math question sub-schema
 */
const mathQuestionSchema = new Schema<MathQuestion>({
  id: { type: Number, required: true },
  q: { type: String, required: true },
  options: { type: [String], required: true },
  ans: { type: String, required: true },
  operation: { type: String, enum: ['+', '-', '*', '/'] },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Expert'] },
  type: { type: String, enum: ['basic', 'equation', 'wordProblem', 'multiStep'] },
  explanation: { type: String }
}, { _id: false });

/**
 * User answer sub-schema
 */
const userAnswerSchema = new Schema<UserAnswer>({
  questionId: { type: Number, required: true },
  userAnswer: { type: String, required: true },
  correctAnswer: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  timeTaken: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

/**
 * Math quiz session schema
 */
const mathQuizSessionSchema = new Schema<MathQuizSession>(
  {
    userId: {
      type: String,
      ref: 'User',
      index: true
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    questions: {
      type: [mathQuestionSchema],
      required: true,
      validate: {
        validator: (v: MathQuestion[]) => v.length > 0,
        message: 'At least one question is required'
      }
    },
    answers: {
      type: [userAnswerSchema],
      default: []
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now
    },
    endTime: {
      type: Date
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1
    },
    correctAnswers: {
      type: Number,
      default: 0,
      min: 0
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Expert'],
      required: true,
      default: 'Easy'
    },
    timeLimit: {
      type: Number,
      min: 0
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    collection: 'math_quiz_sessions'
  }
);

// Indexes for better query performance
mathQuizSessionSchema.index({ userId: 1, createdAt: -1 });
mathQuizSessionSchema.index({ completed: 1, createdAt: -1 });
mathQuizSessionSchema.index({ difficulty: 1, score: -1 });
mathQuizSessionSchema.index({ score: -1, createdAt: -1 });

// Virtual for quiz duration
mathQuizSessionSchema.virtual('duration').get(function() {
  if (this.endTime) {
    return this.endTime.getTime() - this.startTime.getTime();
  }
  return null;
});

// Virtual for accuracy percentage
mathQuizSessionSchema.virtual('accuracy').get(function() {
  if (this.totalQuestions === 0) return 0;
  return (this.correctAnswers / this.totalQuestions) * 100;
});

// Method to calculate final score
mathQuizSessionSchema.methods.calculateScore = function(): number {
  const accuracy = (this.correctAnswers / this.totalQuestions) * 100;
  let timeBonus = 0;

  if (this.endTime && this.timeLimit) {
    const timeTaken = (this.endTime.getTime() - this.startTime.getTime()) / 1000;
    const timeRemaining = this.timeLimit - timeTaken;
    if (timeRemaining > 0) {
      timeBonus = (timeRemaining / this.timeLimit) * 10;
    }
  }

  return Math.min(100, Math.round(accuracy + timeBonus));
};

// Method to add an answer
mathQuizSessionSchema.methods.addAnswer = function(
  questionId: number,
  userAnswer: string,
  timeTaken: number
): boolean {
  const question = this.questions.find((q: MathQuestion) => q.id === questionId);
  if (!question) return false;

  const isCorrect = userAnswer.trim() === question.ans.trim();
  
  this.answers.push({
    questionId,
    userAnswer,
    correctAnswer: question.ans,
    isCorrect,
    timeTaken,
    timestamp: new Date()
  });

  if (isCorrect) {
    this.correctAnswers += 1;
  }

  // Check if quiz is complete
  if (this.answers.length === this.totalQuestions) {
    this.completed = true;
    this.endTime = new Date();
    this.score = this.calculateScore();
  }

  return isCorrect;
};

// Prevent model recompilation in development
const MathQuizSessionModel: Model<MathQuizSession> = 
  mongoose.models.MathQuizSession || 
  mongoose.model<MathQuizSession>('MathQuizSession', mathQuizSessionSchema);

export default MathQuizSessionModel;
