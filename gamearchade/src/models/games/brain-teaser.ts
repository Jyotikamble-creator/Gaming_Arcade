// MongoDB models for Brain Teaser game
import mongoose, { Schema, Model } from 'mongoose';
import { BrainTeaserSession, PuzzleAttempt } from '@/types/games/brain-teaser';

// Puzzle Attempt Schema
const PuzzleAttemptSchema = new Schema<PuzzleAttempt>({
  puzzleId: { type: String, required: true },
  puzzleType: { 
    type: String, 
    enum: ['match-shape', 'find-odd', 'pattern'],
    required: true 
  },
  answered: { type: Boolean, default: false },
  correct: { type: Boolean, default: false },
  timeSpent: { type: Number, required: true },
  pointsEarned: { type: Number, default: 0 },
  attemptedAt: { type: Date, default: Date.now },
}, { _id: false });

// Brain Teaser Session Schema
const BrainTeaserSessionSchema = new Schema<BrainTeaserSession>({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  startTime: { type: Date, required: true, default: Date.now },
  endTime: { type: Date, default: null },
  score: { type: Number, default: 0 },
  puzzlesSolved: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  timeUsed: { type: Number, default: 0 },
  puzzles: { type: [PuzzleAttemptSchema], default: [] },
}, {
  timestamps: true,
});

// Indexes for better query performance
BrainTeaserSessionSchema.index({ userId: 1, startTime: -1 });
BrainTeaserSessionSchema.index({ sessionId: 1 });
BrainTeaserSessionSchema.index({ score: -1 });

// Prevent model recompilation in development (Next.js hot reload)
const BrainTeaserSessionModel: Model<BrainTeaserSession> = 
  mongoose.models.BrainTeaserSession || 
  mongoose.model<BrainTeaserSession>('BrainTeaserSession', BrainTeaserSessionSchema);

export default BrainTeaserSessionModel;
