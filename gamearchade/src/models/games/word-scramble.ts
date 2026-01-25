// Word Scramble Game MongoDB Model
import mongoose, { Schema, Document } from 'mongoose';
import {
  WordScrambleGameSession as IWordScrambleGameSession,
  WordScrambleAttempt,
  WordScramblePowerUp,
  WordScrambleWord,
  WordScrambleDifficulty,
  WordScrambleGameMode,
  WordScrambleCategory
} from '@/types/games/word-scramble';

// Word Schema
const wordSchema = new Schema<WordScrambleWord>({
  id: { type: Number, required: true },
  original: { type: String, required: true },
  scrambled: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['programming', 'science', 'animals', 'countries', 'technology', 'general', 'mixed'] as WordScrambleCategory[],
    required: true 
  },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard', 'expert', 'insane'] as WordScrambleDifficulty[],
    required: true 
  },
  hints: [{ type: String, default: [] }],
  definition: { type: String },
  length: { type: Number, required: true },
  points: { type: Number, required: true }
});

// Attempt Schema
const attemptSchema = new Schema<WordScrambleAttempt>({
  word: { type: String, required: true },
  guess: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  reactionTime: { type: Number, required: true },
  hintsUsed: { type: Number, default: 0 },
  score: { type: Number, required: true },
  timestamp: { type: Date, required: true },
  attemptsCount: { type: Number, required: true }
});

// Power-up Schema
const powerUpSchema = new Schema<WordScramblePowerUp>({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['reveal-letter', 'extra-time', 'double-points', 'hint-boost', 'skip-word'],
    required: true 
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number },
  effect: { type: Number, required: true },
  cost: { type: Number, required: true },
  isActive: { type: Boolean, default: false },
  usesRemaining: { type: Number }
});

// Main Game Session Schema
const wordScrambleGameSessionSchema = new Schema<IWordScrambleGameSession>({
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
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard', 'expert', 'insane'] as WordScrambleDifficulty[],
    required: true,
    index: true
  },
  gameMode: { 
    type: String, 
    enum: ['classic', 'timed', 'streak', 'marathon', 'blitz', 'zen'] as WordScrambleGameMode[],
    required: true,
    index: true
  },
  category: { 
    type: String, 
    enum: ['programming', 'science', 'animals', 'countries', 'technology', 'general', 'mixed'] as WordScrambleCategory[],
    required: true,
    index: true
  },
  
  // Game State
  currentWord: wordSchema,
  currentWordIndex: { type: Number, default: 0 },
  totalWords: { type: Number, required: true },
  wordsCompleted: { type: Number, default: 0 },
  currentScore: { type: Number, default: 0 },
  
  // Timing
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  timeRemaining: { type: Number },
  totalDuration: { type: Number, default: 0 }, // in seconds, 0 = unlimited
  isPaused: { type: Boolean, default: false },
  pausedAt: { type: Date },
  
  // Performance Metrics
  totalGuesses: { type: Number, default: 0 },
  correctGuesses: { type: Number, default: 0 },
  incorrectGuesses: { type: Number, default: 0 },
  accuracy: { type: Number, default: 1.0 },
  averageReactionTime: { type: Number, default: 0 },
  fastestSolve: { type: Number, default: 0 },
  slowestSolve: { type: Number, default: 0 },
  
  // Streaks and Bonuses
  currentStreak: { type: Number, default: 0 },
  maxStreak: { type: Number, default: 0 },
  perfectWords: { type: Number, default: 0 },
  oneGuessWords: { type: Number, default: 0 },
  
  // Power-ups and Hints
  activePowerUps: [powerUpSchema],
  totalHintsUsed: { type: Number, default: 0 },
  maxHints: { type: Number, default: 3 },
  
  // Progress
  isCompleted: { type: Boolean, default: false },
  completionPercentage: { type: Number, default: 0 },
  finalRating: { type: String, default: '' },
  achievements: [{ type: String, default: [] }],
  
  // Advanced Features
  categoryStats: { 
    type: Map, 
    of: Number,
    default: new Map() 
  },
  difficultyProgression: { type: Boolean, default: false },
  bonusMultiplier: { type: Number, default: 1.0 },
  consistencyScore: { type: Number, default: 0 },
  
  // Attempts tracking
  attempts: [attemptSchema],
  
  // Word history
  completedWords: [wordSchema],
  skippedWords: [{ type: String, default: [] }]
}, {
  timestamps: true,
  collection: 'word_scramble_sessions'
});

// Indexes for performance
wordScrambleGameSessionSchema.index({ userId: 1, createdAt: -1 });
wordScrambleGameSessionSchema.index({ difficulty: 1, gameMode: 1, category: 1 });
wordScrambleGameSessionSchema.index({ isCompleted: 1, currentScore: -1 });
wordScrambleGameSessionSchema.index({ sessionId: 1, isCompleted: 1 });

// Virtual for game duration
wordScrambleGameSessionSchema.virtual('actualDuration').get(function() {
  if (this.endTime && this.startTime) {
    return Math.round((this.endTime.getTime() - this.startTime.getTime()) / 1000);
  }
  return 0;
});

// Virtual for completion status
wordScrambleGameSessionSchema.virtual('isTimeExpired').get(function() {
  if (this.totalDuration <= 0) return false;
  const elapsed = (Date.now() - this.startTime.getTime()) / 1000;
  return !this.isPaused && elapsed >= this.totalDuration;
});

// Virtual for success rate
wordScrambleGameSessionSchema.virtual('successRate').get(function() {
  const totalCompleted = this.completedWords.length;
  const totalAttempted = totalCompleted + this.skippedWords.length;
  return totalAttempted > 0 ? totalCompleted / totalAttempted : 0;
});

// Methods
wordScrambleGameSessionSchema.methods.addCorrectGuess = function(
  word: WordScrambleWord, 
  score: number, 
  reactionTime: number
) {
  this.correctGuesses += 1;
  this.wordsCompleted += 1;
  this.currentScore += score;
  this.currentStreak += 1;
  this.maxStreak = Math.max(this.maxStreak, this.currentStreak);
  
  // Update reaction times
  if (this.fastestSolve === 0 || reactionTime < this.fastestSolve) {
    this.fastestSolve = reactionTime;
  }
  if (reactionTime > this.slowestSolve) {
    this.slowestSolve = reactionTime;
  }
  
  // Update average reaction time
  const totalReactionTime = this.averageReactionTime * (this.correctGuesses - 1) + reactionTime;
  this.averageReactionTime = totalReactionTime / this.correctGuesses;
  
  // Add to completed words
  this.completedWords.push(word);
  
  return true;
};

wordScrambleGameSessionSchema.methods.addIncorrectGuess = function() {
  this.incorrectGuesses += 1;
  this.currentStreak = 0; // Reset streak on wrong guess
  return true;
};

wordScrambleGameSessionSchema.methods.useHint = function(cost: number = 0) {
  if (this.totalHintsUsed < this.maxHints) {
    this.totalHintsUsed += 1;
    if (cost > 0) {
      this.currentScore = Math.max(0, this.currentScore - cost);
    }
    return true;
  }
  return false;
};

wordScrambleGameSessionSchema.methods.skipWord = function(word: string, penalty: number = 0) {
  this.skippedWords.push(word);
  this.currentStreak = 0; // Reset streak on skip
  this.wordsCompleted += 1;
  
  if (penalty > 0) {
    this.currentScore = Math.max(0, this.currentScore - penalty);
  }
  
  return true;
};

wordScrambleGameSessionSchema.methods.pauseGame = function() {
  if (!this.isPaused && !this.isCompleted) {
    this.isPaused = true;
    this.pausedAt = new Date();
    return true;
  }
  return false;
};

wordScrambleGameSessionSchema.methods.resumeGame = function() {
  if (this.isPaused && !this.isCompleted) {
    this.isPaused = false;
    this.pausedAt = undefined;
    return true;
  }
  return false;
};

wordScrambleGameSessionSchema.methods.calculateCurrentAccuracy = function() {
  if (this.totalGuesses > 0) {
    this.accuracy = this.correctGuesses / this.totalGuesses;
  }
  return this.accuracy;
};

wordScrambleGameSessionSchema.methods.getPerformanceRating = function() {
  const accuracyScore = this.accuracy;
  const completionScore = this.totalWords > 0 ? 
    this.wordsCompleted / this.totalWords : 0;
  const speedScore = this.averageReactionTime > 0 ? 
    Math.max(0, 1 - (this.averageReactionTime - 3000) / 10000) : 0;
  const streakScore = Math.min(1, this.maxStreak / 10);
  
  const overallScore = (accuracyScore * 0.3) + (completionScore * 0.3) + 
                      (speedScore * 0.25) + (streakScore * 0.15);
  
  if (overallScore >= 0.9) return 'Master';
  if (overallScore >= 0.8) return 'Expert';
  if (overallScore >= 0.7) return 'Advanced';
  if (overallScore >= 0.6) return 'Intermediate';
  if (overallScore >= 0.5) return 'Beginner';
  return 'Novice';
};

// Static methods
wordScrambleGameSessionSchema.statics.findActiveByUser = function(userId: string) {
  return this.find({ 
    userId, 
    isCompleted: false 
  }).sort({ startTime: -1 });
};

wordScrambleGameSessionSchema.statics.getLeaderboard = function(
  difficulty?: WordScrambleDifficulty,
  gameMode?: WordScrambleGameMode,
  category?: WordScrambleCategory,
  limit: number = 10
) {
  const query: any = { isCompleted: true };
  if (difficulty) query.difficulty = difficulty;
  if (gameMode) query.gameMode = gameMode;
  if (category) query.category = category;
  
  return this.find(query)
    .sort({ currentScore: -1, accuracy: -1, averageReactionTime: 1 })
    .limit(limit)
    .select('userId currentScore wordsCompleted accuracy averageReactionTime maxStreak difficulty gameMode category createdAt');
};

wordScrambleGameSessionSchema.statics.getUserStats = function(userId: string) {
  return this.aggregate([
    { $match: { userId, isCompleted: true } },
    {
      $group: {
        _id: null,
        totalGames: { $sum: 1 },
        totalScore: { $sum: '$currentScore' },
        totalWords: { $sum: '$wordsCompleted' },
        avgScore: { $avg: '$currentScore' },
        maxScore: { $max: '$currentScore' },
        avgAccuracy: { $avg: '$accuracy' },
        maxStreak: { $max: '$maxStreak' },
        avgReactionTime: { $avg: '$averageReactionTime' },
        totalPlayTime: { $sum: '$actualDuration' }
      }
    }
  ]);
};

wordScrambleGameSessionSchema.statics.getCategoryStats = function(
  userId?: string,
  difficulty?: WordScrambleDifficulty
) {
  const match: any = { isCompleted: true };
  if (userId) match.userId = userId;
  if (difficulty) match.difficulty = difficulty;
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$category',
        games: { $sum: 1 },
        avgScore: { $avg: '$currentScore' },
        avgAccuracy: { $avg: '$accuracy' },
        avgReactionTime: { $avg: '$averageReactionTime' },
        totalWords: { $sum: '$wordsCompleted' }
      }
    },
    { $sort: { avgScore: -1 } }
  ]);
};

// Pre-save middleware
wordScrambleGameSessionSchema.pre('save', function(next) {
  // Update completion percentage
  if (this.totalWords > 0) {
    this.completionPercentage = Math.round((this.wordsCompleted / this.totalWords) * 100);
  }
  
  // Calculate current accuracy
  this.calculateCurrentAccuracy();
  
  // Auto-complete if all words are done
  if (this.wordsCompleted >= this.totalWords && !this.isCompleted) {
    this.isCompleted = true;
    this.endTime = new Date();
  }
  
  next();
});

// Ensure model is only compiled once
export const WordScrambleGameSession = 
  mongoose.models.WordScrambleGameSession || 
  mongoose.model<IWordScrambleGameSession>('WordScrambleGameSession', wordScrambleGameSessionSchema);