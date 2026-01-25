// Word Scramble Game Core Logic
import {
  WordScrambleGameSession,
  WordScrambleGameConfig,
  WordScrambleWord,
  WordScrambleDifficulty,
  WordScrambleCategory,
  WordScrambleGameMode,
  WordScrambleHint,
  WordScramblePerformanceMetrics,
  WordGuessStatus,
  ScrambleAlgorithm,
  ScrambleOptions,
  defaultWordBank,
  WORD_SCRAMBLE_CONSTANTS
} from '@/types/games/word-scramble';

/**
 * Generate word sequence for the game
 */
export function generateWordSequence(
  difficulty: WordScrambleDifficulty,
  category: WordScrambleCategory,
  customWords?: string[]
): WordScrambleWord[] {
  let sourceWords: string[];
  
  if (customWords && customWords.length > 0) {
    sourceWords = customWords;
  } else {
    sourceWords = defaultWordBank[difficulty]?.[category] || [];
    
    if (sourceWords.length === 0) {
      // Fallback to mixed category
      sourceWords = defaultWordBank[difficulty]?.mixed || [];
    }
  }
  
  if (sourceWords.length === 0) {
    return [];
  }
  
  // Shuffle and create word objects
  const shuffledWords = shuffleArray([...sourceWords]);
  
  return shuffledWords.map((word, index) => createWordScrambleWord(
    index + 1,
    word,
    difficulty,
    category
  ));
}

/**
 * Create a word scramble word object
 */
export function createWordScrambleWord(
  id: number,
  original: string,
  difficulty: WordScrambleDifficulty,
  category: WordScrambleCategory
): WordScrambleWord {
  const normalizedWord = original.toUpperCase();
  const scrambled = scrambleWord(normalizedWord, { 
    algorithm: 'complex', 
    difficulty,
    minChanges: 2 
  });
  
  // Calculate points based on length and difficulty
  const basePoints = normalizedWord.length * WORD_SCRAMBLE_CONSTANTS.BASE_WORD_SCORE;
  const difficultyMultiplier = WORD_SCRAMBLE_CONSTANTS.DIFFICULTY_MULTIPLIERS[difficulty];
  const points = Math.round(basePoints * difficultyMultiplier);
  
  return {
    id,
    original: normalizedWord,
    scrambled,
    category,
    difficulty,
    hints: generateWordHints(normalizedWord, category),
    definition: getWordDefinition(normalizedWord),
    length: normalizedWord.length,
    points
  };
}

/**
 * Create a new word scramble game session
 */
export function createWordScrambleSession(
  config: WordScrambleGameConfig,
  wordSequence: WordScrambleWord[],
  userId?: string
): Partial<WordScrambleGameSession> {
  const sessionId = generateSessionId();
  const startTime = new Date();
  
  // Calculate time limit based on game mode and difficulty
  let totalDuration = 0;
  if (config.customTimeLimit) {
    totalDuration = config.customTimeLimit;
  } else {
    switch (config.gameMode) {
      case 'timed':
      case 'blitz':
        totalDuration = getGameModeTimeLimit(config.gameMode, config.difficulty);
        break;
      case 'streak':
        totalDuration = 300; // 5 minutes for streak mode
        break;
      case 'marathon':
        totalDuration = 1200; // 20 minutes for marathon
        break;
      default:
        totalDuration = 0; // Unlimited for classic/zen
    }
  }
  
  // Calculate total words based on game mode
  const totalWords = calculateTotalWords(config.gameMode, wordSequence.length);
  const finalWordSequence = wordSequence.slice(0, totalWords);

  return {
    sessionId,
    userId,
    difficulty: config.difficulty,
    gameMode: config.gameMode,
    category: config.category,
    
    // Game State
    currentWord: null, // Will be set by getFirstWord
    currentWordIndex: 0,
    totalWords,
    wordsCompleted: 0,
    currentScore: 0,
    
    // Timing
    startTime,
    timeRemaining: totalDuration,
    totalDuration,
    isPaused: false,
    
    // Performance Metrics
    totalGuesses: 0,
    correctGuesses: 0,
    incorrectGuesses: 0,
    accuracy: 1.0,
    averageReactionTime: 0,
    fastestSolve: 0,
    slowestSolve: 0,
    
    // Streaks and Bonuses
    currentStreak: 0,
    maxStreak: 0,
    perfectWords: 0,
    oneGuessWords: 0,
    
    // Power-ups and Hints
    activePowerUps: config.enablePowerUps ? initializeGamePowerUps() : [],
    totalHintsUsed: 0,
    maxHints: config.enableHints ? WORD_SCRAMBLE_CONSTANTS.MAX_HINTS : 0,
    
    // Progress
    isCompleted: false,
    completionPercentage: 0,
    finalRating: '',
    achievements: [],
    
    // Advanced Features
    categoryStats: new Map(),
    difficultyProgression: false,
    bonusMultiplier: 1.0,
    consistencyScore: 0,
    
    attempts: [],
    completedWords: [],
    skippedWords: []
  };
}

/**
 * Get the first word for a session
 */
export function getFirstWord(session: Partial<WordScrambleGameSession>): WordScrambleWord | null {
  // Generate the first word from the sequence
  if (!session.category || !session.difficulty) return null;
  
  const wordSequence = generateWordSequence(
    session.difficulty, 
    session.category
  );
  
  if (wordSequence.length === 0) return null;
  
  return wordSequence[0];
}

/**
 * Get the next word for a session
 */
export function getNextWord(session: Partial<WordScrambleGameSession>): WordScrambleWord | null {
  if (!session.category || !session.difficulty || 
      !session.currentWordIndex || session.currentWordIndex >= (session.totalWords || 0)) {
    return null;
  }
  
  // Generate word sequence again (in a real implementation, this would be cached)
  const wordSequence = generateWordSequence(
    session.difficulty, 
    session.category
  );
  
  const nextIndex = session.currentWordIndex;
  
  if (nextIndex >= wordSequence.length) {
    return null;
  }
  
  return wordSequence[nextIndex];
}

/**
 * Validate a word guess
 */
export function validateWordGuess(
  guess: string,
  correctWord: string
): { isCorrect: boolean; status: WordGuessStatus } {
  const normalizedGuess = guess.toUpperCase().trim();
  const normalizedCorrect = correctWord.toUpperCase();
  
  // Check minimum length
  if (normalizedGuess.length < WORD_SCRAMBLE_CONSTANTS.MIN_WORD_LENGTH) {
    return { isCorrect: false, status: 'too_short' };
  }
  
  // Check for invalid characters (only letters allowed)
  if (!/^[A-Z]+$/.test(normalizedGuess)) {
    return { isCorrect: false, status: 'invalid_chars' };
  }
  
  // Check if correct
  if (normalizedGuess === normalizedCorrect) {
    return { isCorrect: true, status: 'correct' };
  }
  
  return { isCorrect: false, status: 'incorrect' };
}

/**
 * Calculate score for a correct guess
 */
export function calculateGuessScore(
  word: WordScrambleWord,
  currentStreak: number,
  reactionTime: number,
  hintsUsed: number,
  activePowerUps: any[]
): { baseScore: number; bonuses: number; totalScore: number; bonusMultiplier: number; streakBonus: number } {
  let baseScore = word.points;
  
  // Speed bonus
  let bonusMultiplier = 1.0;
  if (reactionTime > 0 && reactionTime < WORD_SCRAMBLE_CONSTANTS.SPEED_BONUS_THRESHOLD) {
    const speedBonus = 1 + (WORD_SCRAMBLE_CONSTANTS.SPEED_BONUS_THRESHOLD - reactionTime) / WORD_SCRAMBLE_CONSTANTS.SPEED_BONUS_THRESHOLD;
    bonusMultiplier += speedBonus * 0.5;
  }
  
  // Streak bonus
  let streakBonus = 0;
  if (currentStreak >= 3) {
    const streakMultiplier = Math.min(3.0, 1 + (currentStreak * 0.1));
    streakBonus = Math.round(baseScore * (streakMultiplier - 1));
    bonusMultiplier += (streakMultiplier - 1);
  }
  
  // Hint penalty
  if (hintsUsed > 0) {
    bonusMultiplier = Math.max(0.5, bonusMultiplier - (hintsUsed * 0.15));
  }
  
  // Power-up bonuses
  for (const powerUp of activePowerUps) {
    if (powerUp.isActive && powerUp.type === 'double-points') {
      bonusMultiplier += powerUp.effect;
    }
  }
  
  const bonuses = Math.round(baseScore * (bonusMultiplier - 1)) + streakBonus;
  const totalScore = Math.round(baseScore * bonusMultiplier);
  
  return {
    baseScore,
    bonuses,
    totalScore,
    bonusMultiplier: Math.round(bonusMultiplier * 100) / 100,
    streakBonus
  };
}

/**
 * Generate hint for a word
 */
export function generateWordHint(
  word: WordScrambleWord,
  hintType: string
): WordScrambleHint | null {
  const original = word.original;
  const cost = WORD_SCRAMBLE_CONSTANTS.HINT_COSTS[hintType as keyof typeof WORD_SCRAMBLE_CONSTANTS.HINT_COSTS] || 10;
  
  switch (hintType) {
    case 'first-letter':
      return {
        type: 'first-letter',
        content: `First letter: ${original[0]}`,
        cost,
        revealedInfo: original[0]
      };
      
    case 'last-letter':
      return {
        type: 'last-letter',
        content: `Last letter: ${original[original.length - 1]}`,
        cost,
        revealedInfo: original[original.length - 1]
      };
      
    case 'vowels':
      const vowels = 'AEIOU';
      const vowelPositions = original.split('').map((char, index) => 
        vowels.includes(char) ? char : '_'
      ).join(' ');
      return {
        type: 'vowels',
        content: `Vowel positions: ${vowelPositions}`,
        cost,
        revealedInfo: vowelPositions
      };
      
    case 'definition':
      return {
        type: 'definition',
        content: word.definition || getWordDefinition(original) || 'No definition available',
        cost,
        revealedInfo: 'definition'
      };
      
    case 'category':
      return {
        type: 'category',
        content: `Category: ${getCategoryDisplayName(word.category)}`,
        cost,
        revealedInfo: word.category
      };
      
    case 'length':
      return {
        type: 'length',
        content: `Word length: ${original.length} letters`,
        cost,
        revealedInfo: original.length.toString()
      };
      
    default:
      return null;
  }
}

/**
 * Update performance metrics for a session
 */
export function updatePerformanceMetrics(
  session: Partial<WordScrambleGameSession>,
  reactionTime: number,
  isCorrect: boolean
): void {
  if (!session) return;
  
  if (isCorrect && reactionTime > 0) {
    // Update fastest/slowest solve times
    if (session.fastestSolve === undefined || session.fastestSolve === 0 || reactionTime < session.fastestSolve) {
      session.fastestSolve = reactionTime;
    }
    if (session.slowestSolve === undefined || reactionTime > session.slowestSolve) {
      session.slowestSolve = reactionTime;
    }
    
    // Update average reaction time
    const totalCorrect = session.correctGuesses || 0;
    const currentAvg = session.averageReactionTime || 0;
    session.averageReactionTime = (currentAvg * totalCorrect + reactionTime) / (totalCorrect + 1);
  }
}

/**
 * Check for achievements
 */
export function checkForAchievements(
  session: Partial<WordScrambleGameSession>,
  word: WordScrambleWord,
  reactionTime: number,
  hintsUsed: number
): string[] {
  const newAchievements: string[] = [];
  const currentAchievements = session.achievements || [];
  
  // Speed Master - Solve in under 3 seconds
  if (reactionTime < 3000 && !currentAchievements.includes('speed_master')) {
    newAchievements.push('speed_master');
  }
  
  // Streak King - 10 word streak
  if ((session.currentStreak || 0) >= 10 && !currentAchievements.includes('streak_king')) {
    newAchievements.push('streak_king');
  }
  
  // Hint-free solver - Solve 5 words without hints
  if (hintsUsed === 0) {
    const hintFreeWords = session.attempts?.filter(a => a.isCorrect && a.hintsUsed === 0).length || 0;
    if (hintFreeWords >= 5 && !currentAchievements.includes('hint_free')) {
      newAchievements.push('hint_free');
    }
  }
  
  // Perfect accuracy - 100% accuracy with 10+ guesses
  if ((session.totalGuesses || 0) >= 10 && (session.accuracy || 0) >= 1.0 && 
      !currentAchievements.includes('perfect_round')) {
    newAchievements.push('perfect_round');
  }
  
  // Difficulty master - Complete expert/insane level
  if (['expert', 'insane'].includes(session.difficulty || '') && 
      !currentAchievements.includes('difficulty_master')) {
    newAchievements.push('difficulty_master');
  }
  
  return newAchievements;
}

/**
 * Calculate final performance metrics
 */
export function calculateFinalPerformanceMetrics(
  session: Partial<WordScrambleGameSession>,
  totalPlayTime: number
): WordScramblePerformanceMetrics {
  const attempts = session.attempts || [];
  const correctAttempts = attempts.filter(a => a.isCorrect);
  
  // Speed Metrics
  const reactionTimes = correctAttempts.map(a => a.reactionTime).filter(t => t > 0);
  const averageReactionTime = reactionTimes.length > 0 ? 
    reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length : 0;
  
  const fastestGuess = reactionTimes.length > 0 ? {
    word: correctAttempts.find(a => a.reactionTime === Math.min(...reactionTimes))?.word || '',
    time: Math.min(...reactionTimes)
  } : { word: '', time: 0 };
  
  const slowestGuess = reactionTimes.length > 0 ? {
    word: correctAttempts.find(a => a.reactionTime === Math.max(...reactionTimes))?.word || '',
    time: Math.max(...reactionTimes)
  } : { word: '', time: 0 };
  
  // Accuracy Metrics
  const accuracy = attempts.length > 0 ? correctAttempts.length / attempts.length : 1;
  const firstTrySuccess = session.oneGuessWords || 0;
  
  // Calculate ratings (0-1 scale)
  const speedRating = calculateSpeedRating(averageReactionTime);
  const accuracyRating = accuracy;
  const streakRating = calculateStreakRating(session.maxStreak || 0);
  const difficultyRating = getDifficultyRating(session.difficulty || 'easy');
  
  const overallRating = (speedRating * 0.3) + (accuracyRating * 0.3) + 
                       (streakRating * 0.25) + (difficultyRating * 0.15);
  
  return {
    // Speed Metrics
    averageReactionTime,
    fastestGuess,
    slowestGuess,
    
    // Accuracy Metrics
    totalAttempts: attempts.length,
    correctAttempts: correctAttempts.length,
    incorrectAttempts: attempts.length - correctAttempts.length,
    accuracy,
    firstTrySuccess,
    
    // Streak Metrics
    longestStreak: session.maxStreak || 0,
    currentStreak: session.currentStreak || 0,
    streakBreaks: 0, // Could be calculated from attempts
    perfectRounds: session.perfectWords || 0,
    
    // Word Difficulty Metrics
    easiestWordSolved: '',
    hardestWordSolved: '',
    averageWordDifficulty: 0,
    difficultyProgression: 0,
    
    // Consistency Metrics
    reactionTimeVariance: calculateReactionTimeVariance(reactionTimes),
    consistencyRating: calculateConsistencyRating(reactionTimes),
    improvementRate: 0,
    
    // Overall Rating
    speedRating,
    accuracyRating,
    streakRating,
    difficultyRating,
    overallRating
  };
}

/**
 * Determine game rating based on performance
 */
export function determineGameRating(metrics: WordScramblePerformanceMetrics): string {
  const score = metrics.overallRating;
  
  if (score >= 0.95) return 'Legendary';
  if (score >= 0.90) return 'Master';
  if (score >= 0.80) return 'Expert';
  if (score >= 0.70) return 'Advanced';
  if (score >= 0.60) return 'Intermediate';
  if (score >= 0.50) return 'Beginner';
  return 'Novice';
}

/**
 * Generate game summary
 */
export function generateGameSummary(
  session: Partial<WordScrambleGameSession>,
  metrics: WordScramblePerformanceMetrics
): string {
  const parts = [];
  
  if (metrics.accuracy >= 0.9) {
    parts.push('Excellent accuracy');
  }
  
  if (metrics.averageReactionTime <= 3000) {
    parts.push('Lightning-fast responses');
  }
  
  if ((session.maxStreak || 0) >= 10) {
    parts.push('Impressive word streak');
  }
  
  if ((session.perfectWords || 0) >= 5) {
    parts.push('Many first-try solutions');
  }
  
  if ((session.totalHintsUsed || 0) === 0) {
    parts.push('No hints needed');
  }
  
  if (parts.length === 0) {
    return 'Keep practicing to improve your word unscrambling skills!';
  }
  
  return parts.join(', ') + '. Great job!';
}

// Helper Functions

function generateSessionId(): string {
  return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function scrambleWord(word: string, options: ScrambleOptions): string {
  const chars = word.split('');
  
  switch (options.algorithm) {
    case 'random':
      return shuffleArray(chars).join('');
      
    case 'reverse':
      return chars.reverse().join('');
      
    case 'shuffle_pairs':
      for (let i = 0; i < chars.length - 1; i += 2) {
        if (Math.random() > 0.5) {
          [chars[i], chars[i + 1]] = [chars[i + 1], chars[i]];
        }
      }
      return chars.join('');
      
    case 'rotate':
      const rotateBy = Math.floor(Math.random() * chars.length);
      return chars.slice(rotateBy).concat(chars.slice(0, rotateBy)).join('');
      
    case 'complex':
    default:
      // Ensure minimum changes
      let scrambled = word;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (scrambled === word && attempts < maxAttempts) {
        scrambled = shuffleArray(chars).join('');
        attempts++;
      }
      
      return scrambled;
  }
}

function generateWordHints(word: string, category: WordScrambleCategory): string[] {
  const hints = [];
  
  // Category-specific hints
  switch (category) {
    case 'programming':
      hints.push('Related to software development');
      break;
    case 'science':
      hints.push('Scientific term or concept');
      break;
    case 'animals':
      hints.push('A living creature');
      break;
    case 'countries':
      hints.push('A nation or country');
      break;
    case 'technology':
      hints.push('Technology-related term');
      break;
    default:
      hints.push('A common word');
  }
  
  // Length hint
  if (word.length > 5) {
    hints.push('A longer word');
  } else {
    hints.push('A shorter word');
  }
  
  return hints;
}

function getWordDefinition(word: string): string | undefined {
  const definitions: Record<string, string> = {
    'REACT': 'A JavaScript library for building user interfaces',
    'JAVASCRIPT': 'A high-level programming language',
    'PYTHON': 'A versatile programming language',
    'ALGORITHM': 'A step-by-step procedure for calculations',
    'ELEPHANT': 'A large mammal with a trunk',
    'FRANCE': 'A country in Western Europe',
    'COMPUTER': 'An electronic device for processing data'
  };
  
  return definitions[word];
}

function getCategoryDisplayName(category: WordScrambleCategory): string {
  const names = {
    programming: 'Programming',
    science: 'Science',
    animals: 'Animals',
    countries: 'Countries',
    technology: 'Technology',
    general: 'General',
    mixed: 'Mixed'
  };
  
  return names[category] || category;
}

function getGameModeTimeLimit(gameMode: WordScrambleGameMode, difficulty: WordScrambleDifficulty): number {
  const baseLimits = {
    timed: 300,    // 5 minutes
    blitz: 120,    // 2 minutes
    streak: 300,   // 5 minutes
    marathon: 1200 // 20 minutes
  };
  
  const difficultyMultipliers = {
    easy: 1.2,
    medium: 1.0,
    hard: 0.8,
    expert: 0.6,
    insane: 0.5
  };
  
  const baseLimit = baseLimits[gameMode as keyof typeof baseLimits] || 300;
  const multiplier = difficultyMultipliers[difficulty];
  
  return Math.round(baseLimit * multiplier);
}

function calculateTotalWords(gameMode: WordScrambleGameMode, availableWords: number): number {
  const limits = {
    classic: Math.min(10, availableWords),
    timed: Math.min(15, availableWords),
    streak: Math.min(20, availableWords),
    marathon: Math.min(50, availableWords),
    blitz: Math.min(8, availableWords),
    zen: Math.min(12, availableWords)
  };
  
  return limits[gameMode] || 10;
}

function initializeGamePowerUps() {
  return [
    {
      id: 'reveal_1',
      type: 'reveal-letter',
      name: 'Letter Reveal',
      description: 'Reveal a letter in its correct position',
      effect: 1,
      cost: 50,
      isActive: false
    },
    {
      id: 'time_1',
      type: 'extra-time',
      name: 'Extra Time',
      description: 'Add 60 seconds to the timer',
      duration: 60000,
      effect: 60,
      cost: 75,
      isActive: false
    },
    {
      id: 'double_1',
      type: 'double-points',
      name: 'Double Points',
      description: 'Double points for next 3 words',
      duration: 180000,
      effect: 2.0,
      cost: 100,
      isActive: false,
      usesRemaining: 3
    }
  ];
}

function calculateSpeedRating(averageTime: number): number {
  if (averageTime <= 2000) return 1.0;
  if (averageTime <= 4000) return 0.9;
  if (averageTime <= 6000) return 0.7;
  if (averageTime <= 10000) return 0.5;
  return 0.3;
}

function calculateStreakRating(maxStreak: number): number {
  if (maxStreak >= 20) return 1.0;
  if (maxStreak >= 15) return 0.9;
  if (maxStreak >= 10) return 0.8;
  if (maxStreak >= 5) return 0.6;
  if (maxStreak >= 3) return 0.4;
  return 0.2;
}

function getDifficultyRating(difficulty: WordScrambleDifficulty): number {
  const ratings = {
    easy: 0.2,
    medium: 0.4,
    hard: 0.6,
    expert: 0.8,
    insane: 1.0
  };
  
  return ratings[difficulty] || 0.4;
}

function calculateReactionTimeVariance(times: number[]): number {
  if (times.length < 2) return 0;
  
  const mean = times.reduce((sum, time) => sum + time, 0) / times.length;
  const variance = times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / times.length;
  
  return variance;
}

function calculateConsistencyRating(times: number[]): number {
  if (times.length < 3) return 1.0;
  
  const variance = calculateReactionTimeVariance(times);
  const mean = times.reduce((sum, time) => sum + time, 0) / times.length;
  const coefficientOfVariation = Math.sqrt(variance) / mean;
  
  // Lower coefficient of variation = higher consistency
  return Math.max(0, 1 - coefficientOfVariation);
}