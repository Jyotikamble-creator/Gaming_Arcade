import mongoose, { Document, Schema } from "mongoose";
import {
  TypingGameSession,
  TypingPassage,
  TypingWord,
  TypingCharacter,
  TypingStatistics,
  TypingMistake,
  TypingGameSettings,
  TypingAchievement
} from "@/types/games/typing";

export interface ITypingSession extends TypingGameSession, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

const TypingCharacterSchema = new Schema({
  char: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['untyped', 'correct', 'incorrect', 'extra'],
    default: 'untyped'
  },
  timestamp: {
    type: Date
  },
  timeTaken: {
    type: Number,
    min: 0
  }
}, { _id: false });

const TypingWordSchema = new Schema({
  word: {
    type: String,
    required: true
  },
  characters: [TypingCharacterSchema],
  isCorrect: {
    type: Boolean,
    default: false
  },
  hasErrors: {
    type: Boolean,
    default: false
  },
  errorCount: {
    type: Number,
    default: 0,
    min: 0
  },
  timeTaken: {
    type: Number,
    required: true,
    min: 0
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  }
}, { _id: false });

const TypingPassageSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert', 'master'],
    required: true
  },
  language: {
    type: String,
    default: 'english'
  },
  category: {
    type: String,
    enum: ['literature', 'technology', 'business', 'science', 'quotes', 'poetry', 'news', 'programming', 'random', 'custom'],
    required: true
  },
  wordCount: {
    type: Number,
    required: true,
    min: 1
  },
  averageWordLength: {
    type: Number,
    required: true,
    min: 1
  },
  commonWords: {
    type: Number,
    default: 0,
    min: 0
  },
  specialCharacters: {
    type: Number,
    default: 0,
    min: 0
  },
  source: {
    type: String
  },
  tags: {
    type: [String],
    default: []
  }
}, { _id: false });

const TypingStatisticsSchema = new Schema({
  wpm: {
    type: Number,
    default: 0,
    min: 0
  },
  netWpm: {
    type: Number,
    default: 0,
    min: 0
  },
  grossWpm: {
    type: Number,
    default: 0,
    min: 0
  },
  accuracy: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  errorRate: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCharacters: {
    type: Number,
    default: 0,
    min: 0
  },
  correctCharacters: {
    type: Number,
    default: 0,
    min: 0
  },
  incorrectCharacters: {
    type: Number,
    default: 0,
    min: 0
  },
  totalWords: {
    type: Number,
    default: 0,
    min: 0
  },
  correctWords: {
    type: Number,
    default: 0,
    min: 0
  },
  incorrectWords: {
    type: Number,
    default: 0,
    min: 0
  },
  extraCharacters: {
    type: Number,
    default: 0,
    min: 0
  },
  missedCharacters: {
    type: Number,
    default: 0,
    min: 0
  },
  totalKeystrokes: {
    type: Number,
    default: 0,
    min: 0
  },
  backspaces: {
    type: Number,
    default: 0,
    min: 0
  },
  timeElapsed: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false });

const TypingMistakeSchema = new Schema({
  position: {
    type: Number,
    required: true,
    min: 0
  },
  expected: {
    type: String,
    required: true
  },
  typed: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  correctionTime: {
    type: Number,
    min: 0
  },
  wordIndex: {
    type: Number,
    required: true,
    min: 0
  },
  characterIndex: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const TypingGameSettingsSchema = new Schema({
  showWpm: {
    type: Boolean,
    default: true
  },
  showAccuracy: {
    type: Boolean,
    default: true
  },
  showTimer: {
    type: Boolean,
    default: true
  },
  showProgress: {
    type: Boolean,
    default: true
  },
  enableSound: {
    type: Boolean,
    default: false
  },
  highlightErrors: {
    type: Boolean,
    default: true
  },
  stopOnError: {
    type: Boolean,
    default: false
  },
  confidenceMode: {
    type: Boolean,
    default: false
  },
  cursorFollowing: {
    type: Boolean,
    default: true
  },
  fontSize: {
    type: Number,
    default: 16,
    min: 10,
    max: 32
  },
  theme: {
    type: String,
    default: 'default'
  },
  keyboardLayout: {
    type: String,
    default: 'qwerty'
  }
}, { _id: false });

const TypingAchievementSchema = new Schema({
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
    enum: ['speed', 'accuracy', 'consistency', 'endurance', 'special'],
    required: true
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
    type: Number
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  }
}, { _id: false });

const TypingSessionSchema = new Schema({
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
  passageId: {
    type: String,
    required: true,
    index: true
  },
  passage: {
    type: TypingPassageSchema,
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now,
    index: true
  },
  endTime: {
    type: Date
  },
  isCompleted: {
    type: Boolean,
    default: false,
    index: true
  },
  isPaused: {
    type: Boolean,
    default: false
  },
  currentPosition: {
    type: Number,
    default: 0,
    min: 0
  },
  typedText: {
    type: String,
    default: ''
  },
  words: [TypingWordSchema],
  characters: [TypingCharacterSchema],
  statistics: {
    type: TypingStatisticsSchema,
    default: () => ({})
  },
  gameMode: {
    type: String,
    enum: ['standard', 'zen', 'timed', 'word-count', 'quote', 'custom'],
    required: true,
    index: true
  },
  timeLimit: {
    type: Number,
    min: 1
  },
  wordLimit: {
    type: Number,
    min: 1
  },
  targetWpm: {
    type: Number,
    min: 1
  },
  settings: {
    type: TypingGameSettingsSchema,
    default: () => ({})
  },
  mistakes: [TypingMistakeSchema],
  achievements: [TypingAchievementSchema]
}, {
  timestamps: true,
  collection: 'typing_sessions'
});

// Indexes
TypingSessionSchema.index({ userId: 1, startTime: -1 });
TypingSessionSchema.index({ gameMode: 1, isCompleted: 1 });
TypingSessionSchema.index({ 'passage.difficulty': 1, 'passage.category': 1 });
TypingSessionSchema.index({ 'statistics.wpm': -1 });
TypingSessionSchema.index({ 'statistics.accuracy': -1 });

// Virtual for completion percentage
TypingSessionSchema.virtual('completionPercentage').get(function() {
  if (!this.passage || !this.passage.text) return 0;
  return Math.round((this.currentPosition / this.passage.text.length) * 100);
});

// Virtual for game duration
TypingSessionSchema.virtual('gameDuration').get(function() {
  if (!this.endTime || !this.startTime) return null;
  return this.endTime.getTime() - this.startTime.getTime();
});

// Virtual for typing speed
TypingSessionSchema.virtual('currentWpm').get(function() {
  const timeElapsed = this.statistics.timeElapsed / 1000 / 60; // Convert to minutes
  if (timeElapsed === 0) return 0;
  
  const wordsTyped = this.typedText.trim().split(' ').length;
  return Math.round(wordsTyped / timeElapsed);
});

// Methods
TypingSessionSchema.methods.updateStatistics = function() {
  const passageText = this.passage.text;
  const typedText = this.typedText;
  
  // Calculate basic statistics
  const totalCharacters = typedText.length;
  const correctCharacters = this.characters.filter(c => c.status === 'correct').length;
  const incorrectCharacters = this.characters.filter(c => c.status === 'incorrect').length;
  const extraCharacters = this.characters.filter(c => c.status === 'extra').length;
  
  const accuracy = totalCharacters > 0 ? correctCharacters / totalCharacters : 0;
  const timeElapsed = this.endTime ? this.endTime.getTime() - this.startTime.getTime() : Date.now() - this.startTime.getTime();
  const timeInMinutes = timeElapsed / 1000 / 60;
  
  // Calculate WPM
  const wordsTyped = typedText.trim().split(' ').filter(word => word.length > 0).length;
  const grossWpm = timeInMinutes > 0 ? wordsTyped / timeInMinutes : 0;
  const netWpm = Math.max(0, grossWpm - (incorrectCharacters / timeInMinutes / 5)); // Standard WPM calculation
  
  this.statistics = {
    wpm: Math.round(netWpm),
    netWpm: Math.round(netWpm),
    grossWpm: Math.round(grossWpm),
    accuracy,
    errorRate: timeInMinutes > 0 ? incorrectCharacters / timeInMinutes : 0,
    totalCharacters,
    correctCharacters,
    incorrectCharacters,
    totalWords: wordsTyped,
    correctWords: this.words.filter(w => w.isCorrect).length,
    incorrectWords: this.words.filter(w => !w.isCorrect).length,
    extraCharacters,
    missedCharacters: Math.max(0, passageText.length - totalCharacters),
    totalKeystrokes: totalCharacters + this.statistics.backspaces || 0,
    backspaces: this.statistics.backspaces || 0,
    timeElapsed
  };
  
  return this.save();
};

TypingSessionSchema.methods.addMistake = function(position: number, expected: string, typed: string) {
  this.mistakes.push({
    position,
    expected,
    typed,
    timestamp: new Date(),
    wordIndex: Math.floor(position / 6), // Approximate word index
    characterIndex: position % 6
  });
  
  return this.save();
};

TypingSessionSchema.methods.completeSession = function() {
  this.isCompleted = true;
  this.endTime = new Date();
  this.updateStatistics();
  return this.save();
};

TypingSessionSchema.methods.pauseSession = function() {
  this.isPaused = true;
  return this.save();
};

TypingSessionSchema.methods.resumeSession = function() {
  this.isPaused = false;
  return this.save();
};

// Static methods
TypingSessionSchema.statics.findActiveSession = function(userId: string) {
  return this.findOne({ userId, isCompleted: false });
};

TypingSessionSchema.statics.getUserStats = function(userId: string) {
  return this.aggregate([
    { $match: { userId, isCompleted: true } },
    {
      $group: {
        _id: "$userId",
        totalSessions: { $sum: 1 },
        averageWpm: { $avg: "$statistics.wpm" },
        bestWpm: { $max: "$statistics.wpm" },
        averageAccuracy: { $avg: "$statistics.accuracy" },
        bestAccuracy: { $max: "$statistics.accuracy" },
        totalTime: { $sum: "$statistics.timeElapsed" },
        totalCharacters: { $sum: "$statistics.totalCharacters" },
        totalWords: { $sum: "$statistics.totalWords" },
        totalMistakes: { $sum: { $size: "$mistakes" } }
      }
    }
  ]);
};

TypingSessionSchema.statics.getLeaderboard = function(timeframe: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'all-time', limit: number = 10) {
  const now = new Date();
  let matchStage: any = { isCompleted: true };
  
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
    {
      $group: {
        _id: "$userId",
        bestWpm: { $max: "$statistics.wpm" },
        bestAccuracy: { $max: "$statistics.accuracy" },
        totalSessions: { $sum: 1 },
        averageWpm: { $avg: "$statistics.wpm" },
        lastSession: { $max: "$startTime" }
      }
    },
    { $sort: { bestWpm: -1, bestAccuracy: -1 } },
    { $limit: limit }
  ]);
};

// Pre-save middleware
TypingSessionSchema.pre('save', function(next) {
  if (this.isNew) {
    // Generate session ID if not provided
    if (!this.sessionId) {
      this.sessionId = `typing_${this.userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }
  
  next();
});

// Post-save middleware
TypingSessionSchema.post('save', function(doc) {
  // Check for achievements (can be implemented later)
  // checkAchievements(doc);
});

export const TypingSession = mongoose.models.TypingSession || 
  mongoose.model<ITypingSession>('TypingSession', TypingSessionSchema);