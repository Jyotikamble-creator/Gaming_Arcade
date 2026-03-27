// Word Builder Game MongoDB Model
import mongoose, { Schema, Document } from 'mongoose';

// Local type definitions
type WordBuilderAttempt = {
  word: string;
  isValid: boolean;
  score: number;
  reactionTime: number;
  timestamp: Date;
  bonusMultiplier: number;
  letterCount: number;
};

type WordBuilderPowerUp = {
  id: string;
  type: 'hint' | 'extra-time' | 'score-boost' | 'reveal-word' | 'shuffle-letters';
  name: string;
  description: string;
  duration?: number;
  effect: number;
  cost: number;
  isActive: boolean;
};

type WordBuilderDifficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'master';
type WordBuilderGameMode = 'classic' | 'timed' | 'endless' | 'puzzle' | 'challenge';

interface IWordBuilderGameSession extends Document {
  sessionId: string;
  userId: string;
  challengeId: number;
  difficulty: WordBuilderDifficulty;
  gameMode: WordBuilderGameMode;
  letters: string[];
  foundWords: string[];
  currentScore: number;
  wordsFound: number;
  targetWordsCount: number;
  startTime: Date;
  endTime?: Date;
  timeRemaining?: number;
  totalDuration: number;
  isPaused: boolean;
  pausedAt?: Date;
  averageWordTime: number;
  longestWord: string;
  shortestWord: string;
  wordsPerMinute: number;
  accuracy: number;
  perfectWords: number;
  activePowerUps: WordBuilderPowerUp[];
  hintsUsed: number;
  maxHints: number;
  comboStreak: number;
  maxComboStreak: number;
  isCompleted: boolean;
  completionPercentage: number;
  finalRating: string;
  achievements: string[];
  letterUsageStats: Map<string, number>;
  wordLengthDistribution: Map<string, number>;
  categoryBonus: number;
  consistencyRating: number;
  attempts: WordBuilderAttempt[];
}

// Attempt Schema
const attemptSchema = new Schema({
  word: { type: String, required: true },
  isValid: { type: Boolean, required: true },
  score: { type: Number, required: true },
  reactionTime: { type: Number, required: true },
  timestamp: { type: Date, required: true },
  bonusMultiplier: { type: Number, default: 1 },
  letterCount: { type: Number, required: true }
});

// Power-up Schema
const powerUpSchema = new Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['hint', 'extra-time', 'score-boost', 'reveal-word', 'shuffle-letters'],
    required: true 
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number },
  effect: { type: Number, required: true },
  cost: { type: Number, required: true },
  isActive: { type: Boolean, default: false }
});

// Main Game Session Schema
const wordBuilderGameSessionSchema = new Schema({
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
  challengeId: { 
    type: Number, 
    required: true,
    index: true
  },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard', 'expert', 'master'],
    required: true,
    index: true
  },
  gameMode: { 
    type: String, 
    enum: ['classic', 'timed', 'endless', 'puzzle', 'challenge'],
    required: true,
    index: true
  },
  
  // Game State
  letters: [{ type: String, required: true }],
  foundWords: [{ type: String, default: [] }],
  currentScore: { type: Number, default: 0 },
  wordsFound: { type: Number, default: 0 },
  targetWordsCount: { type: Number, required: true },
  
  // Timing
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  timeRemaining: { type: Number },
  totalDuration: { type: Number, default: 0 },
  isPaused: { type: Boolean, default: false },
  pausedAt: { type: Date },
  
  // Performance Metrics
  averageWordTime: { type: Number, default: 0 },
  longestWord: { type: String, default: '' },
  shortestWord: { type: String, default: '' },
  wordsPerMinute: { type: Number, default: 0 },
  accuracy: { type: Number, default: 1.0 },
  perfectWords: { type: Number, default: 0 },
  
  // Power-ups and Bonuses
  activePowerUps: [powerUpSchema],
  hintsUsed: { type: Number, default: 0 },
  maxHints: { type: Number, default: 3 },
  comboStreak: { type: Number, default: 0 },
  maxComboStreak: { type: Number, default: 0 },
  
  // Progress
  isCompleted: { type: Boolean, default: false },
  completionPercentage: { type: Number, default: 0 },
  finalRating: { type: String, default: '' },
  achievements: [{ type: String, default: [] }],
  
  // Advanced Features
  letterUsageStats: { 
    type: Map, 
    of: Number,
    default: new Map() 
  },
  wordLengthDistribution: { 
    type: Map, 
    of: Number,
    default: new Map() 
  },
  categoryBonus: { type: Number, default: 0 },
  consistencyRating: { type: Number, default: 0 },
  
  // Attempts tracking
  attempts: [attemptSchema]
}, {
  timestamps: true,
  collection: 'word_builder_sessions'
});

// Indexes for performance
wordBuilderGameSessionSchema.index({ userId: 1, createdAt: -1 });
wordBuilderGameSessionSchema.index({ difficulty: 1, gameMode: 1 });
wordBuilderGameSessionSchema.index({ isCompleted: 1, currentScore: -1 });
wordBuilderGameSessionSchema.index({ sessionId: 1, isCompleted: 1 });

// Virtual for game duration
wordBuilderGameSessionSchema.virtual('actualDuration').get(function(this: any) {
  if (this.endTime && this.startTime) {
    return Math.round(((this.endTime as Date).getTime() - (this.startTime as Date).getTime()) / 1000);
  }
  return 0;
});

// Virtual for completion status
wordBuilderGameSessionSchema.virtual('isTimeExpired').get(function(this: any) {
  if (this.totalDuration <= 0) return false;
  const elapsed = (Date.now() - (this.startTime as Date).getTime()) / 1000;
  return !this.isPaused && elapsed >= this.totalDuration;
});

// Virtual for words per minute calculation
wordBuilderGameSessionSchema.virtual('currentWordsPerMinute').get(function(this: any) {
  if (this.startTime && this.wordsFound > 0) {
    const elapsed = (Date.now() - (this.startTime as Date).getTime()) / 1000 / 60;
    return Math.round((this.wordsFound / elapsed) * 10) / 10;
  }
  return 0;
});

// Methods
wordBuilderGameSessionSchema.methods.addFoundWord = function(word: string, score: number) {
  if (!this.foundWords.includes(word.toUpperCase())) {
    this.foundWords.push(word.toUpperCase());
    this.wordsFound += 1;
    this.currentScore += score;
    this.comboStreak += 1;
    this.maxComboStreak = Math.max(this.maxComboStreak, this.comboStreak);
    
    // Update word length tracking
    if (!this.longestWord || word.length > this.longestWord.length) {
      this.longestWord = word;
    }
    if (!this.shortestWord || word.length < this.shortestWord.length) {
      this.shortestWord = word;
    }
    
    return true;
  }
  return false;
};

wordBuilderGameSessionSchema.methods.useHint = function() {
  if (this.hintsUsed < this.maxHints) {
    this.hintsUsed += 1;
    return true;
  }
  return false;
};

wordBuilderGameSessionSchema.methods.pauseGame = function() {
  if (!this.isPaused && !this.isCompleted) {
    this.isPaused = true;
    this.pausedAt = new Date();
    return true;
  }
  return false;
};

wordBuilderGameSessionSchema.methods.resumeGame = function() {
  if (this.isPaused && !this.isCompleted) {
    this.isPaused = false;
    this.pausedAt = undefined;
    return true;
  }
  return false;
};

wordBuilderGameSessionSchema.methods.calculateCurrentAccuracy = function() {
  if (this.attempts && this.attempts.length > 0) {
    const validAttempts = this.attempts.filter((a: WordBuilderAttempt) => a.isValid).length;
    this.accuracy = validAttempts / this.attempts.length;
  }
  return this.accuracy;
};

wordBuilderGameSessionSchema.methods.getPerformanceRating = function() {
  const accuracyScore = this.accuracy;
  const completionScore = this.targetWordsCount > 0 ? 
    this.wordsFound / this.targetWordsCount : 0;
  const speedScore = this.averageWordTime > 0 ? 
    Math.max(0, 1 - (this.averageWordTime - 5) / 15) : 0;
  
  const overallScore = (accuracyScore * 0.3) + (completionScore * 0.4) + (speedScore * 0.3);
  
  if (overallScore >= 0.9) return 'Master';
  if (overallScore >= 0.8) return 'Expert';
  if (overallScore >= 0.7) return 'Advanced';
  if (overallScore >= 0.6) return 'Intermediate';
  if (overallScore >= 0.5) return 'Beginner';
  return 'Novice';
};

// Static methods
wordBuilderGameSessionSchema.statics.findActiveByUser = function(this: any, userId: string) {
  return this.find({ 
    userId, 
    isCompleted: false 
  }).sort({ startTime: -1 });
};

wordBuilderGameSessionSchema.statics.getLeaderboard = function(this: any, difficulty?: WordBuilderDifficulty, gameMode?: WordBuilderGameMode, limit: number = 10) {
  const query: any = { isCompleted: true };
  if (difficulty) query.difficulty = difficulty;
  if (gameMode) query.gameMode = gameMode;
  
  return this.find(query)
    .sort({ currentScore: -1, completionPercentage: -1 })
    .limit(limit)
    .select('userId currentScore wordsFound accuracy completionPercentage finalRating difficulty gameMode createdAt');
};

wordBuilderGameSessionSchema.statics.getUserStats = function(this: any, userId: string) {
  return this.aggregate([
    { $match: { userId, isCompleted: true } },
    {
      $group: {
        _id: null,
        totalGames: { $sum: 1 },
        totalScore: { $sum: '$currentScore' },
        totalWords: { $sum: '$wordsFound' },
        avgScore: { $avg: '$currentScore' },
        maxScore: { $max: '$currentScore' },
        avgAccuracy: { $avg: '$accuracy' },
        maxStreak: { $max: '$maxComboStreak' },
        totalPlayTime: { $sum: '$actualDuration' }
      }
    }
  ]);
};

// Pre-save middleware
wordBuilderGameSessionSchema.pre('save', function(this: any, next: any) {
  // Update completion percentage
  if (this.targetWordsCount > 0) {
    this.completionPercentage = Math.round((this.wordsFound / this.targetWordsCount) * 100);
  }
  
  // Calculate current accuracy
  this.calculateCurrentAccuracy();
  
  // Auto-complete if all words found
  if (this.wordsFound >= this.targetWordsCount && !this.isCompleted) {
    this.isCompleted = true;
    this.endTime = new Date();
  }
  
  next();
});

// Ensure model is only compiled once
export const WordBuilderGameSession = 
  mongoose.models.WordBuilderGameSession || 
  mongoose.model('WordBuilderGameSession', wordBuilderGameSessionSchema);