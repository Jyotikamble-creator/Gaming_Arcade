// Word Scramble Game Core Logic
import { prisma } from '@/lib/api/prisma';
import type {
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
  ScrambleOptions
} from '@/types/games/word-scramble';
import {
  defaultWordBank,
  WORD_SCRAMBLE_CONSTANTS
} from '@/types/games/word-scramble';

// ============================================
// Simplified Difficulty-Based Word Sets
// ============================================

export type GameDifficulty = 'easy' | 'medium' | 'hard';

export interface WordSet {
  difficulty: GameDifficulty;
  theme: string;
  words: Array<{ word: string; category: string }>;
}

export const WORD_SETS: Record<GameDifficulty, WordSet> = {
  easy: {
    difficulty: 'easy',
    theme: '🌱 Beginner',
    words: [
      { word: 'CAT', category: 'Animals' },
      { word: 'DOG', category: 'Animals' },
      { word: 'BOOK', category: 'Objects' },
      { word: 'TREE', category: 'Nature' },
      { word: 'STAR', category: 'Sky' },
      { word: 'RAIN', category: 'Weather' },
      { word: 'FISH', category: 'Animals' },
      { word: 'BIRD', category: 'Animals' },
      { word: 'MOON', category: 'Sky' },
      { word: 'ROCK', category: 'Nature' },
      { word: 'SAND', category: 'Nature' },
      { word: 'SNOW', category: 'Weather' },
    ],
  },
  medium: {
    difficulty: 'medium',
    theme: '⚡ Intermediate',
    words: [
      { word: 'ELEPHANT', category: 'Animals' },
      { word: 'MOUNTAIN', category: 'Geography' },
      { word: 'LIBRARY', category: 'Places' },
      { word: 'COMPUTER', category: 'Technology' },
      { word: 'BUTTERFLY', category: 'Insects' },
      { word: 'KEYBOARD', category: 'Technology' },
      { word: 'CHOCOLATE', category: 'Food' },
      { word: 'TELEPHONE', category: 'Technology' },
      { word: 'HOSPITAL', category: 'Places' },
      { word: 'DINOSAUR', category: 'Animals' },
      { word: 'UNIVERSE', category: 'Space' },
      { word: 'BIRTHDAY', category: 'Events' },
    ],
  },
  hard: {
    difficulty: 'hard',
    theme: '🔥 Advanced',
    words: [
      { word: 'JAVASCRIPT', category: 'Programming' },
      { word: 'ALGORITHM', category: 'Computing' },
      { word: 'ARCHITECTURE', category: 'Engineering' },
      { word: 'PHOTOGRAPH', category: 'Art' },
      { word: 'MATHEMATICS', category: 'Science' },
      { word: 'PSYCHOLOGY', category: 'Science' },
      { word: 'TECHNOLOGY', category: 'Innovation' },
      { word: 'HYPOTHESIS', category: 'Science' },
      { word: 'TELEPHONE', category: 'Communication' },
      { word: 'EARTHQUAKE', category: 'Nature' },
      { word: 'VOCABULARY', category: 'Language' },
      { word: 'FRIENDSHIP', category: 'Social' },
    ],
  },
};

function mapToSession(dbSession: any): WordScrambleGameSession {
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
    difficulty: dbSession.difficulty as WordScrambleDifficulty,
    gameMode: state.gameMode || 'classic',
    category: dbSession.category as WordScrambleCategory,
    currentWord: state.currentWord,
    currentWordIndex: dbSession.currentWordIndex,
    totalWords: state.totalWords || 10,
    wordsCompleted: dbSession.correctGuesses,
    currentScore: dbSession.score,
    startTime: dbSession.startedAt,
    endTime: dbSession.completedAt || undefined,
    timeRemaining: state.timeRemaining || 0,
    totalDuration: state.totalDuration || 0,
    isPaused: state.isPaused || false,
    totalGuesses: dbSession.moves,
    correctGuesses: dbSession.correctGuesses,
    incorrectGuesses: dbSession.moves - dbSession.correctGuesses,
    accuracy: state.accuracy || 1.0,
    averageReactionTime: state.averageReactionTime || 0,
    fastestSolve: state.fastestSolve || 0,
    slowestSolve: state.slowestSolve || 0,
    currentStreak: state.currentStreak || 0,
    maxStreak: state.maxStreak || 0,
    perfectWords: state.perfectWords || 0,
    oneGuessWords: state.oneGuessWords || 0,
    activePowerUps: state.activePowerUps || [],
    totalHintsUsed: dbSession.hintsUsed,
    maxHints: state.maxHints || 0,
    isCompleted: dbSession.completed,
    completionPercentage: state.completionPercentage || 0,
    finalRating: state.finalRating || '',
    achievements: state.achievements || [],
    categoryStats: state.categoryStats || {},
    difficultyProgression: state.difficultyProgression || false,
    bonusMultiplier: state.bonusMultiplier || 1.0,
    consistencyScore: state.consistencyScore || 0,
    attempts: state.attempts || [],
    completedWords: state.completedWords || [],
    skippedWords: state.skippedWords || []
  };
}

/**
 * Get a random word from specified difficulty level
 */
export function getRandomWordByDifficulty(difficulty: GameDifficulty) {
  const wordSet = WORD_SETS[difficulty];
  if (!wordSet) {
    console.error(`[WORD_SCRAMBLE] Invalid difficulty: ${difficulty}`);
    return getRandomWordByDifficulty('medium');
  }

  const words = wordSet.words;
  if (!words || words.length === 0) {
    console.error(`[WORD_SCRAMBLE] No words found for difficulty: ${difficulty}`);
    return { word: 'WORD', scrambled: 'DROQ', category: 'General' };
  }

  const selectedWord = words[Math.floor(Math.random() * words.length)];
  
  let scrambled = shuffleWordSimple(selectedWord.word);
  while (scrambled === selectedWord.word && selectedWord.word.length > 1) {
    scrambled = shuffleWordSimple(selectedWord.word);
  }

  return {
    word: selectedWord.word,
    scrambled,
    category: selectedWord.category,
    difficulty,
  };
}

/**
 * Get 5 unique words for a round
 */
export function getWordSequenceForRound(difficulty: GameDifficulty, count: number = 5) {
  const wordSet = WORD_SETS[difficulty];
  if (!wordSet) {
    console.error(`[WORD_SCRAMBLE] Invalid difficulty: ${difficulty}`);
    return [];
  }

  const words = [...wordSet.words];
  const selectedWords = [];
  const actualCount = Math.min(count, words.length);

  for (let i = 0; i < actualCount; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    const selectedWord = words[randomIndex];
    
    let scrambled = shuffleWordSimple(selectedWord.word);
    while (scrambled === selectedWord.word && selectedWord.word.length > 1) {
      scrambled = shuffleWordSimple(selectedWord.word);
    }

    selectedWords.push({
      word: selectedWord.word,
      scrambled,
      category: selectedWord.category,
      difficulty,
    });

    words.splice(randomIndex, 1);
  }

  return selectedWords;
}

/**
 * Shuffle word characters using Fisher-Yates algorithm
 */
function shuffleWordSimple(word: string): string {
  const chars = word.toUpperCase().split('');
  
  if (chars.length <= 2) return word;
  
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  
  return chars.join('');
}

/**
 * Calculate score based on word length, difficulty, and attempts
 */
export function calculateSimpleScore(
  difficulty: GameDifficulty,
  attempts: number,
  wordLength: number
): number {
  const difficultyMultiplier = {
    easy: 1,
    medium: 2,
    hard: 3,
  };

  const multiplier = difficultyMultiplier[difficulty] || 1;
  const baseScore = wordLength * 10;
  const penaltyPerAttempt = 5;
  const score = (baseScore * multiplier) - (attempts * penaltyPerAttempt);
  
  return Math.max(score, 10);
}

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
      sourceWords = defaultWordBank[difficulty]?.mixed || [];
    }
  }
  
  if (sourceWords.length === 0) {
    return [];
  }
  
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
 * Create a new word scramble game session in database
 */
export async function createGameSession(
  config: WordScrambleGameConfig,
  userId?: string
): Promise<WordScrambleGameSession> {
  const wordSequence = generateWordSequence(config.difficulty, config.category);
  const initSession = createWordScrambleSession(config, wordSequence, userId);
  
  const firstWord = wordSequence[0] || null;
  initSession.currentWord = firstWord;

  const sessionId = initSession.sessionId!;

  const dbSession = await prisma.wordGameSession.create({
    data: {
      userId: userId || null,
      sessionId,
      gameType: 'word-scramble',
      difficulty: config.difficulty,
      category: config.category,
      words: JSON.stringify([]),
      currentWordIndex: 0,
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
export async function getGameSession(sessionId: string): Promise<WordScrambleGameSession | null> {
  const dbSession = await prisma.wordGameSession.findUnique({
    where: { sessionId }
  });
  if (!dbSession) return null;
  return mapToSession(dbSession);
}

/**
 * Submit guess
 */
export async function submitGuess(
  sessionId: string,
  guess: string,
  reactionTime: number = 0
): Promise<{ isCorrect: boolean; status: WordGuessStatus; session: WordScrambleGameSession | null }> {
  const dbSession = await prisma.wordGameSession.findUnique({
    where: { sessionId }
  });
  if (!dbSession) return { isCorrect: false, status: 'incorrect', session: null };

  const sessionState = mapToSession(dbSession);
  if (sessionState.isCompleted) {
    return { isCorrect: false, status: 'game_over', session: sessionState };
  }

  const currentWord = sessionState.currentWord;
  if (!currentWord) return { isCorrect: false, status: 'incorrect', session: sessionState };

  const validation = validateWordGuess(guess, currentWord.original);
  
  const attempts = sessionState.attempts || [];
  attempts.push({
    word: currentWord.original,
    guess: guess,
    isCorrect: validation.isCorrect,
    timestamp: new Date(),
    reactionTime,
    wordId: currentWord.id,
    hintsUsed: sessionState.totalHintsUsed,
    attemptsCount: attempts.length + 1
  });

  const state = JSON.parse(dbSession.state || '{}');
  state.attempts = attempts;

  const totalGuesses = dbSession.moves + 1;

  if (!validation.isCorrect) {
    state.currentStreak = 0;
    state.accuracy = dbSession.correctGuesses / totalGuesses;

    const updatedSession = await prisma.wordGameSession.update({
      where: { sessionId },
      data: {
        state: JSON.stringify(state),
        moves: totalGuesses
      }
    });

    return { isCorrect: false, status: validation.status, session: mapToSession(updatedSession) };
  }

  const scoreResult = calculateGuessScore(currentWord, sessionState.currentStreak, reactionTime, sessionState.totalHintsUsed, sessionState.activePowerUps);
  const newScore = dbSession.score + scoreResult.totalScore;
  const correctGuesses = dbSession.correctGuesses + 1;
  const currentStreak = sessionState.currentStreak + 1;
  const maxStreak = Math.max(sessionState.maxStreak, currentStreak);

  state.currentStreak = currentStreak;
  state.maxStreak = maxStreak;
  state.accuracy = correctGuesses / totalGuesses;
  
  updatePerformanceMetrics(state, reactionTime, true);

  const completedWords = [...sessionState.completedWords, currentWord.original];
  state.completedWords = completedWords;

  const nextWordIndex = dbSession.currentWordIndex + 1;
  let completed = dbSession.completed;
  let completedAt = dbSession.completedAt;
  let nextWord = null;

  if (nextWordIndex >= sessionState.totalWords) {
    completed = true;
    completedAt = new Date();
    state.isCompleted = true;
  } else {
    const wordSequence = generateWordSequence(dbSession.difficulty as WordScrambleDifficulty, dbSession.category as WordScrambleCategory);
    nextWord = wordSequence[nextWordIndex] || null;
    state.currentWord = nextWord;
  }

  const completionPercentage = Math.round((correctGuesses / sessionState.totalWords) * 100);
  state.completionPercentage = completionPercentage;

  const newAchievements = checkForAchievements(state, currentWord, reactionTime, sessionState.totalHintsUsed);
  state.achievements = [...(state.achievements || []), ...newAchievements];

  const updatedSession = await prisma.wordGameSession.update({
    where: { sessionId },
    data: {
      words: JSON.stringify(completedWords),
      currentWordIndex: nextWordIndex,
      score: newScore,
      correctGuesses,
      moves: totalGuesses,
      completed,
      completedAt,
      state: JSON.stringify(state)
    }
  });

  return { isCorrect: true, status: 'correct', session: mapToSession(updatedSession) };
}

/**
 * Skip word
 */
export async function skipWord(sessionId: string): Promise<WordScrambleGameSession | null> {
  const dbSession = await prisma.wordGameSession.findUnique({
    where: { sessionId }
  });
  if (!dbSession) return null;

  const sessionState = mapToSession(dbSession);
  if (sessionState.isCompleted) {
    return sessionState;
  }

  const currentWord = sessionState.currentWord;
  if (!currentWord) return sessionState;

  const state = JSON.parse(dbSession.state || '{}');
  const skippedWords = [...sessionState.skippedWords, currentWord.original];
  state.skippedWords = skippedWords;
  state.currentStreak = 0;

  const nextWordIndex = dbSession.currentWordIndex + 1;
  let completed = dbSession.completed;
  let completedAt = dbSession.completedAt;

  if (nextWordIndex >= sessionState.totalWords) {
    completed = true;
    completedAt = new Date();
    state.isCompleted = true;
  } else {
    const wordSequence = generateWordSequence(dbSession.difficulty as WordScrambleDifficulty, dbSession.category as WordScrambleCategory);
    const nextWord = wordSequence[nextWordIndex] || null;
    state.currentWord = nextWord;
  }

  const updatedSession = await prisma.wordGameSession.update({
    where: { sessionId },
    data: {
      currentWordIndex: nextWordIndex,
      completed,
      completedAt,
      state: JSON.stringify(state)
    }
  });

  return mapToSession(updatedSession);
}

/**
 * Complete game session
 */
export async function completeGameSession(sessionId: string): Promise<WordScrambleGameSession | null> {
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
 * Use hint
 */
export async function useHint(
  sessionId: string,
  hintType: string
): Promise<{ hint: WordScrambleHint | null; session: WordScrambleGameSession | null }> {
  const dbSession = await prisma.wordGameSession.findUnique({
    where: { sessionId }
  });
  if (!dbSession) return { hint: null, session: null };

  const state = JSON.parse(dbSession.state || '{}');
  const currentWord = state.currentWord;
  if (!currentWord) return { hint: null, session: mapToSession(dbSession) };

  const hint = generateWordHint(currentWord, hintType);
  if (!hint) return { hint: null, session: mapToSession(dbSession) };

  const hintsUsed = dbSession.hintsUsed + 1;
  state.totalHintsUsed = hintsUsed;

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
 * Create session state
 */
export function createWordScrambleSession(
  config: WordScrambleGameConfig,
  wordSequence: WordScrambleWord[],
  userId?: string
): Partial<WordScrambleGameSession> {
  const sessionId = generateSessionId();
  const startTime = new Date();
  
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
        totalDuration = 300;
        break;
      case 'marathon':
        totalDuration = 1200;
        break;
      default:
        totalDuration = 0;
    }
  }
  
  const totalWords = calculateTotalWords(config.gameMode, wordSequence.length);

  return {
    sessionId,
    userId,
    difficulty: config.difficulty,
    gameMode: config.gameMode,
    category: config.category,
    currentWord: null,
    currentWordIndex: 0,
    totalWords,
    wordsCompleted: 0,
    currentScore: 0,
    startTime,
    timeRemaining: totalDuration,
    totalDuration,
    isPaused: false,
    totalGuesses: 0,
    correctGuesses: 0,
    incorrectGuesses: 0,
    accuracy: 1.0,
    averageReactionTime: 0,
    fastestSolve: 0,
    slowestSolve: 0,
    currentStreak: 0,
    maxStreak: 0,
    perfectWords: 0,
    oneGuessWords: 0,
    activePowerUps: config.enablePowerUps ? initializeGamePowerUps() : [],
    totalHintsUsed: 0,
    maxHints: config.enableHints ? WORD_SCRAMBLE_CONSTANTS.MAX_HINTS : 0,
    isCompleted: false,
    completionPercentage: 0,
    finalRating: '',
    achievements: [],
    categoryStats: {} as Record<WordScrambleCategory, number>,
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
  
  if (normalizedGuess.length < WORD_SCRAMBLE_CONSTANTS.MIN_WORD_LENGTH) {
    return { isCorrect: false, status: 'too_short' };
  }
  
  if (!/^[A-Z]+$/.test(normalizedGuess)) {
    return { isCorrect: false, status: 'invalid_chars' };
  }
  
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
  const baseScore = word.points;
  
  let bonusMultiplier = 1.0;
  if (reactionTime > 0 && reactionTime < WORD_SCRAMBLE_CONSTANTS.SPEED_BONUS_THRESHOLD) {
    const speedBonus = 1 + (WORD_SCRAMBLE_CONSTANTS.SPEED_BONUS_THRESHOLD - reactionTime) / WORD_SCRAMBLE_CONSTANTS.SPEED_BONUS_THRESHOLD;
    bonusMultiplier += speedBonus * 0.5;
  }
  
  let streakBonus = 0;
  if (currentStreak >= 3) {
    const streakMultiplier = Math.min(3.0, 1 + (currentStreak * 0.1));
    streakBonus = Math.round(baseScore * (streakMultiplier - 1));
    bonusMultiplier += (streakMultiplier - 1);
  }
  
  if (hintsUsed > 0) {
    bonusMultiplier = Math.max(0.5, bonusMultiplier - (hintsUsed * 0.15));
  }
  
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
    if (session.fastestSolve === undefined || session.fastestSolve === 0 || reactionTime < session.fastestSolve) {
      session.fastestSolve = reactionTime;
    }
    if (session.slowestSolve === undefined || reactionTime > session.slowestSolve) {
      session.slowestSolve = reactionTime;
    }
    
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
  
  if (reactionTime < 3000 && !currentAchievements.includes('speed_master')) {
    newAchievements.push('speed_master');
  }
  
  if ((session.currentStreak || 0) >= 10 && !currentAchievements.includes('streak_king')) {
    newAchievements.push('streak_king');
  }
  
  if (hintsUsed === 0) {
    const hintFreeWords = session.attempts?.filter((a: any) => a.isCorrect && a.hintsUsed === 0).length || 0;
    if (hintFreeWords >= 5 && !currentAchievements.includes('hint_free')) {
      newAchievements.push('hint_free');
    }
  }
  
  if ((session.totalGuesses || 0) >= 10 && (session.accuracy || 0) >= 1.0 && 
      !currentAchievements.includes('perfect_round')) {
    newAchievements.push('perfect_round');
  }
  
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
  const attempts: any[] = session.attempts || [];
  const correctAttempts = attempts.filter(a => a.isCorrect);
  
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
  
  const accuracy = attempts.length > 0 ? correctAttempts.length / attempts.length : 1;
  const firstTrySuccess = session.oneGuessWords || 0;
  
  const speedRating = calculateSpeedRating(averageReactionTime);
  const accuracyRating = accuracy;
  const streakRating = calculateStreakRating(session.maxStreak || 0);
  const difficultyRating = getDifficultyRating(session.difficulty || 'easy');
  
  const overallRating = (speedRating * 0.3) + (accuracyRating * 0.3) + 
                       (streakRating * 0.25) + (difficultyRating * 0.15);
  
  return {
    averageReactionTime,
    fastestGuess,
    slowestGuess,
    totalAttempts: attempts.length,
    correctAttempts: correctAttempts.length,
    incorrectAttempts: attempts.length - correctAttempts.length,
    accuracy,
    firstTrySuccess,
    longestStreak: session.maxStreak || 0,
    currentStreak: session.currentStreak || 0,
    streakBreaks: 0,
    perfectRounds: session.perfectWords || 0,
    easiestWordSolved: '',
    hardestWordSolved: '',
    averageWordDifficulty: 0,
    difficultyProgression: 0,
    reactionTimeVariance: calculateReactionTimeVariance(reactionTimes),
    consistencyRating: calculateConsistencyRating(reactionTimes),
    improvementRate: 0,
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

// Helpers

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
    timed: 300,
    blitz: 120,
    streak: 300,
    marathon: 1200
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

function initializeGamePowerUps(): any[] {
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
  
  return Math.max(0, 1 - coefficientOfVariation);
}