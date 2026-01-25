import mongoose from 'mongoose';
import type { 
  SlidingPuzzleDifficulty, 
  SlidingPuzzleRating, 
  ISlidingPuzzleMove 
} from '@/types/games/sliding-puzzle';

/**
 * Sliding Puzzle Session Schema
 * Stores sliding puzzle game sessions and results in MongoDB
 */
const slidingPuzzleSessionSchema = new mongoose.Schema({
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
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert', 'master'],
    default: 'intermediate'
  },
  
  puzzleSize: {
    type: Number,
    required: true,
    min: 3,
    max: 6,
    default: 4
  },
  
  // Game state
  initialState: [{
    type: Number,
    required: true
  }],
  
  currentState: [{
    type: Number,
    required: true
  }],
  
  moves: {
    type: Number,
    default: 0,
    min: 0
  },
  
  moveHistory: [{
    fromPosition: Number,
    toPosition: Number,
    tileNumber: Number,
    moveNumber: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Timing
  startTime: {
    type: Date,
    default: Date.now
  },
  
  endTime: {
    type: Date
  },
  
  timeElapsed: {
    type: Number // in seconds
  },
  
  // Game completion
  isCompleted: {
    type: Boolean,
    default: false
  },
  
  isSolved: {
    type: Boolean,
    default: false
  },
  
  // Performance metrics
  score: {
    type: Number,
    min: 0
  },
  
  rating: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Puzzle Master']
  },
  
  moveEfficiency: {
    type: Number,
    min: 0,
    max: 100
  },
  
  timeEfficiency: {
    type: Number,
    min: 0,
    max: 100
  },
  
  manhattanDistance: {
    type: Number,
    default: 0
  },
  
  // Configuration options
  hintsUsed: {
    type: Number,
    default: 0
  },
  
  enableHints: {
    type: Boolean,
    default: false
  },
  
  enableTimer: {
    type: Boolean,
    default: true
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
  collection: 'sliding_puzzle_sessions'
});

// Compound indexes for efficient queries
slidingPuzzleSessionSchema.index({ userId: 1, createdAt: -1 });
slidingPuzzleSessionSchema.index({ difficulty: 1, score: -1 });
slidingPuzzleSessionSchema.index({ isCompleted: 1, isSolved: 1 });
slidingPuzzleSessionSchema.index({ score: -1, timeElapsed: 1 });
slidingPuzzleSessionSchema.index({ moves: 1, timeElapsed: 1 });

// Virtual for calculated duration
slidingPuzzleSessionSchema.virtual('calculatedTimeElapsed').get(function() {
  if (this.endTime && this.startTime) {
    return Math.round((this.endTime.getTime() - this.startTime.getTime()) / 1000);
  }
  return this.timeElapsed || 0;
});

// Pre-save middleware to calculate metrics
slidingPuzzleSessionSchema.pre('save', function(next) {
  // Calculate time elapsed if endTime is set
  if (this.endTime && this.startTime && !this.timeElapsed) {
    this.timeElapsed = Math.round((this.endTime.getTime() - this.startTime.getTime()) / 1000);
  }
  
  // Mark as completed if solved or explicitly ended
  if (this.isSolved || (this.endTime && this.moves > 0)) {
    this.isCompleted = true;
  }
  
  next();
});

// Static methods
slidingPuzzleSessionSchema.statics.findByUser = function(userId: string, limit: number = 20) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'username email');
};

slidingPuzzleSessionSchema.statics.getLeaderboard = function(
  difficulty?: SlidingPuzzleDifficulty,
  puzzleSize?: number,
  limit: number = 10
) {
  const filter: any = { isCompleted: true, isSolved: true };
  
  if (difficulty) {
    filter.difficulty = difficulty;
  }
  
  if (puzzleSize) {
    filter.puzzleSize = puzzleSize;
  }
  
  return this.find(filter)
    .sort({ score: -1, moves: 1, timeElapsed: 1 })
    .limit(limit)
    .populate('userId', 'username email')
    .select('score moves timeElapsed difficulty puzzleSize rating playerName userId createdAt');
};

slidingPuzzleSessionSchema.statics.getTopScores = function(limit: number = 100) {
  return this.find({ isCompleted: true, isSolved: true })
    .sort({ score: -1 })
    .limit(limit)
    .select('score moves timeElapsed difficulty puzzleSize playerName userId createdAt');
};

slidingPuzzleSessionSchema.statics.getUserStats = function(userId: string) {
  return this.aggregate([
    { 
      $match: { 
        userId: new mongoose.Types.ObjectId(userId),
        isCompleted: true
      }
    },
    {
      $group: {
        _id: null,
        totalGames: { $sum: 1 },
        solvedGames: { 
          $sum: { $cond: [{ $eq: ['$isSolved', true] }, 1, 0] }
        },
        averageScore: { $avg: '$score' },
        highestScore: { $max: '$score' },
        averageMoves: { $avg: '$moves' },
        bestMoves: { $min: '$moves' },
        averageTime: { $avg: '$timeElapsed' },
        bestTime: { $min: '$timeElapsed' },
        averageMoveEfficiency: { $avg: '$moveEfficiency' },
        averageTimeEfficiency: { $avg: '$timeEfficiency' }
      }
    },
    {
      $project: {
        totalGames: 1,
        solvedGames: 1,
        completionRate: {
          $round: [
            { $multiply: [{ $divide: ['$solvedGames', '$totalGames'] }, 100] },
            1
          ]
        },
        averageScore: { $round: ['$averageScore', 0] },
        highestScore: 1,
        averageMoves: { $round: ['$averageMoves', 0] },
        bestMoves: 1,
        averageTime: { $round: ['$averageTime', 0] },
        bestTime: 1,
        averageMoveEfficiency: { $round: ['$averageMoveEfficiency', 1] },
        averageTimeEfficiency: { $round: ['$averageTimeEfficiency', 1] }
      }
    }
  ]);
};

slidingPuzzleSessionSchema.statics.getDifficultyStats = function() {
  return this.aggregate([
    { $match: { isCompleted: true } },
    {
      $group: {
        _id: '$difficulty',
        totalGames: { $sum: 1 },
        solvedGames: { 
          $sum: { $cond: [{ $eq: ['$isSolved', true] }, 1, 0] }
        },
        averageScore: { $avg: '$score' },
        averageMoves: { $avg: '$moves' },
        averageTime: { $avg: '$timeElapsed' }
      }
    },
    {
      $project: {
        difficulty: '$_id',
        totalGames: 1,
        solvedGames: 1,
        completionRate: {
          $round: [
            { $multiply: [{ $divide: ['$solvedGames', '$totalGames'] }, 100] },
            1
          ]
        },
        averageScore: { $round: ['$averageScore', 0] },
        averageMoves: { $round: ['$averageMoves', 0] },
        averageTime: { $round: ['$averageTime', 0] }
      }
    },
    { $sort: { difficulty: 1 } }
  ]);
};

// Instance methods
slidingPuzzleSessionSchema.methods.addMove = function(
  fromPosition: number,
  toPosition: number,
  tileNumber: number,
  newState: number[]
) {
  this.moves += 1;
  this.currentState = newState;
  
  // Add to move history
  this.moveHistory.push({
    fromPosition,
    toPosition,
    tileNumber,
    moveNumber: this.moves,
    timestamp: new Date()
  });
  
  return this.save();
};

slidingPuzzleSessionSchema.methods.completeGame = function(
  finalScore?: number,
  rating?: SlidingPuzzleRating,
  isSolved: boolean = false
) {
  this.isCompleted = true;
  this.isSolved = isSolved;
  this.endTime = new Date();
  
  if (finalScore !== undefined) {
    this.score = finalScore;
  }
  
  if (rating) {
    this.rating = rating;
  }
  
  return this.save();
};

slidingPuzzleSessionSchema.methods.useHint = function() {
  this.hintsUsed += 1;
  return this.save();
};

// Create and export the model
const SlidingPuzzleSession = mongoose.models.SlidingPuzzleSession || 
  mongoose.model('SlidingPuzzleSession', slidingPuzzleSessionSchema);

export default SlidingPuzzleSession;
export type { SlidingPuzzleDifficulty, SlidingPuzzleRating, ISlidingPuzzleMove };