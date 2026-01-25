import mongoose from 'mongoose';
import type { 
  SudokuDifficulty,
  SudokuBoard,
  ISudokuMove
} from '@/types/games/sudoku';

/**
 * Sudoku Session Schema
 * Stores Sudoku game sessions and results in MongoDB
 */
const sudokuSessionSchema = new mongoose.Schema({
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
  
  // Puzzle information
  puzzleId: {
    type: String,
    required: true,
    index: true
  },
  
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    default: 'medium'
  },
  
  // Board states
  initialPuzzle: {
    type: [[Number]],
    required: true,
    validate: {
      validator: function(board: number[][]) {
        return board.length === 9 && board.every(row => 
          row.length === 9 && row.every(cell => 
            typeof cell === 'number' && cell >= 0 && cell <= 9
          )
        );
      },
      message: 'Board must be a 9x9 array with values 0-9'
    }
  },
  
  currentBoard: {
    type: [[Number]],
    required: true,
    validate: {
      validator: function(board: number[][]) {
        return board.length === 9 && board.every(row => 
          row.length === 9 && row.every(cell => 
            typeof cell === 'number' && cell >= 0 && cell <= 9
          )
        );
      },
      message: 'Board must be a 9x9 array with values 0-9'
    }
  },
  
  solution: {
    type: [[Number]],
    required: true,
    validate: {
      validator: function(board: number[][]) {
        return board.length === 9 && board.every(row => 
          row.length === 9 && row.every(cell => 
            typeof cell === 'number' && cell >= 1 && cell <= 9
          )
        );
      },
      message: 'Solution must be a 9x9 array with values 1-9'
    }
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
  
  // Game state
  isCompleted: {
    type: Boolean,
    default: false
  },
  
  isSolved: {
    type: Boolean,
    default: false
  },
  
  // Game mechanics
  hints: {
    type: Number,
    default: 3
  },
  
  hintsUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  
  mistakes: {
    type: Number,
    default: 0,
    min: 0
  },
  
  maxMistakes: {
    type: Number,
    default: 3
  },
  
  // Performance metrics
  score: {
    type: Number,
    default: 0,
    min: 0
  },
  
  completion: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Move history
  moves: [{
    row: { type: Number, min: 0, max: 8 },
    col: { type: Number, min: 0, max: 8 },
    oldValue: { type: Number, min: 0, max: 9 },
    newValue: { type: Number, min: 0, max: 9 },
    timestamp: { type: Date, default: Date.now },
    moveType: {
      type: String,
      enum: ['fill', 'clear', 'note', 'hint'],
      default: 'fill'
    },
    isCorrect: { type: Boolean, default: true }
  }],
  
  // Configuration
  enableTimer: {
    type: Boolean,
    default: true
  },
  
  enableNotes: {
    type: Boolean,
    default: true
  },
  
  enableValidation: {
    type: Boolean,
    default: true
  },
  
  autoCheckConflicts: {
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
  collection: 'sudoku_sessions'
});

// Compound indexes for efficient queries
sudokuSessionSchema.index({ userId: 1, createdAt: -1 });
sudokuSessionSchema.index({ difficulty: 1, score: -1 });
sudokuSessionSchema.index({ isCompleted: 1, isSolved: 1 });
sudokuSessionSchema.index({ timeElapsed: 1, difficulty: 1 });
sudokuSessionSchema.index({ puzzleId: 1 });

// Virtual for calculated completion percentage
sudokuSessionSchema.virtual('calculatedCompletion').get(function() {
  let filledCells = 0;
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (this.currentBoard[row][col] !== 0) {
        filledCells++;
      }
    }
  }
  return Math.round((filledCells / 81) * 100);
});

// Virtual for calculated accuracy
sudokuSessionSchema.virtual('accuracy').get(function() {
  const correctMoves = this.moves.filter((move: any) => move.isCorrect).length;
  const totalMoves = this.moves.length;
  return totalMoves > 0 ? Math.round((correctMoves / totalMoves) * 100) : 100;
});

// Pre-save middleware to calculate metrics
sudokuSessionSchema.pre('save', function(next) {
  // Calculate time elapsed if endTime is set
  if (this.endTime && this.startTime && !this.timeElapsed) {
    this.timeElapsed = Math.round((this.endTime.getTime() - this.startTime.getTime()) / 1000);
  }
  
  // Calculate completion percentage
  let filledCells = 0;
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (this.currentBoard[row][col] !== 0) {
        filledCells++;
      }
    }
  }
  this.completion = Math.round((filledCells / 81) * 100);
  
  // Check if solved
  if (this.completion === 100) {
    // Verify solution correctness
    let isCorrect = true;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.currentBoard[row][col] !== this.solution[row][col]) {
          isCorrect = false;
          break;
        }
      }
      if (!isCorrect) break;
    }
    
    this.isSolved = isCorrect;
    if (isCorrect && !this.isCompleted) {
      this.isCompleted = true;
      if (!this.endTime) {
        this.endTime = new Date();
      }
    }
  }
  
  next();
});

// Static methods
sudokuSessionSchema.statics.findByUser = function(userId: string, limit: number = 20) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'username email');
};

sudokuSessionSchema.statics.getLeaderboard = function(
  difficulty?: SudokuDifficulty,
  limit: number = 10
) {
  const filter: any = { isCompleted: true, isSolved: true };
  
  if (difficulty) {
    filter.difficulty = difficulty;
  }
  
  return this.find(filter)
    .sort({ score: -1, timeElapsed: 1, hintsUsed: 1 })
    .limit(limit)
    .populate('userId', 'username email')
    .select('score timeElapsed difficulty hintsUsed mistakes completion playerName userId createdAt');
};

sudokuSessionSchema.statics.getTopScores = function(limit: number = 100) {
  return this.find({ isCompleted: true, isSolved: true })
    .sort({ score: -1 })
    .limit(limit)
    .select('score timeElapsed difficulty hintsUsed mistakes playerName userId createdAt');
};

sudokuSessionSchema.statics.getUserStats = function(userId: string) {
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
        bestScore: { $max: '$score' },
        averageTime: { $avg: '$timeElapsed' },
        bestTime: { $min: '$timeElapsed' },
        totalHintsUsed: { $sum: '$hintsUsed' },
        totalMistakes: { $sum: '$mistakes' },
        averageCompletion: { $avg: '$completion' }
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
        bestScore: 1,
        averageTime: { $round: ['$averageTime', 0] },
        bestTime: 1,
        totalHintsUsed: 1,
        totalMistakes: 1,
        averageCompletion: { $round: ['$averageCompletion', 1] }
      }
    }
  ]);
};

sudokuSessionSchema.statics.getDifficultyStats = function() {
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
        averageTime: { $avg: '$timeElapsed' },
        averageHints: { $avg: '$hintsUsed' },
        averageMistakes: { $avg: '$mistakes' }
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
        averageTime: { $round: ['$averageTime', 0] },
        averageHints: { $round: ['$averageHints', 1] },
        averageMistakes: { $round: ['$averageMistakes', 1] }
      }
    },
    { $sort: { difficulty: 1 } }
  ]);
};

// Instance methods
sudokuSessionSchema.methods.addMove = function(move: ISudokuMove) {
  this.moves.push(move);
  
  // Update current board
  this.currentBoard[move.row][move.col] = move.newValue;
  
  // Track mistakes
  if (!move.isCorrect && move.moveType === 'fill') {
    this.mistakes += 1;
  }
  
  // Track hints
  if (move.moveType === 'hint') {
    this.hintsUsed += 1;
  }
  
  return this.save();
};

sudokuSessionSchema.methods.useHint = function(row: number, col: number) {
  if (this.hints <= 0) {
    throw new Error('No hints remaining');
  }
  
  const correctValue = this.solution[row][col];
  
  const hintMove: ISudokuMove = {
    row,
    col,
    oldValue: this.currentBoard[row][col],
    newValue: correctValue,
    timestamp: new Date(),
    moveType: 'hint',
    isCorrect: true
  };
  
  this.hints -= 1;
  return this.addMove(hintMove);
};

sudokuSessionSchema.methods.completeGame = function(
  isSolved: boolean = false,
  finalScore?: number
) {
  this.isCompleted = true;
  this.isSolved = isSolved;
  this.endTime = new Date();
  
  if (finalScore !== undefined) {
    this.score = finalScore;
  }
  
  return this.save();
};

sudokuSessionSchema.methods.calculateScore = function(): number {
  if (!this.isCompleted || !this.isSolved) {
    return 0;
  }
  
  const difficultyMultiplier = {
    easy: 1,
    medium: 1.5,
    hard: 2,
    expert: 3
  };
  
  const baseScore = 1000;
  const timeBonus = Math.max(0, 3600 - this.timeElapsed); // Bonus for speed (up to 1 hour)
  const hintPenalty = this.hintsUsed * 50;
  const mistakePenalty = this.mistakes * 25;
  
  const score = Math.round(
    (baseScore + timeBonus - hintPenalty - mistakePenalty) * 
    difficultyMultiplier[this.difficulty as keyof typeof difficultyMultiplier]
  );
  
  return Math.max(score, 50); // Minimum score
};

// Create and export the model
const SudokuSession = mongoose.models.SudokuSession || 
  mongoose.model('SudokuSession', sudokuSessionSchema);

export default SudokuSession;
export type { SudokuDifficulty, SudokuBoard, ISudokuMove };