import mongoose, { Document, Schema } from "mongoose";
import {
  WhackGameSession,
  WhackMole,
  WhackMoleHit,
  WhackPowerUp,
  WhackGameSettings,
  WhackGameStatistics,
  WhackAchievement,
  WhackMolePosition
} from "@/types/games/whack-a-mole";

export interface IWhackSession extends WhackGameSession, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

const WhackMolePositionSchema = new Schema({
  row: {
    type: Number,
    required: true,
    min: 0
  },
  col: {
    type: Number,
    required: true,
    min: 0
  },
  index: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const WhackMoleSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  position: {
    type: WhackMolePositionSchema,
    required: true
  },
  type: {
    type: String,
    enum: ['normal', 'fast', 'slow', 'bonus', 'golden', 'bomb', 'freeze', 'double', 'giant', 'mini'],
    default: 'normal'
  },
  spawnTime: {
    type: Date,
    required: true
  },
  despawnTime: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isHit: {
    type: Boolean,
    default: false
  },
  hitTime: {
    type: Date
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  speed: {
    type: Number,
    required: true,
    min: 100
  },
  size: {
    type: Number,
    default: 1,
    min: 0.1
  },
  color: {
    type: String,
    required: true
  },
  animation: {
    type: String,
    enum: ['popup', 'slide', 'bounce', 'spin', 'fade', 'zoom', 'shake', 'glow'],
    default: 'popup'
  },
  specialEffect: {
    type: String,
    enum: ['sparkle', 'explosion', 'rainbow', 'lightning', 'fire', 'ice', 'star', 'heart']
  }
}, { _id: false });

const WhackMoleHitSchema = new Schema({
  moleId: {
    type: String,
    required: true
  },
  moleType: {
    type: String,
    enum: ['normal', 'fast', 'slow', 'bonus', 'golden', 'bomb', 'freeze', 'double', 'giant', 'mini'],
    required: true
  },
  hitPosition: {
    type: WhackMolePositionSchema,
    required: true
  },
  reactionTime: {
    type: Number,
    required: true,
    min: 0
  },
  accuracy: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  streakCount: {
    type: Number,
    default: 0,
    min: 0
  },
  comboMultiplier: {
    type: Number,
    default: 1,
    min: 1
  },
  isPerfect: {
    type: Boolean,
    default: false
  },
  isSpecial: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const WhackPowerUpSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['slow-motion', 'freeze', 'double-points', 'big-targets', 'auto-hit', 'extra-time', 'score-bonus', 'multi-hit'],
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
  effect: {
    slowMotion: { type: Number },
    freezeMoles: { type: Number },
    doublePoints: { type: Boolean },
    biggerTargets: { type: Number },
    autoHit: { type: Number },
    extraTime: { type: Number },
    scoreBonus: { type: Number }
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  activatedAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: false
  },
  cooldown: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUsed: {
    type: Date
  }
}, { _id: false });

const WhackGameSettingsSchema = new Schema({
  soundEnabled: {
    type: Boolean,
    default: true
  },
  vibrationEnabled: {
    type: Boolean,
    default: false
  },
  showReactionTime: {
    type: Boolean,
    default: true
  },
  showStreakCounter: {
    type: Boolean,
    default: true
  },
  showComboMultiplier: {
    type: Boolean,
    default: true
  },
  highlightMoles: {
    type: Boolean,
    default: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'normal', 'hard', 'expert', 'insane'],
    default: 'normal'
  },
  gameMode: {
    type: String,
    enum: ['classic', 'arcade', 'zen', 'survival', 'time-attack', 'precision', 'endurance', 'chaos'],
    default: 'classic'
  },
  customDuration: {
    type: Number,
    min: 10
  },
  customGridSize: {
    type: Number,
    min: 4,
    max: 16
  },
  enablePowerUps: {
    type: Boolean,
    default: true
  },
  enableSpecialMoles: {
    type: Boolean,
    default: true
  },
  autoRestart: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const WhackGameStatisticsSchema = new Schema({
  accuracy: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  averageReactionTime: {
    type: Number,
    default: 0,
    min: 0
  },
  molesPerSecond: {
    type: Number,
    default: 0,
    min: 0
  },
  scorePerSecond: {
    type: Number,
    default: 0,
    min: 0
  },
  perfectHitRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  consistency: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  efficiency: {
    type: Number,
    default: 0,
    min: 0
  },
  endurance: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  precision: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  focus: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  overallRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  }
}, { _id: false });

const WhackAchievementSchema = new Schema({
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
  category: {
    type: String,
    enum: ['score', 'accuracy', 'speed', 'streak', 'endurance', 'special', 'milestone', 'challenge'],
    required: true
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  unlocked: {
    type: Boolean,
    default: false
  },
  unlockedAt: {
    type: Date
  },
  progress: {
    type: Number,
    min: 0,
    max: 1
  },
  target: {
    type: Number,
    min: 0
  },
  icon: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false });

const WhackSessionSchema = new Schema({
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
  gameMode: {
    type: String,
    enum: ['classic', 'arcade', 'zen', 'survival', 'time-attack', 'precision', 'endurance', 'chaos'],
    default: 'classic',
    index: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'normal', 'hard', 'expert', 'insane'],
    default: 'normal',
    index: true
  },
  gridSize: {
    type: Number,
    required: true,
    min: 4
  },
  duration: {
    type: Number,
    required: true,
    min: 10
  },
  startTime: {
    type: Date,
    default: Date.now,
    index: true
  },
  endTime: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isPaused: {
    type: Boolean,
    default: false
  },
  pausedTime: {
    type: Number,
    default: 0,
    min: 0
  },
  currentScore: {
    type: Number,
    default: 0,
    min: 0,
    index: true
  },
  molesSpawned: {
    type: Number,
    default: 0,
    min: 0
  },
  molesHit: {
    type: Number,
    default: 0,
    min: 0
  },
  molesMissed: {
    type: Number,
    default: 0,
    min: 0
  },
  perfectHits: {
    type: Number,
    default: 0,
    min: 0
  },
  streakCurrent: {
    type: Number,
    default: 0,
    min: 0
  },
  streakBest: {
    type: Number,
    default: 0,
    min: 0,
    index: true
  },
  comboMultiplier: {
    type: Number,
    default: 1,
    min: 1
  },
  totalReactionTime: {
    type: Number,
    default: 0,
    min: 0
  },
  fastestReaction: {
    type: Number,
    default: 0,
    min: 0
  },
  slowestReaction: {
    type: Number,
    default: 0,
    min: 0
  },
  powerUpsUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  specialMolesHit: {
    type: Number,
    default: 0,
    min: 0
  },
  moleHistory: [WhackMoleHitSchema],
  powerUps: [WhackPowerUpSchema],
  settings: {
    type: WhackGameSettingsSchema,
    default: () => ({})
  },
  statistics: {
    type: WhackGameStatisticsSchema,
    default: () => ({})
  },
  achievements: [WhackAchievementSchema]
}, {
  timestamps: true,
  collection: 'whack_sessions'
});

// Indexes
WhackSessionSchema.index({ userId: 1, startTime: -1 });
WhackSessionSchema.index({ gameMode: 1, difficulty: 1 });
WhackSessionSchema.index({ currentScore: -1 });
WhackSessionSchema.index({ 'statistics.accuracy': -1 });
WhackSessionSchema.index({ 'statistics.averageReactionTime': 1 });

// Virtual for game duration
WhackSessionSchema.virtual('gameDuration').get(function() {
  if (!this.endTime || !this.startTime) return null;
  return this.endTime.getTime() - this.startTime.getTime() - this.pausedTime;
});

// Virtual for accuracy percentage
WhackSessionSchema.virtual('accuracyPercentage').get(function() {
  if (this.molesSpawned === 0) return 0;
  return Math.round((this.molesHit / this.molesSpawned) * 100);
});

// Virtual for average reaction time
WhackSessionSchema.virtual('averageReactionTime').get(function() {
  if (this.molesHit === 0) return 0;
  return Math.round(this.totalReactionTime / this.molesHit);
});

// Methods
WhackSessionSchema.methods.addMoleHit = function(hit: WhackMoleHit) {
  this.moleHistory.push(hit);
  this.molesHit += 1;
  this.currentScore += hit.points;
  this.totalReactionTime += hit.reactionTime;
  
  // Update fastest/slowest reaction times
  if (this.fastestReaction === 0 || hit.reactionTime < this.fastestReaction) {
    this.fastestReaction = hit.reactionTime;
  }
  if (hit.reactionTime > this.slowestReaction) {
    this.slowestReaction = hit.reactionTime;
  }
  
  // Update streak
  if (hit.isPerfect) {
    this.perfectHits += 1;
    this.streakCurrent += 1;
    this.streakBest = Math.max(this.streakBest, this.streakCurrent);
  } else {
    this.streakCurrent = 0;
  }
  
  // Update special moles
  if (hit.isSpecial) {
    this.specialMolesHit += 1;
  }
  
  return this.save();
};

WhackSessionSchema.methods.addMoleMiss = function() {
  this.molesMissed += 1;
  this.streakCurrent = 0;
  this.comboMultiplier = 1;
  return this.save();
};

WhackSessionSchema.methods.updateStatistics = function() {
  const totalMoles = this.molesSpawned;
  const hits = this.molesHit;
  
  this.statistics = {
    accuracy: totalMoles > 0 ? hits / totalMoles : 0,
    averageReactionTime: hits > 0 ? this.totalReactionTime / hits : 0,
    molesPerSecond: this.duration > 0 ? totalMoles / this.duration : 0,
    scorePerSecond: this.duration > 0 ? this.currentScore / this.duration : 0,
    perfectHitRate: hits > 0 ? this.perfectHits / hits : 0,
    consistency: this.calculateConsistency(),
    efficiency: totalMoles > 0 ? this.currentScore / totalMoles : 0,
    endurance: this.calculateEndurance(),
    precision: this.calculatePrecision(),
    focus: this.calculateFocus(),
    overallRating: 0 // Will be calculated later
  };
  
  // Calculate overall rating
  this.statistics.overallRating = (
    this.statistics.accuracy * 0.25 +
    this.statistics.perfectHitRate * 0.20 +
    this.statistics.consistency * 0.15 +
    this.statistics.endurance * 0.15 +
    this.statistics.precision * 0.15 +
    this.statistics.focus * 0.10
  );
  
  return this.save();
};

WhackSessionSchema.methods.calculateConsistency = function() {
  const reactionTimes = this.moleHistory.map((hit: WhackMoleHit) => hit.reactionTime);
  if (reactionTimes.length < 2) return 1.0;
  
  const mean = reactionTimes.reduce((sum: number, time: number) => sum + time, 0) / reactionTimes.length;
  const variance = reactionTimes.reduce((sum: number, time: number) => sum + Math.pow(time - mean, 2), 0) / reactionTimes.length;
  const stdDev = Math.sqrt(variance);
  
  return Math.max(0, 1 - (stdDev / mean));
};

WhackSessionSchema.methods.calculateEndurance = function() {
  if (this.moleHistory.length < 5) return 1.0;
  
  const firstQuarter = this.moleHistory.slice(0, Math.floor(this.moleHistory.length / 4));
  const lastQuarter = this.moleHistory.slice(-Math.floor(this.moleHistory.length / 4));
  
  const firstAvgReaction = firstQuarter.reduce((sum: number, hit: WhackMoleHit) => sum + hit.reactionTime, 0) / firstQuarter.length;
  const lastAvgReaction = lastQuarter.reduce((sum: number, hit: WhackMoleHit) => sum + hit.reactionTime, 0) / lastQuarter.length;
  
  return Math.max(0, 1 - ((lastAvgReaction - firstAvgReaction) / firstAvgReaction));
};

WhackSessionSchema.methods.calculatePrecision = function() {
  const accuracyScores = this.moleHistory.map((hit: WhackMoleHit) => hit.accuracy);
  if (accuracyScores.length === 0) return 0;
  
  return accuracyScores.reduce((sum: number, acc: number) => sum + acc, 0) / accuracyScores.length;
};

WhackSessionSchema.methods.calculateFocus = function() {
  if (this.molesHit === 0) return 0;
  return this.streakBest / this.molesHit;
};

WhackSessionSchema.methods.pauseGame = function() {
  if (!this.isPaused && this.isActive) {
    this.isPaused = true;
    return this.save();
  }
  return this;
};

WhackSessionSchema.methods.resumeGame = function() {
  if (this.isPaused && this.isActive) {
    this.isPaused = false;
    return this.save();
  }
  return this;
};

WhackSessionSchema.methods.endGame = function() {
  this.isActive = false;
  this.endTime = new Date();
  this.updateStatistics();
  return this.save();
};

// Static methods
WhackSessionSchema.statics.findActiveSession = function(userId: string) {
  return this.findOne({ userId, isActive: true });
};

WhackSessionSchema.statics.getUserStats = function(userId: string) {
  return this.aggregate([
    { $match: { userId, isActive: false } },
    {
      $group: {
        _id: "$userId",
        totalSessions: { $sum: 1 },
        totalScore: { $sum: "$currentScore" },
        averageScore: { $avg: "$currentScore" },
        bestScore: { $max: "$currentScore" },
        totalMolesHit: { $sum: "$molesHit" },
        totalMolesSpawned: { $sum: "$molesSpawned" },
        averageAccuracy: { $avg: "$statistics.accuracy" },
        bestAccuracy: { $max: "$statistics.accuracy" },
        averageReactionTime: { $avg: "$statistics.averageReactionTime" },
        fastestReaction: { $min: "$fastestReaction" },
        longestStreak: { $max: "$streakBest" },
        totalPlayTime: { $sum: "$duration" }
      }
    }
  ]);
};

WhackSessionSchema.statics.getLeaderboard = function(
  gameMode: string = 'classic',
  difficulty: string = 'normal',
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'all-time',
  limit: number = 10
) {
  const now = new Date();
  let matchStage: any = { 
    gameMode, 
    difficulty, 
    isActive: false 
  };
  
  if (timeframe !== 'all-time') {
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
    matchStage.startTime = { $gte: startDate! };
  }
  
  return this.aggregate([
    { $match: matchStage },
    { $sort: { currentScore: -1, streakBest: -1, 'statistics.averageReactionTime': 1 } },
    { $limit: limit },
    {
      $project: {
        userId: 1,
        currentScore: 1,
        'statistics.accuracy': 1,
        'statistics.averageReactionTime': 1,
        streakBest: 1,
        startTime: 1,
        duration: 1
      }
    }
  ]);
};

// Pre-save middleware
WhackSessionSchema.pre('save', function(next) {
  if (this.isNew) {
    // Generate session ID if not provided
    if (!this.sessionId) {
      this.sessionId = `whack_${this.userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }
  
  next();
});

// Post-save middleware
WhackSessionSchema.post('save', function(doc) {
  // Check for achievements
  // checkAchievements(doc);
});

export const WhackSession = mongoose.models.WhackSession || 
  mongoose.model<IWhackSession>('WhackSession', WhackSessionSchema);