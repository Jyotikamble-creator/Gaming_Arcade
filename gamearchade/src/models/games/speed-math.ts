import mongoose from 'mongoose';
// import type { 
//   SpeedMathDifficulty,
//   SpeedMathOperation,
//   ISpeedMathAnswer
// } from '@/types/games/speed-math';

// Local type definitions to avoid import issues
type SpeedMathDifficulty = 'easy' | 'medium' | 'hard';
type SpeedMathOperation = 'addition' | 'subtraction' | 'multiplication' | 'division';
type ISpeedMathAnswer = any;

/**
 * Speed Math Session Schema
 * Stores speed math game sessions and results in MongoDB
 */
const speedMathSessionSchema = new mongoose.Schema({
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
    enum: ['easy', 'medium', 'hard', 'expert'],
    default: 'medium'
  },
  
  operations: [{
    type: String,
    enum: ['+', '-', '*', '/', '^', '√']
  }],
  
  // Game progress
  totalQuestions: {
    type: Number,
    default: 0,
    min: 0
  },
  
  correctAnswers: {
    type: Number,
    default: 0,
    min: 0
  },
  
  incorrectAnswers: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Scoring
  totalScore: {
    type: Number,
    default: 0,
    min: 0
  },
  
  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  
  longestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Timing
  startTime: {
    type: Date,
    default: Date.now
  },
  
  endTime: {
    type: Date
  },
  
  timeElapsed: {
    type: Number,
    default: 0 // in seconds
  },
  
  averageTime: {
    type: Number,
    default: 0 // average time per question
  },
  
  // Game state
  isCompleted: {
    type: Boolean,
    default: false
  },
  
  // Problems and answers
  problems: [{
    question: String,
    answer: Number,
    operation: {
      type: String,
      enum: ['+', '-', '*', '/', '^', '√']
    },
    operand1: Number,
    operand2: Number,
    difficulty: String,
    timeLimit: Number,
    points: Number
  }],
  
  answers: [{
    problemIndex: Number,
    question: String,
    userAnswer: Number,
    correctAnswer: Number,
    isCorrect: Boolean,
    timeElapsed: Number,
    points: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Performance metrics
  accuracy: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  questionsPerMinute: {
    type: Number,
    default: 0
  },
  
  consistency: {
    type: Number,
    default: 0 // Standard deviation of response times
  },
  
  // Operation breakdown
  operationStats: {
    addition: {
      attempts: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      averageTime: { type: Number, default: 0 }
    },
    subtraction: {
      attempts: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      averageTime: { type: Number, default: 0 }
    },
    multiplication: {
      attempts: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      averageTime: { type: Number, default: 0 }
    },
    division: {
      attempts: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      averageTime: { type: Number, default: 0 }
    },
    exponent: {
      attempts: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      averageTime: { type: Number, default: 0 }
    },
    squareRoot: {
      attempts: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      averageTime: { type: Number, default: 0 }
    }
  },
  
  // Configuration
  enableTimer: {
    type: Boolean,
    default: true
  },
  
  timeLimit: {
    type: Number,
    default: 30 // seconds per question
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
  collection: 'speed_math_sessions'
});

// Compound indexes for efficient queries
speedMathSessionSchema.index({ userId: 1, createdAt: -1 });
speedMathSessionSchema.index({ difficulty: 1, totalScore: -1 });
speedMathSessionSchema.index({ isCompleted: 1, totalScore: -1 });
speedMathSessionSchema.index({ accuracy: -1, questionsPerMinute: -1 });

// Virtual for calculated accuracy
speedMathSessionSchema.virtual('calculatedAccuracy').get(function() {
  if (this.totalQuestions === 0) return 0;
  return Math.round((this.correctAnswers / this.totalQuestions) * 100);
});

// Virtual for questions per minute
speedMathSessionSchema.virtual('calculatedQPM').get(function() {
  if (this.timeElapsed === 0) return 0;
  return Math.round((this.totalQuestions / this.timeElapsed) * 60);
});

// Pre-save middleware to calculate metrics
speedMathSessionSchema.pre('save', function(next) {
  // Calculate accuracy
  if (this.totalQuestions > 0) {
    this.accuracy = Math.round((this.correctAnswers / this.totalQuestions) * 100);
  }
  
  // Calculate questions per minute
  if (this.timeElapsed > 0) {
    this.questionsPerMinute = Math.round((this.totalQuestions / this.timeElapsed) * 60);
  }
  
  // Calculate average time per question
  if (this.totalQuestions > 0 && this.timeElapsed > 0) {
    this.averageTime = Math.round(this.timeElapsed / this.totalQuestions);
  }
  
  // Calculate time elapsed if endTime is set
  if (this.endTime && this.startTime && !this.timeElapsed) {
    this.timeElapsed = Math.round((this.endTime.getTime() - this.startTime.getTime()) / 1000);
  }
  
  next();
});

// Static methods
speedMathSessionSchema.statics.findByUser = function(userId: string, limit: number = 20) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'username email');
};

speedMathSessionSchema.statics.getLeaderboard = function(
  difficulty?: SpeedMathDifficulty,
  limit: number = 10
) {
  const filter: any = { isCompleted: true };
  
  if (difficulty) {
    filter.difficulty = difficulty;
  }
  
  return this.find(filter)
    .sort({ totalScore: -1, accuracy: -1, questionsPerMinute: -1 })
    .limit(limit)
    .populate('userId', 'username email')
    .select('totalScore accuracy totalQuestions questionsPerMinute longestStreak difficulty playerName userId createdAt');
};

speedMathSessionSchema.statics.getTopScores = function(limit: number = 100) {
  return this.find({ isCompleted: true })
    .sort({ totalScore: -1 })
    .limit(limit)
    .select('totalScore accuracy totalQuestions difficulty playerName userId createdAt');
};

speedMathSessionSchema.statics.getUserStats = function(userId: string) {
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
        totalSessions: { $sum: 1 },
        totalQuestions: { $sum: '$totalQuestions' },
        totalCorrectAnswers: { $sum: '$correctAnswers' },
        averageScore: { $avg: '$totalScore' },
        highestScore: { $max: '$totalScore' },
        averageAccuracy: { $avg: '$accuracy' },
        averageQPM: { $avg: '$questionsPerMinute' },
        longestStreak: { $max: '$longestStreak' },
        totalTimeSpent: { $sum: '$timeElapsed' }
      }
    },
    {
      $project: {
        totalSessions: 1,
        totalQuestions: 1,
        totalCorrectAnswers: 1,
        averageAccuracy: {
          $round: [
            { $multiply: [{ $divide: ['$totalCorrectAnswers', '$totalQuestions'] }, 100] },
            1
          ]
        },
        averageScore: { $round: ['$averageScore', 0] },
        highestScore: 1,
        averageQPM: { $round: ['$averageQPM', 1] },
        longestStreak: 1,
        totalTimeSpent: 1
      }
    }
  ]);
};

speedMathSessionSchema.statics.getDifficultyStats = function() {
  return this.aggregate([
    { $match: { isCompleted: true } },
    {
      $group: {
        _id: '$difficulty',
        totalSessions: { $sum: 1 },
        averageScore: { $avg: '$totalScore' },
        averageAccuracy: { $avg: '$accuracy' },
        averageQPM: { $avg: '$questionsPerMinute' },
        averageQuestions: { $avg: '$totalQuestions' }
      }
    },
    {
      $project: {
        difficulty: '$_id',
        totalSessions: 1,
        averageScore: { $round: ['$averageScore', 0] },
        averageAccuracy: { $round: ['$averageAccuracy', 1] },
        averageQPM: { $round: ['$averageQPM', 1] },
        averageQuestions: { $round: ['$averageQuestions', 0] }
      }
    },
    { $sort: { difficulty: 1 } }
  ]);
};

// Instance methods
speedMathSessionSchema.methods.addAnswer = function(answer: ISpeedMathAnswer) {
  this.answers.push(answer);
  this.totalQuestions += 1;
  
  if (answer.isCorrect) {
    this.correctAnswers += 1;
    this.currentStreak += 1;
    this.longestStreak = Math.max(this.longestStreak, this.currentStreak);
  } else {
    this.incorrectAnswers += 1;
    this.currentStreak = 0;
  }
  
  this.totalScore += answer.points;
  
  return this.save();
};

speedMathSessionSchema.methods.addProblem = function(problem: any) {
  this.problems.push(problem);
  return this.save();
};

speedMathSessionSchema.methods.completeSession = function(finalScore?: number) {
  this.isCompleted = true;
  this.endTime = new Date();
  
  if (finalScore !== undefined) {
    this.totalScore = finalScore;
  }
  
  return this.save();
};

// Create and export the model
const SpeedMathSession = mongoose.models.SpeedMathSession || 
  mongoose.model('SpeedMathSession', speedMathSessionSchema);

export default SpeedMathSession;
export type { SpeedMathDifficulty, SpeedMathOperation, ISpeedMathAnswer };