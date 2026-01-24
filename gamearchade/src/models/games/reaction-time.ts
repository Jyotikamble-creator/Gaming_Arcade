/**
 * MongoDB model for Reaction Time Game sessions
 */

import mongoose, { Schema, Document } from 'mongoose';
import type { ReactionSession, ReactionAttempt, ReactionDifficulty, ReactionPerformance } from '@/types/games/reaction-time';

/**
 * Reaction session document interface
 */
export interface ReactionSessionDocument extends Omit<ReactionSession, 'sessionId'>, Document {
  sessionId: string;
  calculateStats(): void;
  calculateScore(): number;
}

/**
 * Reaction attempt sub-schema
 */
const reactionAttemptSchema = new Schema({
  attemptNumber: { type: Number, required: true },
  reactionTime: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  valid: { type: Boolean, default: true },
  tooEarly: { type: Boolean, default: false }
}, { _id: false });

/**
 * Reaction session schema
 */
const reactionSessionSchema = new Schema<ReactionSessionDocument>({
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
  attempts: [reactionAttemptSchema],
  currentAttempt: {
    type: Number,
    default: 0
  },
  totalAttempts: {
    type: Number,
    required: true,
    default: 5
  },
  startTime: {
    type: Date,
    default: Date.now,
    required: true
  },
  endTime: Date,
  averageTime: Number,
  bestTime: Number,
  worstTime: Number,
  consistency: Number,
  score: Number,
  performance: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'extreme'],
    default: 'medium'
  },
  completed: {
    type: Boolean,
    default: false
  },
  falseStarts: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

/**
 * Calculate statistics from attempts
 */
reactionSessionSchema.methods.calculateStats = function(): void {
  if (this.attempts.length === 0) return;

  // Filter valid attempts only
  const validAttempts = this.attempts.filter((a: any) => a.valid && !a.tooEarly);
  
  if (validAttempts.length === 0) return;

  const times = validAttempts.map((a: any) => a.reactionTime);
  
  // Calculate average
  this.averageTime = Math.round(times.reduce((sum: number, t: number) => sum + t, 0) / times.length);
  
  // Calculate best and worst
  this.bestTime = Math.min(...times);
  this.worstTime = Math.max(...times);
  
  // Calculate consistency (variance)
  this.consistency = this.worstTime - this.bestTime;
  
  // Count false starts
  this.falseStarts = this.attempts.filter((a: any) => a.tooEarly).length;
};

/**
 * Calculate score based on performance
 */
reactionSessionSchema.methods.calculateScore = function(): number {
  if (!this.averageTime || !this.bestTime) {
    this.calculateStats();
  }

  if (!this.averageTime || !this.bestTime) return 0;

  // Base score: 500 for 200ms average, decreasing as average increases
  let baseScore = Math.max(0, Math.round(500 - (this.averageTime - 200) * 0.5));

  // Consistency bonus (lower variance = higher bonus)
  const consistencyBonus = Math.max(0, Math.round((1 - this.consistency / this.averageTime) * 50));

  // Best time bonus
  let bestTimeBonus = 0;
  if (this.bestTime < 200) bestTimeBonus = 50;
  else if (this.bestTime < 250) bestTimeBonus = 25;
  else if (this.bestTime < 300) bestTimeBonus = 10;

  // Difficulty multiplier
  const difficultyMultipliers: Record<ReactionDifficulty, number> = {
    easy: 1.0,
    medium: 1.25,
    hard: 1.5,
    extreme: 2.0
  };
  const multiplier = difficultyMultipliers[this.difficulty as ReactionDifficulty] || 1.0;

  // False start penalty (10 points per false start)
  const penalty = this.falseStarts * 10;

  // Calculate total score
  this.score = Math.max(0, Math.round((baseScore + consistencyBonus + bestTimeBonus) * multiplier - penalty));

  // Determine performance category
  if (this.averageTime <= 200) this.performance = 'elite';
  else if (this.averageTime <= 250) this.performance = 'excellent';
  else if (this.averageTime <= 300) this.performance = 'good';
  else if (this.averageTime <= 350) this.performance = 'average';
  else if (this.averageTime <= 400) this.performance = 'belowAverage';
  else this.performance = 'slow';

  return this.score;
};

/**
 * Indexes for performance
 */
reactionSessionSchema.index({ userId: 1, completed: 1 });
reactionSessionSchema.index({ startTime: -1 });
reactionSessionSchema.index({ bestTime: 1 });
reactionSessionSchema.index({ averageTime: 1 });

/**
 * Export model with hot-reload protection
 */
const ReactionSessionModel = mongoose.models.ReactionSession || 
  mongoose.model<ReactionSessionDocument>('ReactionSession', reactionSessionSchema);

export default ReactionSessionModel;
