/**
 * MongoDB model for Emoji Game Sessions
 */

import mongoose, { Schema, Model } from 'mongoose';
// import type { EmojiGameSession, EmojiAttempt, EmojiPuzzle } from '@/types/games/emoji';

// Local type definitions to avoid import issues
type EmojiGameSession = any;
type EmojiAttempt = any;
type EmojiPuzzle = any;

/**
 * Attempt sub-schema
 */
const attemptSchema = new Schema<EmojiAttempt>({
  guess: { type: String, required: true },
  correct: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
  timeTaken: { type: Number, required: true }
}, { _id: false });

/**
 * Puzzle sub-schema
 */
const puzzleSchema = new Schema<EmojiPuzzle>({
  id: { type: Number, required: true },
  emojis: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true }
}, { _id: false });

/**
 * Emoji game session schema
 */
const emojiGameSessionSchema = new Schema<EmojiGameSession>(
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
    currentPuzzle: {
      type: puzzleSchema,
      required: true
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now
    },
    endTime: {
      type: Date
    },
    attempts: {
      type: [attemptSchema],
      default: []
    },
    score: {
      type: Number,
      default: 0,
      min: 0
    },
    hintsUsed: {
      type: Number,
      default: 0,
      min: 0
    },
    completed: {
      type: Boolean,
      default: false
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true
    }
  },
  {
    timestamps: true,
    collection: 'emoji_game_sessions'
  }
);

// Indexes for better query performance
emojiGameSessionSchema.index({ userId: 1, createdAt: -1 });
emojiGameSessionSchema.index({ completed: 1, createdAt: -1 });
emojiGameSessionSchema.index({ difficulty: 1, score: -1 });

// Virtual for duration
emojiGameSessionSchema.virtual('duration').get(function() {
  if (this.endTime) {
    return this.endTime.getTime() - this.startTime.getTime();
  }
  return null;
});

// Method to calculate accuracy
emojiGameSessionSchema.methods.calculateAccuracy = function(): number {
  if (this.attempts.length === 0) return 0;
  const correctAttempts = this.attempts.filter(a => a.correct).length;
  return (correctAttempts / this.attempts.length) * 100;
};

// Prevent model recompilation in development
const EmojiGameSessionModel: Model<EmojiGameSession> = 
  mongoose.models.EmojiGameSession || 
  mongoose.model<EmojiGameSession>('EmojiGameSession', emojiGameSessionSchema);

export default EmojiGameSessionModel;
