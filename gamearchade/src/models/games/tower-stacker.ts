import mongoose, { Document, Schema } from "mongoose";
import {
  TowerStackerGameSession,
  TowerStackerMove,
  TowerStackerBlock,
  TowerStackerAchievement
} from "@/types/games/tower-stacker";

export interface ITowerStackerSession extends TowerStackerGameSession, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

const TowerStackerBlockSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  width: {
    type: Number,
    required: true,
    min: 1,
    max: 200
  },
  position: {
    type: Number,
    required: true
  },
  speed: {
    type: Number,
    required: true,
    min: 0.1
  },
  direction: {
    type: String,
    enum: ['left', 'right'],
    required: true
  },
  color: {
    type: String,
    required: true
  }
}, { _id: false });

const TowerStackerMoveSchema = new Schema({
  level: {
    type: Number,
    required: true,
    min: 1
  },
  dropPosition: {
    type: Number,
    required: true
  },
  targetPosition: {
    type: Number,
    required: true
  },
  accuracy: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  perfectDrop: {
    type: Boolean,
    default: false
  },
  blockWidth: {
    type: Number,
    required: true,
    min: 1
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  timeTaken: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const TowerStackerAchievementSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    required: true
  },
  unlocked: {
    type: Boolean,
    default: false
  },
  unlockedAt: {
    type: Date
  }
}, { _id: false });

const TowerStackerSessionSchema = new Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  currentLevel: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  maxLevel: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  perfectDrops: {
    type: Number,
    default: 0,
    min: 0
  },
  totalDrops: {
    type: Number,
    default: 0,
    min: 0
  },
  score: {
    type: Number,
    default: 0,
    min: 0
  },
  gameState: {
    type: String,
    enum: ['playing', 'completed', 'failed'],
    default: 'playing',
    index: true
  },
  tower: [TowerStackerBlockSchema],
  moves: [TowerStackerMoveSchema],
  startTime: {
    type: Date,
    default: Date.now,
    index: true
  },
  endTime: {
    type: Date
  },
  totalTime: {
    type: Number,
    default: 0,
    min: 0
  },
  averageAccuracy: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  bestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  collection: 'towerstacker_sessions'
});

// Indexes
TowerStackerSessionSchema.index({ userId: 1, startTime: -1 });
TowerStackerSessionSchema.index({ gameState: 1, score: -1 });
TowerStackerSessionSchema.index({ maxLevel: -1, perfectDrops: -1 });
TowerStackerSessionSchema.index({ averageAccuracy: -1 });

// Virtual for completion rate
TowerStackerSessionSchema.virtual('completionRate').get(function() {
  if (this.totalDrops === 0) return 0;
  return this.perfectDrops / this.totalDrops;
});

// Virtual for game duration in seconds
TowerStackerSessionSchema.virtual('gameDurationSeconds').get(function() {
  if (!this.endTime || !this.startTime) return null;
  return Math.floor((this.endTime.getTime() - this.startTime.getTime()) / 1000);
});

// Methods
TowerStackerSessionSchema.methods.updateScore = function(newScore: number) {
  this.score = Math.max(this.score, newScore);
  return this.save();
};

TowerStackerSessionSchema.methods.addMove = function(move: TowerStackerMove) {
  this.moves.push(move);
  this.totalDrops = this.moves.length;
  this.perfectDrops = this.moves.filter(m => m.perfectDrop).length;
  
  // Update accuracy
  if (this.moves.length > 0) {
    this.averageAccuracy = this.moves.reduce((sum, m) => sum + m.accuracy, 0) / this.moves.length;
  }
  
  // Update streak
  if (move.perfectDrop) {
    this.currentStreak += 1;
    this.bestStreak = Math.max(this.bestStreak, this.currentStreak);
  } else {
    this.currentStreak = 0;
  }
  
  return this.save();
};

TowerStackerSessionSchema.methods.completeGame = function() {
  this.gameState = 'completed';
  this.endTime = new Date();
  this.totalTime = this.endTime.getTime() - this.startTime.getTime();
  return this.save();
};

TowerStackerSessionSchema.methods.failGame = function() {
  this.gameState = 'failed';
  this.endTime = new Date();
  this.totalTime = this.endTime.getTime() - this.startTime.getTime();
  return this.save();
};

// Static methods
TowerStackerSessionSchema.statics.findActiveSession = function(userId: string) {
  return this.findOne({ userId, gameState: 'playing' });
};

TowerStackerSessionSchema.statics.getUserStats = function(userId: string) {
  return this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: "$userId",
        totalGames: { $sum: 1 },
        completedGames: {
          $sum: { $cond: [{ $eq: ["$gameState", "completed"] }, 1, 0] }
        },
        bestScore: { $max: "$score" },
        averageScore: { $avg: "$score" },
        highestLevel: { $max: "$maxLevel" },
        totalPerfectDrops: { $sum: "$perfectDrops" },
        totalDrops: { $sum: "$totalDrops" },
        bestAccuracy: { $max: "$averageAccuracy" },
        totalPlayTime: { $sum: "$totalTime" },
        bestTime: { $min: "$totalTime" },
        longestStreak: { $max: "$bestStreak" }
      }
    }
  ]);
};

TowerStackerSessionSchema.statics.getLeaderboard = function(limit: number = 10) {
  return this.find({ gameState: 'completed' })
    .sort({ score: -1, maxLevel: -1, totalTime: 1 })
    .limit(limit)
    .select('userId score maxLevel averageAccuracy perfectDrops totalTime startTime');
};

TowerStackerSessionSchema.statics.getTopPerformers = function(timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly') {
  const now = new Date();
  let startDate: Date;
  
  switch (timeframe) {
    case 'daily':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'weekly':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'monthly':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
  }
  
  return this.find({
    startTime: { $gte: startDate },
    gameState: 'completed'
  })
  .sort({ score: -1 })
  .limit(10);
};

// Pre-save middleware
TowerStackerSessionSchema.pre('save', function(next) {
  if (this.isNew) {
    // Generate session ID if not provided
    if (!this.sessionId) {
      this.sessionId = `ts_${this.userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }
  
  next();
});

// Post-save middleware for achievements
TowerStackerSessionSchema.post('save', function(doc) {
  // Check for achievements (can be implemented later)
  // checkAchievements(doc);
});

export const TowerStackerSession = mongoose.models.TowerStackerSession || 
  mongoose.model<ITowerStackerSession>('TowerStackerSession', TowerStackerSessionSchema);