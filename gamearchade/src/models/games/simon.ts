import mongoose from 'mongoose';
import type { SimonColor } from '@/types/games/simon';

/**
 * Simon Game Session Schema
 * Stores Simon game sessions and results in MongoDB
 */
const simonSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Player information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow guest players
  },
  
  playerName: {
    type: String,
    required: false,
    trim: true
  },
  
  // Game configuration
  colors: [{
    type: String,
    enum: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan'],
    required: true
  }],
  
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  
  seed: {
    type: Number,
    required: true
  },
  
  // Game state
  sequence: [{
    type: String,
    enum: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan']
  }],
  
  playerSequence: [{
    type: String,
    enum: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan']
  }],
  
  currentStep: {
    type: Number,
    default: 0
  },
  
  level: {
    type: Number,
    default: 1
  },
  
  score: {
    type: Number,
    default: 0
  },
  
  // Game status
  isGameActive: {
    type: Boolean,
    default: true
  },
  
  isCompleted: {
    type: Boolean,
    default: false
  },
  
  // Performance metrics
  correctMoves: {
    type: Number,
    default: 0
  },
  
  totalMoves: {
    type: Number,
    default: 0
  },
  
  accuracy: {
    type: Number,
    default: 100
  },
  
  // Timing
  gameStartTime: {
    type: Date,
    default: Date.now
  },
  
  gameEndTime: {
    type: Date
  },
  
  gameDuration: {
    type: Number // in milliseconds
  },
  
  // Configuration
  enableSound: {
    type: Boolean,
    default: false
  },
  
  sequenceSpeed: {
    type: Number,
    default: 600 // milliseconds
  },
  
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Version for optimistic locking
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  collection: 'simon_sessions'
});

// Compound indexes for efficient queries
simonSessionSchema.index({ userId: 1, createdAt: -1 });
simonSessionSchema.index({ difficulty: 1, score: -1 });
simonSessionSchema.index({ isCompleted: 1, score: -1 });
simonSessionSchema.index({ gameStartTime: 1 });

// Virtual for game duration calculation
simonSessionSchema.virtual('calculatedDuration').get(function() {
  if (this.gameEndTime && this.gameStartTime) {
    return this.gameEndTime.getTime() - this.gameStartTime.getTime();
  }
  return null;
});

// Pre-save middleware to calculate metrics
simonSessionSchema.pre('save', function(next) {
  // Calculate accuracy
  if (this.totalMoves > 0) {
    this.accuracy = Math.round((this.correctMoves / this.totalMoves) * 100);
  }
  
  // Calculate game duration
  if (this.gameEndTime && this.gameStartTime && !this.gameDuration) {
    this.gameDuration = this.gameEndTime.getTime() - this.gameStartTime.getTime();
  }
  
  // Mark as completed if game is not active and has moves
  if (!this.isGameActive && this.totalMoves > 0) {
    this.isCompleted = true;
    if (!this.gameEndTime) {
      this.gameEndTime = new Date();
    }
  }
  
  next();
});

// Static methods
simonSessionSchema.statics.findByUser = function(userId: string, limit: number = 20) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'username email');
};

simonSessionSchema.statics.getLeaderboard = function(difficulty?: string, limit: number = 10) {
  const filter: any = { isCompleted: true };
  if (difficulty) {
    filter.difficulty = difficulty;
  }
  
  return this.find(filter)
    .sort({ score: -1, gameDuration: 1 })
    .limit(limit)
    .populate('userId', 'username email')
    .select('score level difficulty gameDuration playerName userId createdAt');
};

simonSessionSchema.statics.getTopScores = function(limit: number = 100) {
  return this.find({ isCompleted: true })
    .sort({ score: -1 })
    .limit(limit)
    .select('score level difficulty playerName userId createdAt');
};

simonSessionSchema.statics.getUserStats = function(userId: string) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), isCompleted: true } },
    {
      $group: {
        _id: null,
        totalGames: { $sum: 1 },
        averageScore: { $avg: '$score' },
        highestScore: { $max: '$score' },
        highestLevel: { $max: '$level' },
        totalCorrectMoves: { $sum: '$correctMoves' },
        totalMoves: { $sum: '$totalMoves' },
        averageAccuracy: { $avg: '$accuracy' },
        totalGameTime: { $sum: '$gameDuration' }
      }
    }
  ]);
};

// Instance methods
simonSessionSchema.methods.addMove = function(color: SimonColor, isCorrect: boolean) {
  this.playerSequence.push(color);
  this.totalMoves += 1;
  
  if (isCorrect) {
    this.correctMoves += 1;
    this.currentStep += 1;
  } else {
    this.isGameActive = false;
    this.gameEndTime = new Date();
  }
  
  return this.save();
};

simonSessionSchema.methods.completeLevel = function() {
  this.level += 1;
  this.currentStep = 0;
  this.playerSequence = [];
  // Score calculation can be done in the lib layer
  
  return this.save();
};

simonSessionSchema.methods.endGame = function(finalScore?: number) {
  this.isGameActive = false;
  this.isCompleted = true;
  this.gameEndTime = new Date();
  
  if (finalScore !== undefined) {
    this.score = finalScore;
  }
  
  return this.save();
};

// Create and export the model
const SimonSession = mongoose.models.SimonSession || 
  mongoose.model('SimonSession', simonSessionSchema);

export default SimonSession;
export type { SimonColor };