/**
 * MongoDB model for Memory Game Sessions
 */

import mongoose, { Schema, Model } from 'mongoose';
import type { MemoryGameSession, MemoryCard, CardFlip } from '@/types/games/memory';

/**
 * Memory card sub-schema
 */
const memoryCardSchema = new Schema<MemoryCard>({
  id: { type: Number, required: true },
  value: { type: String, required: true },
  matched: { type: Boolean, default: false },
  flipped: { type: Boolean, default: false },
  pairId: { type: Number }
}, { _id: false });

/**
 * Card flip sub-schema
 */
const cardFlipSchema = new Schema<CardFlip>({
  cardId: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  wasMatch: { type: Boolean, required: true },
  pairCardId: { type: Number }
}, { _id: false });

/**
 * Memory game session schema
 */
const memoryGameSessionSchema = new Schema<MemoryGameSession>(
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
    cards: {
      type: [memoryCardSchema],
      required: true,
      validate: {
        validator: (v: MemoryCard[]) => v.length >= 4 && v.length % 2 === 0,
        message: 'Cards must have at least 4 cards and be an even number'
      }
    },
    flips: {
      type: [cardFlipSchema],
      default: []
    },
    matches: {
      type: Number,
      default: 0,
      min: 0
    },
    totalPairs: {
      type: Number,
      required: true,
      min: 2
    },
    moves: {
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
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Expert'],
      required: true,
      default: 'Easy'
    },
    theme: {
      type: String,
      enum: ['fruits', 'animals', 'emojis', 'numbers', 'letters'],
      required: true,
      default: 'fruits'
    },
    score: {
      type: Number,
      default: 0,
      min: 0
    },
    timeLimit: {
      type: Number,
      min: 0
    }
  },
  {
    timestamps: true,
    collection: 'memory_game_sessions'
  }
);

// Indexes for better query performance
memoryGameSessionSchema.index({ userId: 1, createdAt: -1 });
memoryGameSessionSchema.index({ completed: 1, createdAt: -1 });
memoryGameSessionSchema.index({ difficulty: 1, score: -1 });
memoryGameSessionSchema.index({ score: -1, moves: 1 });

// Virtual for game duration
memoryGameSessionSchema.virtual('duration').get(function() {
  if (this.endTime) {
    return this.endTime.getTime() - this.startTime.getTime();
  }
  return null;
});

// Virtual for efficiency (perfect game = totalPairs moves)
memoryGameSessionSchema.virtual('efficiency').get(function() {
  if (this.moves === 0) return 0;
  return (this.totalPairs / this.moves) * 100;
});

// Virtual for accuracy
memoryGameSessionSchema.virtual('accuracy').get(function() {
  if (this.moves === 0) return 0;
  return (this.matches / this.moves) * 100;
});

// Method to calculate final score
memoryGameSessionSchema.methods.calculateScore = function(): number {
  if (!this.completed) return 0;

  const duration = this.endTime 
    ? (this.endTime.getTime() - this.startTime.getTime()) / 1000 
    : 0;

  // Base score from moves (fewer moves = higher score)
  const perfectMoves = this.totalPairs;
  const movesPenalty = Math.max(0, this.moves - perfectMoves) * 5;
  let score = 1000 - movesPenalty;

  // Time bonus (faster = higher score)
  const timeBonus = Math.max(0, 500 - duration * 2);
  score += timeBonus;

  // Difficulty multiplier
  const multipliers: Record<string, number> = {
    Easy: 1,
    Medium: 1.5,
    Hard: 2,
    Expert: 2.5
  };
  score *= multipliers[this.difficulty] || 1;

  // Perfect game bonus (no mistakes)
  if (this.moves === perfectMoves) {
    score += 500;
  }

  return Math.round(Math.max(0, score));
};

// Method to flip cards and check for match
memoryGameSessionSchema.methods.flipCards = function(cardIds: number[]): boolean {
  if (cardIds.length !== 2) return false;

  const card1 = this.cards.find((c: MemoryCard) => c.id === cardIds[0]);
  const card2 = this.cards.find((c: MemoryCard) => c.id === cardIds[1]);

  if (!card1 || !card2 || card1.matched || card2.matched) {
    return false;
  }

  this.moves += 1;

  // Check if cards match
  const isMatch = card1.value === card2.value || card1.pairId === card2.pairId;

  if (isMatch) {
    card1.matched = true;
    card2.matched = true;
    this.matches += 1;

    // Check if game is complete
    if (this.matches === this.totalPairs) {
      this.completed = true;
      this.endTime = new Date();
      this.score = this.calculateScore();
    }
  }

  // Record the flip
  this.flips.push({
    cardId: cardIds[0],
    timestamp: new Date(),
    wasMatch: isMatch,
    pairCardId: cardIds[1]
  });

  return isMatch;
};

// Prevent model recompilation in development
const MemoryGameSessionModel: Model<MemoryGameSession> = 
  mongoose.models.MemoryGameSession || 
  mongoose.model<MemoryGameSession>('MemoryGameSession', memoryGameSessionSchema);

export default MemoryGameSessionModel;
