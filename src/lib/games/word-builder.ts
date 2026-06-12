// Word Builder Game Core Logic
import { prisma } from '@/lib/api/prisma';
import type {
  WordBuilderChallenge,
  WordBuilderGameSession,
  WordBuilderGameConfig,
  WordBuilderDifficulty,
  WordValidationStatus,
  WordBuilderPowerUp,
  WordBuilderHint,
  WordBuilderPerformanceMetrics,
  WordBuilderAttempt
} from '@/types/games/word-builder';
import {
  defaultWordBuilderChallenges,
  WORD_BUILDER_CONSTANTS
} from '@/types/games/word-builder';

function mapToSession(dbSession: any): WordBuilderGameSession {
  const state = JSON.parse(dbSession.state || '{}');
  let timeLimit: number | undefined;
  try {
    const meta = JSON.parse(dbSession.meta || '{}');
    if (typeof meta.timeLimit === 'number') {
      timeLimit = meta.timeLimit;
    }
  } catch (e) {}

  return {
    sessionId: dbSession.sessionId,
    userId: dbSession.userId || undefined,
    challengeId: state.challengeId,
    difficulty: dbSession.difficulty as WordBuilderDifficulty,
    gameMode: state.gameMode || 'timed',
    letters: state.letters || [],
    foundWords: JSON.parse(dbSession.words || '[]'),
    currentScore: dbSession.score,
    wordsFound: dbSession.correctGuesses,
    targetWordsCount: state.targetWordsCount || 0,
    startTime: dbSession.startedAt,
    endTime: dbSession.completedAt || undefined,
    timeRemaining: state.timeRemaining || 0,
    totalDuration: state.totalDuration || 0,
    isPaused: state.isPaused || false,
    averageWordTime: state.averageWordTime || 0,
    longestWord: state.longestWord || '',
    shortestWord: state.shortestWord || '',
    wordsPerMinute: state.wordsPerMinute || 0,
    accuracy: state.accuracy || 1.0,
    perfectWords: state.perfectWords || 0,
    activePowerUps: state.activePowerUps || [],
    hintsUsed: dbSession.hintsUsed,
    maxHints: state.maxHints || 0,
    comboStreak: state.comboStreak || 0,
    maxComboStreak: state.maxComboStreak || 0,
    isCompleted: dbSession.completed,
    completionPercentage: state.completionPercentage || 0,
    finalRating: state.finalRating || '',
    achievements: state.achievements || [],
    attempts: state.attempts || [],
    letterUsageStats: state.letterUsageStats || {},
    wordLengthDistribution: state.wordLengthDistribution || {},
    categoryBonus: state.categoryBonus || 0,
    consistencyRating: state.consistencyRating || 0
  };
}

/**
 * Select a random challenge based on difficulty
 */
export function selectRandomChallenge(
  difficulty: WordBuilderDifficulty,
  customLetters?: string[],
  customTargetWords?: string[]
): WordBuilderChallenge | null {
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

  const availableChallenges = defaultWordBuilderChallenges.filter(
    challenge => challenge.difficulty === difficulty
  );

  if (availableChallenges.length === 0) {
    return null;
  }

  return availableChallenges[Math.floor(Math.random() * availableChallenges.length)];
}

/**
 * Create a new game session in database
 */
export async function createGameSession(
  challenge: WordBuilderChallenge,
  config: WordBuilderGameConfig,
  userId?: string
): Promise<WordBuilderGameSession> {
  const initSession = createWordBuilderSession(challenge, config, userId);
  const sessionId = initSession.sessionId!;

  const dbSession = await prisma.wordGameSession.create({
    data: {
      userId: userId || null,
      sessionId,
      gameType: 'word-builder',
      difficulty: config.difficulty,
      category: challenge.category || 'General',
      words: JSON.stringify([]),
      score: 0,
      moves: 0,
      hintsUsed: 0,
      correctGuesses: 0,
      state: JSON.stringify(initSession),
      startedAt: new Date(),
      completed: false
    }
  });

  return mapToSession(dbSession);
}

/**
 * Get game session
 */
export async function getGameSession(sessionId: string): Promise<WordBuilderGameSession | null> {
  const dbSession = await prisma.wordGameSession.findUnique({
    where: { sessionId }
  });
  if (!dbSession) return null;
  return mapToSession(dbSession);
}

/**
 * Submit word
 */
export async function submitWord(
  sessionId: string,
  word: string,
  reactionTime: number = 0
): Promise<{ isValid: boolean; status: WordValidationStatus; session: WordBuilderGameSession | null }> {
  const dbSession = await prisma.wordGameSession.findUnique({
    where: { sessionId }
  });
  if (!dbSession) return { isValid: false, status: 'invalid', session: null };

  const sessionState = mapToSession(dbSession);
  if (sessionState.isCompleted) {
    return { isValid: false, status: 'game_over', session: sessionState };
  }

  const validation = validateWordInGame(word, sessionState.letters, sessionState.foundWords, sessionState.challengeId);
  const attempts: WordBuilderAttempt[] = sessionState.attempts || [];
  
  attempts.push({
    word,
    isValid: validation.isValid,
    score: 0,
    timestamp: new Date(),
    reactionTime
  });

  const state = JSON.parse(dbSession.state || '{}');
  state.attempts = attempts;

  if (!validation.isValid) {
    state.comboStreak = 0;
    
    const totalAttempts = attempts.length;
    const validAttempts = attempts.filter(a => a.isValid).length;
    state.accuracy = totalAttempts > 0 ? validAttempts / totalAttempts : 1.0;

    const updatedSession = await prisma.wordGameSession.update({
      where: { sessionId },
      data: {
        state: JSON.stringify(state),
        moves: totalAttempts
      }
    });
    return { isValid: false, status: validation.status, session: mapToSession(updatedSession) };
  }

  const foundWords = [...sessionState.foundWords, word.toUpperCase()];
  const scoreResult = calculateWordScore(word, sessionState.comboStreak, sessionState.activePowerUps, reactionTime);
  
  const currentScore = sessionState.currentScore + scoreResult.totalScore;
  const wordsFound = sessionState.wordsFound + 1;
  const comboStreak = sessionState.comboStreak + 1;
  const maxComboStreak = Math.max(sessionState.maxComboStreak, comboStreak);

  attempts[attempts.length - 1].score = scoreResult.totalScore;

  const longestWord = !sessionState.longestWord || word.length > sessionState.longestWord.length ? word : sessionState.longestWord;
  const shortestWord = !sessionState.shortestWord || word.length < sessionState.shortestWord.length ? word : sessionState.shortestWord;

  state.foundWords = foundWords;
  state.currentScore = currentScore;
  state.wordsFound = wordsFound;
  state.comboStreak = comboStreak;
  state.maxComboStreak = maxComboStreak;
  state.longestWord = longestWord;
  state.shortestWord = shortestWord;
  
  const totalAttempts = attempts.length;
  const validAttempts = attempts.filter(a => a.isValid).length;
  state.accuracy = totalAttempts > 0 ? validAttempts / totalAttempts : 1.0;

  const targetWordsCount = sessionState.targetWordsCount;
  const completionPercentage = Math.round((wordsFound / targetWordsCount) * 100);
  state.completionPercentage = completionPercentage;

  let completed = dbSession.completed;
  let completedAt = dbSession.completedAt;

  if (wordsFound >= targetWordsCount) {
    completed = true;
    completedAt = new Date();
  }

  const newAchievements = checkForAchievements(state, word, reactionTime);
  state.achievements = [...(state.achievements || []), ...newAchievements];

  const updatedSession = await prisma.wordGameSession.update({
    where: { sessionId },
    data: {
      words: JSON.stringify(foundWords),
      score: currentScore,
      correctGuesses: wordsFound,
      moves: totalAttempts,
      completed,
      completedAt,
      state: JSON.stringify(state)
    }
  });

  return { isValid: true, status: 'valid', session: mapToSession(updatedSession) };
}

/**
 * Use hint
 */
export async function useHint(
  sessionId: string,
  hintType: string
): Promise<{ hint: WordBuilderHint | null; session: WordBuilderGameSession | null }> {
  const dbSession = await prisma.wordGameSession.findUnique({
    where: { sessionId }
  });
  if (!dbSession) return { hint: null, session: null };

  const state = JSON.parse(dbSession.state || '{}');
  const challenge = defaultWordBuilderChallenges.find(c => c.id === state.challengeId);
  if (!challenge) return { hint: null, session: mapToSession(dbSession) };

  const unfoundWords = challenge.targetWords.filter((w: string) => !(state.foundWords || []).includes(w));
  if (unfoundWords.length === 0) return { hint: null, session: mapToSession(dbSession) };

  const targetWord = unfoundWords[0];
  const hint = generateWordHint(targetWord, hintType, state.letters || []);
  if (!hint) return { hint: null, session: mapToSession(dbSession) };

  const hintsUsed = dbSession.hintsUsed + 1;
  state.hintsUsed = hintsUsed;

  const updatedSession = await prisma.wordGameSession.update({
    where: { sessionId },
    data: {
      hintsUsed,
      state: JSON.stringify(state)
    }
  });

  return { hint, session: mapToSession(updatedSession) };
}

/**
 * Complete game session
 */
export async function completeGameSession(sessionId: string): Promise<WordBuilderGameSession | null> {
  const dbSession = await prisma.wordGameSession.findUnique({
    where: { sessionId }
  });
  if (!dbSession) return null;

  if (dbSession.completed) {
    return mapToSession(dbSession);
  }

  const state = JSON.parse(dbSession.state || '{}');
  state.isCompleted = true;
  
  const completedAt = new Date();
  const duration = Math.floor((completedAt.getTime() - dbSession.startedAt.getTime()) / 1000);
  
  const finalSessionState = mapToSession({ ...dbSession, completed: true, completedAt, state: JSON.stringify(state) });
  const finalMetrics = calculateFinalPerformanceMetrics(finalSessionState, duration);
  state.statistics = finalMetrics;
  state.finalRating = determineGameRating(finalMetrics);

  const updatedSession = await prisma.wordGameSession.update({
    where: { sessionId },
    data: {
      completed: true,
      completedAt,
      state: JSON.stringify(state)
    }
  });

  return mapToSession(updatedSession);
}

/**
 * Create a new game session state helper
 */
export function createWordBuilderSession(
  challenge: WordBuilderChallenge,
  config: WordBuilderGameConfig,
  userId?: string
): Partial<WordBuilderGameSession> {
  const sessionId = generateSessionId();
  const startTime = new Date();
  
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
        totalDuration = 0;
    }
  }

  const activePowerUps: WordBuilderPowerUp[] = config.enablePowerUps ? 
    initializeGamePowerUps() : [];

  return {
    sessionId,
    userId,
    challengeId: challenge.id,
    difficulty: config.difficulty,
    gameMode: config.gameMode,
    letters: [...challenge.letters],
    foundWords: [],
    currentScore: 0,
    wordsFound: 0,
    targetWordsCount: challenge.targetWords.length,
    startTime,
    timeRemaining: totalDuration,
    totalDuration,
    isPaused: false,
    averageWordTime: 0,
    longestWord: '',
    shortestWord: '',
    wordsPerMinute: 0,
    accuracy: 1.0,
    perfectWords: 0,
    activePowerUps,
    hintsUsed: 0,
    maxHints: config.enableHints ? WORD_BUILDER_CONSTANTS.MAX_HINTS : 0,
    comboStreak: 0,
    maxComboStreak: 0,
    isCompleted: false,
    completionPercentage: 0,
    finalRating: '',
    achievements: [],
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
  
  if (normalizedWord.length < WORD_BUILDER_CONSTANTS.MIN_WORD_LENGTH) {
    return { isValid: false, status: 'too_short' };
  }
  
  if (foundWords.includes(normalizedWord)) {
    return { isValid: false, status: 'already_used' };
  }
  
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
  
  for (const letter of normalizedWord) {
    const letterValue = WORD_BUILDER_CONSTANTS.SCORING.LETTER_VALUES[letter as keyof typeof WORD_BUILDER_CONSTANTS.SCORING.LETTER_VALUES] || 1;
    baseScore += letterValue;
  }
  
  const lengthBonus = Math.max(0, normalizedWord.length - 3) * WORD_BUILDER_CONSTANTS.LENGTH_MULTIPLIER;
  baseScore += lengthBonus;
  
  let bonusMultiplier = 1;
  let bonuses = 0;
  
  if (comboStreak >= 3) {
    bonusMultiplier += Math.min(2, comboStreak * 0.1);
  }
  
  if (reactionTime > 0 && reactionTime < 5000) {
    const speedBonus = Math.max(0, 1 - (reactionTime / 5000));
    bonusMultiplier += speedBonus * 0.5;
  }
  
  if (normalizedWord.length >= 7) {
    bonusMultiplier += 0.5;
  }
  
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
  
  if (reactionTime < 5000 && !currentAchievements.includes('speed_demon')) {
    newAchievements.push('speed_demon');
  }
  
  if ((session.wordsFound || 0) >= 10 && !currentAchievements.includes('word_master')) {
    newAchievements.push('word_master');
  }
  
  if (word.length >= 8 && !currentAchievements.includes('long_word')) {
    newAchievements.push('long_word');
  }
  
  if ((session.comboStreak || 0) >= 5 && !currentAchievements.includes('streak_king')) {
    newAchievements.push('streak_king');
  }
  
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
  const attempts = (session.attempts || []) as WordBuilderAttempt[];
  const validAttempts = attempts.filter(a => a.isValid);
  
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
  
  const accuracy = attempts.length > 0 ? validAttempts.length / attempts.length : 1;
  
  const wordLengths = validAttempts.map(a => a.word.length);
  const averageWordLength = wordLengths.length > 0 ? 
    wordLengths.reduce((sum, len) => sum + len, 0) / wordLengths.length : 0;
  
  const speedRating = calculateSpeedRating(averageWordTime);
  const accuracyRating = accuracy;
  const discoveryRating = session.targetWordsCount ? 
    (session.wordsFound || 0) / session.targetWordsCount : 0;
  const consistencyRating = calculateConsistencyRating(reactionTimes);
  
  const overallRating = (speedRating * 0.25) + (accuracyRating * 0.25) + 
                       (discoveryRating * 0.35) + (consistencyRating * 0.15);
  
  return {
    averageWordTime,
    fastestWord,
    slowestWord,
    totalAttempts: attempts.length,
    validAttempts: validAttempts.length,
    invalidAttempts: attempts.length - validAttempts.length,
    accuracy,
    longestWord: session.longestWord || '',
    shortestValidWord: session.shortestWord || '',
    averageWordLength,
    wordLengthVariety: calculateWordLengthVariety(wordLengths),
    wordsFound: session.wordsFound || 0,
    targetWordsFound: session.wordsFound || 0,
    completionRate: discoveryRating,
    hiddenWordsFound: 0,
    streakLength: session.comboStreak || 0,
    maxStreak: session.maxComboStreak || 0,
    consistencyScore: consistencyRating,
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

// Helpers

function generateSessionId(): string {
  return `wb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getDifficultyTimeLimit(difficulty: WordBuilderDifficulty): number {
  const timeLimits = {
    easy: 180,
    medium: 240,
    hard: 300,
    expert: 360,
    master: 420
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
  
  const consistencyScore = Math.max(0, 1 - (stdDev / mean));
  return Math.min(1, consistencyScore);
}

function calculateWordLengthVariety(lengths: number[]): number {
  if (lengths.length === 0) return 0;
  const uniqueLengths = new Set(lengths).size;
  const maxPossibleVariety = Math.min(10, lengths.length);
  return uniqueLengths / maxPossibleVariety;
}