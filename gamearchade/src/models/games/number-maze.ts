/**
 * MongoDB model for Number Maze Game Sessions
 */

import mongoose, { Schema, Model } from 'mongoose';
// import { NumberMazeSession, MazeMove } from '@/types/games/number-maze';

// Local type definitions to avoid import issues
type MazeMove = {
  fromPosition: { row: number; col: number };
  toPosition: { row: number; col: number };
  moveNumber: number;
  timestamp?: Date;
  isValid?: boolean;
};

type NumberMazeSession = any; // Will be properly typed by schema

/**
 * Maze move sub-schema
 */
const mazeMoveSchema = new Schema<MazeMove>({
  operation: {
    type: String,
    enum: ['add', 'subtract', 'multiply', 'divide', 'square', 'sqrt'],
    required: true
  },
  operand: { type: Number },
  resultValue: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  moveNumber: { type: Number, required: true }
}, { _id: false });

/**
 * Number maze session schema
 */
const numberMazeSessionSchema = new Schema<NumberMazeSession>(
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
    startNumber: {
      type: Number,
      required: true
    },
    targetNumber: {
      type: Number,
      required: true
    },
    currentNumber: {
      type: Number,
      required: true
    },
    moves: {
      type: [mazeMoveSchema],
      default: []
    },
    moveCount: {
      type: Number,
      default: 0,
      min: 0
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now
    },
    endTime: {
      type: Date
    },
    completed: {
      type: Boolean,
      default: false
    },
    success: {
      type: Boolean,
      default: false
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert', 'master'],
      required: true,
      default: 'beginner'
    },
    score: {
      type: Number,
      default: 0,
      min: 0
    },
    timeElapsed: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
    collection: 'number_maze_sessions'
  }
);

// Indexes for better query performance
numberMazeSessionSchema.index({ userId: 1, createdAt: -1 });
numberMazeSessionSchema.index({ completed: 1, success: 1 });
numberMazeSessionSchema.index({ difficulty: 1, score: -1 });
numberMazeSessionSchema.index({ score: -1, moveCount: 1 });

// Virtual for duration in seconds
numberMazeSessionSchema.virtual('duration').get(function() {
  if (this.endTime) {
    return Math.floor((this.endTime.getTime() - this.startTime.getTime()) / 1000);
  }
  return Math.floor((Date.now() - this.startTime.getTime()) / 1000);
});

// Virtual for move efficiency percentage
numberMazeSessionSchema.virtual('moveEfficiency').get(function() {
  if (this.moveCount === 0) return 0;
  // Compare against a baseline of 20 moves
  return Math.round((20 / Math.max(this.moveCount, 1)) * 100);
});

// Virtual for time efficiency percentage
numberMazeSessionSchema.virtual('timeEfficiency').get(function() {
  if (this.timeElapsed === 0) return 0;
  // Compare against a baseline of 300 seconds (5 minutes)
  return Math.round((300 / Math.max(this.timeElapsed, 1)) * 100);
});

// Method to make a move
numberMazeSessionSchema.methods.makeMove = function(
  operation: string,
  operand?: number
): { success: boolean; newValue: number } {
  let newValue = this.currentNumber;

  switch (operation) {
    case 'add':
      if (operand === undefined) return { success: false, newValue };
      newValue += operand;
      break;
    case 'subtract':
      if (operand === undefined) return { success: false, newValue };
      newValue -= operand;
      break;
    case 'multiply':
      if (operand === undefined) return { success: false, newValue };
      newValue *= operand;
      break;
    case 'divide':
      if (operand === undefined || operand === 0) return { success: false, newValue };
      newValue = Math.floor(newValue / operand);
      break;
    case 'square':
      newValue = newValue * newValue;
      break;
    case 'sqrt':
      if (newValue < 0) return { success: false, newValue };
      newValue = Math.floor(Math.sqrt(newValue));
      break;
    default:
      return { success: false, newValue };
  }

  // Record the move
  this.moves.push({
    operation,
    operand,
    resultValue: newValue,
    timestamp: new Date(),
    moveNumber: this.moveCount + 1
  });

  this.currentNumber = newValue;
  this.moveCount += 1;

  // Check if target is reached
  if (this.currentNumber === this.targetNumber) {
    this.completed = true;
    this.success = true;
    this.endTime = new Date();
    this.timeElapsed = Math.floor((this.endTime.getTime() - this.startTime.getTime()) / 1000);
  }

  return { success: true, newValue };
};

// Method to calculate final score
numberMazeSessionSchema.methods.calculateScore = function(): number {
  if (!this.completed || !this.success) return 0;

  let score = 1000;

  // Move efficiency bonus (fewer moves = higher score)
  const moveBonus = Math.max(0, 200 - this.moveCount * 15);
  score += moveBonus;

  // Time bonus (faster completion = higher score)
  const timeBonus = Math.max(0, 300 - this.timeElapsed);
  score += timeBonus;

  // Target difficulty bonus
  const targetBonus = Math.abs(this.targetNumber) <= 25 ? 100 : 0;
  score += targetBonus;

  // Perfect solve bonus (under 8 moves)
  if (this.moveCount <= 8) score += 150;

  // Speed demon bonus (under 2 minutes)
  if (this.timeElapsed <= 120) score += 50;

  // Difficulty multiplier
  const multipliers: Record<string, number> = {
    beginner: 1,
    intermediate: 1.2,
    advanced: 1.5,
    expert: 2,
    master: 2.5
  };
  score *= multipliers[this.difficulty] || 1;

  return Math.max(50, Math.round(score));
};

// Prevent model recompilation in development
const NumberMazeSessionModel: Model<NumberMazeSession> = 
  mongoose.models.NumberMazeSession || 
  mongoose.model<NumberMazeSession>('NumberMazeSession', numberMazeSessionSchema);

export default NumberMazeSessionModel;
