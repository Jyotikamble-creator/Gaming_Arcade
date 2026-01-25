// Word Builder Game Core Logic
import {
  WordBuilderChallenge,
  WordBuilderGameSession,
  WordBuilderGameConfig,
  WordBuilderDifficulty,
  WordValidationStatus,
  WordBuilderPowerUp,
  WordBuilderHint,
  WordBuilderPerformanceMetrics,
  defaultWordBuilderChallenges,
  WORD_BUILDER_CONSTANTS
} from '@/types/games/word-builder';

/**
 * Select a random challenge based on difficulty
 */
export function selectRandomChallenge(
  difficulty: WordBuilderDifficulty,
  customLetters?: string[],
  customTargetWords?: string[]
): WordBuilderChallenge | null {
  // If custom parameters provided, create custom challenge
  if (customLetters && customTargetWords) {
    return {
      id: 999,
      difficulty,
      letters: customLetters,
      targetWords: customTargetWords,
      minWords: Math.max(1, Math.floor(customTargetWords.length * 0.6)),
      maxScore: customTargetWords.length * 100,
      category: 'Custom Challenge'
    };
  }

  // Select from default challenges
  const availableChallenges = defaultWordBuilderChallenges.filter(
    challenge => challenge.difficulty === difficulty
  );

  if (availableChallenges.length === 0) {
    return null;
  }

  return availableChallenges[Math.floor(Math.random() * availableChallenges.length)];
}

/**
 * Create a new game session
 */
export function createWordBuilderSession(
  challenge: WordBuilderChallenge,
  config: WordBuilderGameConfig,
  userId?: string
): Partial<WordBuilderGameSession> {
  const sessionId = generateSessionId();
  const startTime = new Date();
  
  // Calculate time limit based on game mode and difficulty
  let totalDuration = 0;
  if (config.customTimeLimit) {
    totalDuration = config.customTimeLimit;
  } else {
    switch (config.gameMode) {
      case 'timed':
        totalDuration = getDifficultyTimeLimit(config.difficulty);
        break;
      case 'challenge':
        totalDuration = challenge.timeLimit || 300;
        break;
      default:
        totalDuration = 0; // Unlimited
    }
  }

  // Initialize power-ups
  const activePowerUps: WordBuilderPowerUp[] = config.enablePowerUps ? 
    initializeGamePowerUps() : [];

  return {
    sessionId,
    userId,
    challengeId: challenge.id,
    difficulty: config.difficulty,
    gameMode: config.gameMode,
    
    // Game State
    letters: [...challenge.letters],
    foundWords: [],
    currentScore: 0,
    wordsFound: 0,
    targetWordsCount: challenge.targetWords.length,
    
    // Timing
    startTime,
    timeRemaining: totalDuration,
    totalDuration,
    isPaused: false,
    
    // Performance Metrics
    averageWordTime: 0,
    longestWord: '',
    shortestWord: '',
    wordsPerMinute: 0,
    accuracy: 1.0,
    perfectWords: 0,
    
    // Power-ups and Bonuses
    activePowerUps,
    hintsUsed: 0,
    maxHints: config.enableHints ? WORD_BUILDER_CONSTANTS.MAX_HINTS : 0,
    comboStreak: 0,
    maxComboStreak: 0,
    
    // Progress
    isCompleted: false,
    completionPercentage: 0,
    finalRating: '',
    achievements: [],
    
    // Advanced Features
    letterUsageStats: new Map(),
    wordLengthDistribution: new Map(),
    categoryBonus: 0,
    consistencyRating: 0,
    
    attempts: []
  };
}

/**
 * Validate word against challenge rules
 */
export function validateWordInGame(
  word: string,
  availableLetters: string[],
  foundWords: string[],
  challengeId: number
): { isValid: boolean; status: WordValidationStatus } {
  const normalizedWord = word.toUpperCase().trim();
  
  // Check minimum length
  if (normalizedWord.length < WORD_BUILDER_CONSTANTS.MIN_WORD_LENGTH) {
    return { isValid: false, status: 'too_short' };
  }
  
  // Check if already found
  if (foundWords.includes(normalizedWord)) {
    return { isValid: false, status: 'already_used' };
  }
  
  // Check if word uses only available letters
  const letterCount = new Map<string, number>();
  for (const letter of availableLetters) {
    letterCount.set(letter, (letterCount.get(letter) || 0) + 1);
  }
  
  for (const letter of normalizedWord) {
    const available = letterCount.get(letter) || 0;
    if (available <= 0) {
      return { isValid: false, status: 'invalid_letters' };
    }
    letterCount.set(letter, available - 1);
  }
  
  // Check if word is in target words list
  const challenge = defaultWordBuilderChallenges.find(c => c.id === challengeId);
  if (!challenge || !challenge.targetWords.includes(normalizedWord)) {
    return { isValid: false, status: 'invalid' };
  }
  
  return { isValid: true, status: 'valid' };
}

/**
 * Calculate word score with bonuses
 */
export function calculateWordScore(
  word: string,
  comboStreak: number,
  activePowerUps: WordBuilderPowerUp[],
  reactionTime: number
): { baseScore: number; bonuses: number; totalScore: number; bonusMultiplier: number } {
  const normalizedWord = word.toUpperCase();
  let baseScore = 0;
  
  // Calculate base score using letter values
  for (const letter of normalizedWord) {
    const letterValue = WORD_BUILDER_CONSTANTS.SCORING.LETTER_VALUES[letter] || 1;
    baseScore += letterValue;
  }
  
  // Length bonus
  const lengthBonus = Math.max(0, normalizedWord.length - 3) * WORD_BUILDER_CONSTANTS.LENGTH_MULTIPLIER;
  baseScore += lengthBonus;
  
  // Calculate multipliers
  let bonusMultiplier = 1;
  let bonuses = 0;
  
  // Combo streak bonus
  if (comboStreak >= 3) {
    bonusMultiplier += Math.min(2, comboStreak * 0.1);
  }
  
  // Speed bonus for quick reactions
  if (reactionTime > 0 && reactionTime < 5000) { // Under 5 seconds
    const speedBonus = Math.max(0, 1 - (reactionTime / 5000));
    bonusMultiplier += speedBonus * 0.5;
  }
  
  // Long word bonus
  if (normalizedWord.length >= 7) {
    bonusMultiplier += 0.5;
  }
  
  // Power-up bonuses
  for (const powerUp of activePowerUps) {
    if (powerUp.isActive) {
      switch (powerUp.type) {
        case 'score-boost':
          bonusMultiplier += powerUp.effect;
          break;
      }
    }
  }
  
  bonuses = Math.round(baseScore * (bonusMultiplier - 1));
  const totalScore = Math.round(baseScore * bonusMultiplier);
  
  return {
    baseScore,
    bonuses,
    totalScore,
    bonusMultiplier: Math.round(bonusMultiplier * 100) / 100
  };
}

/**
 * Update game progress and completion percentage
 */
export function updateGameProgress(session: Partial<WordBuilderGameSession>): void {
  if (session.targetWordsCount && session.targetWordsCount > 0) {
    session.completionPercentage = Math.round(
      (session.wordsFound || 0) / session.targetWordsCount * 100
    );
  }
  
  // Check for auto-completion
  if (session.wordsFound && session.targetWordsCount && 
      session.wordsFound >= session.targetWordsCount) {
    session.isCompleted = true;
    session.endTime = new Date();
  }
}

/**
 * Check for achievements
 */
export function checkForAchievements(
  session: Partial<WordBuilderGameSession>,
  word: string,
  reactionTime: number
): string[] {
  const newAchievements: string[] = [];
  const currentAchievements = session.achievements || [];
  
  // Speed Demon - Find word in under 5 seconds
  if (reactionTime < 5000 && !currentAchievements.includes('speed_demon')) {
    newAchievements.push('speed_demon');
  }
  
  // Word Master - Find 10 words in one game
  if ((session.wordsFound || 0) >= 10 && !currentAchievements.includes('word_master')) {
    newAchievements.push('word_master');
  }
  
  // Long Word - Find 8+ letter word
  if (word.length >= 8 && !currentAchievements.includes('long_word')) {
    newAchievements.push('long_word');
  }
  
  // Streak King - 5 word combo streak
  if ((session.comboStreak || 0) >= 5 && !currentAchievements.includes('streak_king')) {
    newAchievements.push('streak_king');
  }
  
  // Perfect Game - 100% accuracy with 5+ words
  if ((session.accuracy || 0) >= 1.0 && (session.wordsFound || 0) >= 5 && 
      !currentAchievements.includes('perfect_game')) {
    newAchievements.push('perfect_game');
  }
  
  return newAchievements;
}

/**
 * Generate word hint
 */
export function generateWordHint(
  targetWord: string,
  hintType: string,
  availableLetters: string[]
): WordBuilderHint | null {
  const word = targetWord.toUpperCase();
  
  switch (hintType) {
    case 'first-letter':
      return {
        type: 'first-letter',
        content: `This word starts with: ${word[0]}`,
        targetWord: word,
        cost: 10
      };
      
    case 'word-length':
      return {
        type: 'word-length',
        content: `This word has ${word.length} letters`,
        targetWord: word,
        cost: 5
      };
      
    case 'definition':
      const definition = getWordDefinition(word);
      return {
        type: 'definition',
        content: definition || `Think of a word meaning: ${getCategoryHint(word)}`,
        targetWord: word,
        cost: 15
      };
      
    case 'category':
      return {
        type: 'category',
        content: `Category: ${getCategoryHint(word)}`,
        targetWord: word,
        cost: 8
      };
      
    default:
      return null;
  }
}

/**
 * Get target words for a challenge
 */
export function getTargetWords(challengeId: number): string[] | null {
  const challenge = defaultWordBuilderChallenges.find(c => c.id === challengeId);
  return challenge ? challenge.targetWords : null;
}

/**
 * Calculate final performance metrics
 */
export function calculateFinalPerformanceMetrics(
  session: Partial<WordBuilderGameSession>,
  totalPlayTime: number
): WordBuilderPerformanceMetrics {
  const attempts = session.attempts || [];
  const validAttempts = attempts.filter(a => a.isValid);
  
  // Speed Metrics
  const reactionTimes = validAttempts.map(a => a.reactionTime).filter(t => t > 0);
  const averageWordTime = reactionTimes.length > 0 ? 
    reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length / 1000 : 0;
  
  const fastestWord = reactionTimes.length > 0 ? {
    word: validAttempts.find(a => a.reactionTime === Math.min(...reactionTimes))?.word || '',
    time: Math.min(...reactionTimes) / 1000
  } : { word: '', time: 0 };
  
  const slowestWord = reactionTimes.length > 0 ? {
    word: validAttempts.find(a => a.reactionTime === Math.max(...reactionTimes))?.word || '',
    time: Math.max(...reactionTimes) / 1000
  } : { word: '', time: 0 };
  
  // Accuracy Metrics
  const accuracy = attempts.length > 0 ? validAttempts.length / attempts.length : 1;
  
  // Word Quality Metrics
  const wordLengths = validAttempts.map(a => a.word.length);
  const averageWordLength = wordLengths.length > 0 ? 
    wordLengths.reduce((sum, len) => sum + len, 0) / wordLengths.length : 0;
  
  // Calculate ratings (0-1 scale)
  const speedRating = calculateSpeedRating(averageWordTime);
  const accuracyRating = accuracy;
  const discoveryRating = session.targetWordsCount ? 
    (session.wordsFound || 0) / session.targetWordsCount : 0;
  const consistencyRating = calculateConsistencyRating(reactionTimes);
  
  const overallRating = (speedRating * 0.25) + (accuracyRating * 0.25) + 
                       (discoveryRating * 0.35) + (consistencyRating * 0.15);
  
  return {
    // Speed Metrics
    averageWordTime,
    fastestWord,
    slowestWord,
    
    // Accuracy Metrics
    totalAttempts: attempts.length,
    validAttempts: validAttempts.length,
    invalidAttempts: attempts.length - validAttempts.length,
    accuracy,
    
    // Word Quality Metrics
    longestWord: session.longestWord || '',
    shortestValidWord: session.shortestWord || '',
    averageWordLength,
    wordLengthVariety: calculateWordLengthVariety(wordLengths),
    
    // Discovery Metrics
    wordsFound: session.wordsFound || 0,
    targetWordsFound: session.wordsFound || 0,
    completionRate: discoveryRating,
    hiddenWordsFound: 0, // Could be expanded for bonus words
    
    // Consistency Metrics
    streakLength: session.comboStreak || 0,
    maxStreak: session.maxComboStreak || 0,
    consistencyScore: consistencyRating,
    
    // Overall Rating
    speedRating,
    accuracyRating,
    discoveryRating,
    consistencyRating,
    overallRating
  };
}

/**
 * Determine game rating based on performance
 */
export function determineGameRating(metrics: WordBuilderPerformanceMetrics): string {
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
  session: Partial<WordBuilderGameSession>,
  metrics: WordBuilderPerformanceMetrics
): string {
  const parts = [];
  
  if (metrics.accuracy >= 0.9) {
    parts.push('Excellent accuracy');
  }
  
  if (metrics.discoveryRating >= 0.8) {
    parts.push('Great word discovery');
  }
  
  if (metrics.averageWordTime <= 5) {
    parts.push('Fast reaction times');
  }
  
  if ((session.maxComboStreak || 0) >= 5) {
    parts.push('Impressive combo streak');
  }
  
  if ((session.longestWord || '').length >= 8) {
    parts.push('Found challenging long words');
  }
  
  if (parts.length === 0) {
    return 'Keep practicing to improve your word-building skills!';
  }
  
  return parts.join(', ') + '. Well done!';
}

// Helper Functions

function generateSessionId(): string {
  return `wb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getDifficultyTimeLimit(difficulty: WordBuilderDifficulty): number {
  const timeLimits = {
    easy: 180,      // 3 minutes
    medium: 240,    // 4 minutes
    hard: 300,      // 5 minutes
    expert: 360,    // 6 minutes
    master: 420     // 7 minutes
  };
  
  return timeLimits[difficulty] || 240;
}

function initializeGamePowerUps(): WordBuilderPowerUp[] {
  return [
    {
      id: 'hint_1',
      type: 'hint',
      name: 'Word Hint',
      description: 'Get a hint for a difficult word',
      effect: 1,
      cost: 50,
      isActive: false
    },
    {
      id: 'time_1',
      type: 'extra-time',
      name: 'Extra Time',
      description: 'Add 30 seconds to the timer',
      duration: 30000,
      effect: 30,
      cost: 100,
      isActive: false
    },
    {
      id: 'score_1',
      type: 'score-boost',
      name: 'Score Multiplier',
      description: 'Double points for next 3 words',
      duration: 60000,
      effect: 2.0,
      cost: 150,
      isActive: false
    }
  ];
}

function getWordDefinition(word: string): string | null {
  // Simple definitions for common words - could be expanded with external API
  const definitions: Record<string, string> = {
    'CAT': 'A small domesticated carnivorous mammal',
    'DOG': 'A domesticated carnivorous mammal, typically loyal pet',
    'FISH': 'An aquatic vertebrate animal with gills and fins',
    'TRAIN': 'A series of connected railway carriages',
    'GARDEN': 'A piece of ground for growing plants',
    'STUDENT': 'A person who is learning at a school or university',
    'MOUNTAIN': 'A large natural elevation of the earth\'s surface'
  };
  
  return definitions[word] || null;
}

function getCategoryHint(word: string): string {
  // Simple category hints - could be expanded
  if (['CAT', 'DOG', 'FISH'].includes(word)) return 'Animal';
  if (['TRAIN', 'CAR', 'BIKE'].includes(word)) return 'Transportation';
  if (['GARDEN', 'TREE', 'FLOWER'].includes(word)) return 'Nature';
  if (['STUDENT', 'TEACHER', 'SCHOOL'].includes(word)) return 'Education';
  if (['MOUNTAIN', 'RIVER', 'OCEAN'].includes(word)) return 'Geography';
  return 'General';
}

function calculateSpeedRating(averageTime: number): number {
  if (averageTime <= 3) return 1.0;
  if (averageTime <= 5) return 0.9;
  if (averageTime <= 8) return 0.7;
  if (averageTime <= 12) return 0.5;
  return 0.3;
}

function calculateConsistencyRating(reactionTimes: number[]): number {
  if (reactionTimes.length < 3) return 1.0;
  
  const mean = reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length;
  const variance = reactionTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / reactionTimes.length;
  const stdDev = Math.sqrt(variance);
  
  // Lower standard deviation = higher consistency
  const consistencyScore = Math.max(0, 1 - (stdDev / mean));
  return Math.min(1, consistencyScore);
}

function calculateWordLengthVariety(lengths: number[]): number {
  if (lengths.length === 0) return 0;
  const uniqueLengths = new Set(lengths).size;
  const maxPossibleVariety = Math.min(10, lengths.length); // Cap at reasonable max
  return uniqueLengths / maxPossibleVariety;
}