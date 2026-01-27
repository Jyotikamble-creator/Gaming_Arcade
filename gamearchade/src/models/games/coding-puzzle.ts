// MongoDB models for Coding Puzzle game
import mongoose, { Schema, Model } from 'mongoose';
// import { CodingPuzzleSession, PuzzleAttempt } from '@/types/games/coding-puzzle';

// Local type definitions to avoid import issues
type PuzzleAttempt = {
  puzzleId: string;
  answer: string;
  isCorrect?: boolean;
  timeSpent: number;
  pointsEarned?: number;
  attemptedAt?: Date;
};

type CodingPuzzleSession = any; // Will be properly typed by schema

// Puzzle Attempt Schema
const PuzzleAttemptSchema = new Schema<PuzzleAttempt>({
  puzzleId: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['patterns', 'codeOutput', 'logic', 'bitwise'],
    required: true 
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  answered: { type: Boolean, default: false },
  correct: { type: Boolean, default: false },
  timeSpent: { type: Number, required: true },
  pointsEarned: { type: Number, default: 0 },
  hintsUsed: { type: Number, default: 0 },
  attemptedAt: { type: Date, default: Date.now },
}, { _id: false });

// Coding Puzzle Session Schema
const CodingPuzzleSessionSchema = new Schema<CodingPuzzleSession>({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  startTime: { type: Date, required: true, default: Date.now },
  endTime: { type: Date, default: null },
  score: { type: Number, default: 0 },
  puzzlesSolved: { type: Number, default: 0 },
  totalAttempts: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  hintsUsed: { type: Number, default: 0 },
  timeSpent: { type: Number, default: 0 },
  puzzles: { type: [PuzzleAttemptSchema], default: [] },
  categoryStats: { type: Object, default: {} },
}, {
  timestamps: true,
});

// Indexes for better query performance
CodingPuzzleSessionSchema.index({ userId: 1, startTime: -1 });
CodingPuzzleSessionSchema.index({ sessionId: 1 });
CodingPuzzleSessionSchema.index({ score: -1 });

// Prevent model recompilation in development (Next.js hot reload)
const CodingPuzzleSessionModel: Model<CodingPuzzleSession> = 
  mongoose.models.CodingPuzzleSession || 
  mongoose.model<CodingPuzzleSession>('CodingPuzzleSession', CodingPuzzleSessionSchema);

export default CodingPuzzleSessionModel;
