// Typing Test Game Core Logic
import { prisma } from '@/lib/api/prisma';
import { 
  calculateWPM, 
  calculateAccuracy, 
  analyzeTypingText,
  generatePassageId,
  getDefaultPassages 
} from "@/utility/games/typing";
import type {
  TypingPassage,
  TypingCharacter,
  TypingWord,
  TypingStatistics,
  TypingGameSession,
  TypingMistake,
  TypingGameSettings,
  TypingPerformanceMetrics,
  TypingSessionResult,
  TypingAchievement,
  TypingDifficulty,
  TypingCategory,
  TypingGameMode,
  TypingGrade,
  TypingRank,
  TypingPassageRequest,
  TypingSessionRequest,
  TypingUpdateRequest
} from '@/types/games/typing';

// Default game settings
const DEFAULT_SETTINGS: TypingGameSettings = {
  showWpm: true,
  showAccuracy: true,
  showTimer: true,
  showProgress: true,
  enableSound: false,
  highlightErrors: true,
  stopOnError: false,
  confidenceMode: false,
  cursorFollowing: true,
  fontSize: 16,
  theme: 'default',
  keyboardLayout: 'qwerty'
};

function mapToSession(dbSession: any): TypingGameSession {
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
    userId: dbSession.userId || '',
    passageId: state.passageId || '',
    passage: state.passage,
    startTime: dbSession.startedAt,
    endTime: dbSession.completedAt || undefined,
    isCompleted: dbSession.completed,
    isPaused: state.isPaused ?? false,
    currentPosition: state.currentPosition ?? 0,
    typedText: state.typedText || '',
    words: state.words || [],
    characters: state.characters || [],
    statistics: state.statistics || {
      wpm: 0,
      netWpm: 0,
      grossWpm: 0,
      accuracy: 0,
      errorRate: 0,
      totalCharacters: 0,
      correctCharacters: 0,
      incorrectCharacters: 0,
      totalWords: 0,
      correctWords: 0,
      incorrectWords: 0,
      extraCharacters: 0,
      missedCharacters: 0,
      totalKeystrokes: 0,
      backspaces: 0,
      timeElapsed: 0
    },
    gameMode: state.gameMode || 'standard',
    timeLimit,
    wordLimit: state.wordLimit,
    settings: state.settings || DEFAULT_SETTINGS,
    mistakes: state.mistakes || [],
    achievements: state.achievements || []
  };
}

function updateSessionStatistics(sessionState: any, endTime?: Date) {
  const typedText = sessionState.typedText || '';
  const passageText = sessionState.passage?.text || '';
  const characters: TypingCharacter[] = sessionState.characters || [];
  const start = new Date(sessionState.startTime);
  const end = endTime || new Date();
  const timeElapsed = Math.max(1000, end.getTime() - start.getTime()); // at least 1 second to avoid division by zero

  const totalKeystrokes = typedText.length + (sessionState.statistics?.backspaces || 0);

  const correctChars = characters.filter(c => c.status === 'correct').length;
  const incorrectChars = characters.filter(c => c.status === 'incorrect').length;
  const extraChars = characters.filter(c => c.status === 'extra').length;

  const totalCharacters = typedText.length;
  const accuracy = totalCharacters > 0 ? correctChars / totalCharacters : 0;
  const errorRate = totalCharacters > 0 ? incorrectChars / totalCharacters : 0;

  const grossWpm = calculateWPM(totalCharacters, timeElapsed, true);
  const netWpm = Math.max(0, grossWpm - Math.round((incorrectChars / 5) / (timeElapsed / 60000)));

  const typedWords = typedText.trim().split(/\s+/).filter((w: string) => w.length > 0);
  const passageWords = passageText.trim().split(/\s+/).filter((w: string) => w.length > 0);
  let correctWords = 0;
  let incorrectWords = 0;

  typedWords.forEach((word: string, idx: number) => {
    if (word === passageWords[idx]) {
      correctWords++;
    } else {
      incorrectWords++;
    }
  });

  const totalWords = typedWords.length;

  sessionState.statistics = {
    wpm: netWpm,
    netWpm,
    grossWpm,
    accuracy,
    errorRate,
    totalCharacters,
    correctCharacters: correctChars,
    incorrectCharacters: incorrectChars,
    totalWords,
    correctWords,
    incorrectWords,
    extraCharacters: extraChars,
    missedCharacters: Math.max(0, passageText.length - typedText.length),
    totalKeystrokes,
    backspaces: sessionState.statistics?.backspaces || 0,
    timeElapsed
  };
}

function addMistakeToSession(sessionState: any, position: number, expected: string, actual: string) {
  const mistakes = sessionState.mistakes || [];
  mistakes.push({
    position,
    expected,
    typed: actual,
    timestamp: new Date(),
    wordIndex: Math.max(0, expected.split(/\s+/).length - 1),
    characterIndex: position
  });
  sessionState.mistakes = mistakes;
}

/**
 * Get a typing passage based on criteria
 */
export async function getTypingPassage(request: TypingPassageRequest): Promise<TypingPassage> {
  const { 
    difficulty = 'beginner', 
    category = 'random', 
    minWords = 10, 
    maxWords = 100,
    language = 'english'
  } = request;

  const passages = getDefaultPassages();
  
  let filteredPassages = passages.filter(passage => {
    if ((difficulty as string) !== 'random' && passage.difficulty !== difficulty) return false;
    if (category !== 'random' && passage.category !== category) return false;
    if (passage.wordCount < minWords || passage.wordCount > maxWords) return false;
    if (passage.language !== language) return false;
    
    return true;
  });

  if (filteredPassages.length === 0) {
    filteredPassages = passages.filter(passage => 
      passage.language === language && 
      passage.wordCount >= minWords && 
      passage.wordCount <= maxWords
    );
  }

  if (filteredPassages.length === 0) {
    filteredPassages = passages;
  }

  const randomIndex = Math.floor(Math.random() * filteredPassages.length);
  const selectedPassage = filteredPassages[randomIndex];

  return {
    ...selectedPassage,
    id: generatePassageId(selectedPassage.text)
  };
}

/**
 * Get multiple random typing passages
 */
export async function getRandomTypingPassages(
  count: number = 3, 
  request: TypingPassageRequest = {}
): Promise<TypingPassage[]> {
  const passages: TypingPassage[] = [];
  
  for (let i = 0; i < count; i++) {
    const passage = await getTypingPassage(request);
    passages.push(passage);
  }
  
  return passages;
}

/**
 * Create a new typing session
 */
export async function createTypingSession(request: TypingSessionRequest): Promise<TypingGameSession> {
  const { userId, passageId, gameMode, timeLimit, wordLimit, settings } = request;
  
  let passage: TypingPassage;
  
  if (passageId) {
    const passages = getDefaultPassages();
    const foundPassage = passages.find(p => generatePassageId(p.text) === passageId);
    
    if (!foundPassage) {
      throw new Error("Passage not found");
    }
    
    passage = { ...foundPassage, id: passageId };
  } else {
    passage = await getTypingPassage({});
  }

  const characters: TypingCharacter[] = passage.text.split('').map(char => ({
    char,
    status: 'untyped'
  }));

  const sessionId = `typing_${userId || 'guest'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const state = {
    passageId: passage.id,
    passage,
    isPaused: false,
    currentPosition: 0,
    typedText: '',
    words: [],
    characters,
    statistics: {
      wpm: 0,
      netWpm: 0,
      grossWpm: 0,
      accuracy: 0,
      errorRate: 0,
      totalCharacters: 0,
      correctCharacters: 0,
      incorrectCharacters: 0,
      totalWords: 0,
      correctWords: 0,
      incorrectWords: 0,
      extraCharacters: 0,
      missedCharacters: passage.text.length,
      totalKeystrokes: 0,
      backspaces: 0,
      timeElapsed: 0
    },
    gameMode,
    timeLimit,
    wordLimit,
    settings: { ...DEFAULT_SETTINGS, ...settings },
    mistakes: [],
    achievements: []
  };

  const session = await prisma.gameSession.create({
    data: {
      userId: userId || null,
      sessionId,
      game: 'typing',
      difficulty: passage.difficulty,
      state: JSON.stringify(state),
      startedAt: new Date(),
      completed: false,
      score: 0
    }
  });
  
  return mapToSession(session);
}

/**
 * Update typing session with new input
 */
export async function updateTypingSession(request: TypingUpdateRequest): Promise<TypingGameSession | null> {
  const { sessionId, currentPosition, typedText, keystroke } = request;
  
  const session = await prisma.gameSession.findUnique({
    where: { sessionId }
  });
  
  if (!session) {
    return null;
  }

  const state = JSON.parse(session.state || '{}');
  if (session.completed || state.isPaused) {
    return mapToSession(session);
  }

  state.currentPosition = currentPosition;
  state.typedText = typedText;

  const passageText = state.passage.text;
  const updatedCharacters = passageText.split('').map((char: string, index: number) => {
    if (index < typedText.length) {
      const typedChar = typedText[index];
      return {
        char,
        status: typedChar === char ? 'correct' : 'incorrect',
        timestamp: new Date(),
        timeTaken: keystroke?.timeTaken || 0
      };
    } else {
      return {
        char,
        status: 'untyped'
      };
    }
  });

  if (typedText.length > passageText.length) {
    for (let i = passageText.length; i < typedText.length; i++) {
      updatedCharacters.push({
        char: typedText[i],
        status: 'extra',
        timestamp: new Date(),
        timeTaken: keystroke?.timeTaken || 0
      });
    }
  }

  state.characters = updatedCharacters;

  if (keystroke?.key === 'Backspace') {
    state.statistics.backspaces = (state.statistics.backspaces || 0) + 1;
  }

  updateSessionStatistics(state);

  if (keystroke && !keystroke.isCorrect) {
    addMistakeToSession(state, currentPosition, passageText[currentPosition] || '', keystroke.key);
  }

  const updatedSession = await prisma.gameSession.update({
    where: { sessionId },
    data: {
      state: JSON.stringify(state)
    }
  });

  return mapToSession(updatedSession);
}

/**
 * Complete a typing session and calculate final results
 */
export async function completeTypingSession(params: {
  sessionId: string;
  finalText: string;
  endTime: Date;
}): Promise<TypingSessionResult | null> {
  const { sessionId, finalText, endTime } = params;
  
  const session = await prisma.gameSession.findUnique({
    where: { sessionId }
  });
  
  if (!session) {
    return null;
  }

  if (session.completed) {
    return null;
  }

  const state = JSON.parse(session.state || '{}');
  state.typedText = finalText;
  state.isCompleted = true;

  updateSessionStatistics(state, endTime);

  const finalStatistics = state.statistics;
  const performance = calculatePerformanceMetrics(state);
  const grade = calculateTypingGrade(finalStatistics);
  const rank = calculateTypingRank(finalStatistics);
  const achievements = await checkTypingAchievements(state);
  state.achievements = achievements;

  const score = finalStatistics.wpm;

  let personalBest = false;
  if (session.userId) {
    const userSessions = await prisma.gameSession.findMany({
      where: { 
        userId: session.userId, 
        game: 'typing',
        completed: true
      },
      orderBy: { score: 'desc' },
      take: 1
    });
    personalBest = userSessions.length === 0 || score > userSessions[0].score;
  }

  const improvements = generateImprovements(state);
  const weakAreas = identifyWeakAreas(state);
  const strongAreas = identifyStrongAreas(state);
  const nextRecommendation = generateNextRecommendation(state);

  const duration = Math.floor((endTime.getTime() - session.startedAt.getTime()) / 1000);

  await prisma.gameSession.update({
    where: { sessionId },
    data: {
      completed: true,
      completedAt: endTime,
      duration,
      score,
      state: JSON.stringify(state)
    }
  });

  const result: TypingSessionResult = {
    sessionId,
    finalStatistics,
    performance,
    grade,
    improvements,
    weakAreas,
    strongAreas,
    nextRecommendation,
    achievements,
    personalBest,
    rank
  };

  return result;
}

/**
 * Calculate performance metrics
 */
export function calculatePerformanceMetrics(session: TypingGameSession): TypingPerformanceMetrics {
  const { statistics, mistakes, characters } = session;
  
  const speedRating = Math.min(1, statistics.wpm / 100);
  
  const accuracyRating = statistics.accuracy;
  
  let consistencyRating = 1.0;
  if (characters.length > 10) {
    const timings = characters
      .filter(c => c.timeTaken && c.timeTaken > 0)
      .map(c => c.timeTaken!);
    
    if (timings.length > 5) {
      const avgTiming = timings.reduce((a, b) => a + b, 0) / timings.length;
      const variance = timings.reduce((sum, timing) => sum + Math.pow(timing - avgTiming, 2), 0) / timings.length;
      const stdDev = Math.sqrt(variance);
      consistencyRating = Math.max(0, 1 - (stdDev / avgTiming));
    }
  }
  
  const rhythmRating = consistencyRating;
  
  const staminaRating = statistics.timeElapsed > 60000 ? 
    Math.max(0.5, 1 - (mistakes.length / statistics.totalCharacters)) : 1.0;
  
  const adaptabilityRating = 1.0 - (mistakes.length / Math.max(1, statistics.totalCharacters));
  
  const overallRating = (
    speedRating * 0.3 +
    accuracyRating * 0.25 +
    consistencyRating * 0.2 +
    rhythmRating * 0.15 +
    staminaRating * 0.05 +
    adaptabilityRating * 0.05
  );
  
  return {
    consistency: Math.round(consistencyRating * 100) / 100,
    rhythm: Math.round(rhythmRating * 100) / 100,
    speed: Math.round(speedRating * 100) / 100,
    accuracy: Math.round(accuracyRating * 100) / 100,
    stamina: Math.round(staminaRating * 100) / 100,
    adaptability: Math.round(adaptabilityRating * 100) / 100,
    overallRating: Math.round(overallRating * 100) / 100
  };
}

/**
 * Calculate typing grade
 */
export function calculateTypingGrade(statistics: TypingStatistics): TypingGrade {
  const { wpm, accuracy } = statistics;
  const accuracyPercent = accuracy * 100;
  
  const combinedScore = (wpm * 0.7) + (accuracyPercent * 0.3);
  
  if (combinedScore >= 85 && accuracyPercent >= 95) return 'SSS';
  if (combinedScore >= 75 && accuracyPercent >= 90) return 'SS';
  if (combinedScore >= 65 && accuracyPercent >= 85) return 'S';
  if (combinedScore >= 55 && accuracyPercent >= 80) return 'A';
  if (combinedScore >= 45 && accuracyPercent >= 75) return 'B';
  if (combinedScore >= 35 && accuracyPercent >= 70) return 'C';
  if (combinedScore >= 25 && accuracyPercent >= 60) return 'D';
  return 'F';
}

/**
 * Calculate typing rank
 */
export function calculateTypingRank(statistics: TypingStatistics): TypingRank {
  const { wpm, accuracy } = statistics;
  const accuracyPercent = accuracy * 100;
  
  if (wpm >= 80 && accuracyPercent >= 95) return 'Legend';
  if (wpm >= 70 && accuracyPercent >= 90) return 'Grandmaster';
  if (wpm >= 60 && accuracyPercent >= 85) return 'Master';
  if (wpm >= 45 && accuracyPercent >= 80) return 'Expert';
  if (wpm >= 30 && accuracyPercent >= 75) return 'Skilled';
  if (wpm >= 20 && accuracyPercent >= 70) return 'Apprentice';
  return 'Novice';
}

/**
 * Check for achievements
 */
export async function checkTypingAchievements(session: TypingGameSession): Promise<TypingAchievement[]> {
  const { statistics, mistakes } = session;
  const achievements: TypingAchievement[] = [];
  
  if (statistics.wpm >= 20) {
    achievements.push({
      id: 'speed_20',
      name: 'Getting Started',
      description: 'Reach 20 WPM',
      condition: 'wpm >= 20',
      category: 'speed',
      unlocked: true,
      unlockedAt: new Date(),
      rarity: 'common'
    });
  }
  
  if (statistics.wpm >= 40) {
    achievements.push({
      id: 'speed_40',
      name: 'Steady Typer',
      description: 'Reach 40 WPM',
      condition: 'wpm >= 40',
      category: 'speed',
      unlocked: true,
      unlockedAt: new Date(),
      rarity: 'common'
    });
  }
  
  if (statistics.wpm >= 60) {
    achievements.push({
      id: 'speed_60',
      name: 'Fast Fingers',
      description: 'Reach 60 WPM',
      condition: 'wpm >= 60',
      category: 'speed',
      unlocked: true,
      unlockedAt: new Date(),
      rarity: 'rare'
    });
  }
  
  if (statistics.wpm >= 80) {
    achievements.push({
      id: 'speed_80',
      name: 'Speed Demon',
      description: 'Reach 80 WPM',
      condition: 'wpm >= 80',
      category: 'speed',
      unlocked: true,
      unlockedAt: new Date(),
      rarity: 'epic'
    });
  }
  
  if (statistics.wpm >= 100) {
    achievements.push({
      id: 'speed_100',
      name: 'Century Club',
      description: 'Reach 100 WPM',
      condition: 'wpm >= 100',
      category: 'speed',
      unlocked: true,
      unlockedAt: new Date(),
      rarity: 'legendary'
    });
  }
  
  if (statistics.accuracy >= 0.95) {
    achievements.push({
      id: 'accuracy_95',
      name: 'Precision Typist',
      description: 'Achieve 95% accuracy',
      condition: 'accuracy >= 0.95',
      category: 'accuracy',
      unlocked: true,
      unlockedAt: new Date(),
      rarity: 'rare'
    });
  }
  
  if (statistics.accuracy >= 0.99) {
    achievements.push({
      id: 'accuracy_99',
      name: 'Near Perfect',
      description: 'Achieve 99% accuracy',
      condition: 'accuracy >= 0.99',
      category: 'accuracy',
      unlocked: true,
      unlockedAt: new Date(),
      rarity: 'epic'
    });
  }
  
  if (statistics.accuracy >= 1.0 && mistakes.length === 0) {
    achievements.push({
      id: 'perfect_typing',
      name: 'Perfect Typing',
      description: 'Complete with 100% accuracy and no mistakes',
      condition: 'accuracy = 1.0 && mistakes = 0',
      category: 'accuracy',
      unlocked: true,
      unlockedAt: new Date(),
      rarity: 'legendary'
    });
  }
  
  if (statistics.timeElapsed >= 300000) {
    achievements.push({
      id: 'endurance_5min',
      name: 'Marathon Typist',
      description: 'Type for 5 minutes straight',
      condition: 'time >= 300 seconds',
      category: 'endurance',
      unlocked: true,
      unlockedAt: new Date(),
      rarity: 'rare'
    });
  }
  
  return achievements;
}

/**
 * Generate improvement suggestions
 */
export function generateImprovements(session: TypingGameSession): string[] {
  const { statistics, mistakes } = session;
  const improvements: string[] = [];
  
  if (statistics.accuracy < 0.9) {
    improvements.push("Focus on accuracy over speed - slow down and make fewer mistakes");
  }
  
  if (statistics.wpm < 30) {
    improvements.push("Practice touch typing to increase your speed");
  }
  
  if (mistakes.length > statistics.totalCharacters * 0.1) {
    improvements.push("Work on finger positioning and reduce typing errors");
  }
  
  const commonMistakes = mistakes.reduce((acc, mistake) => {
    acc[mistake.expected] = (acc[mistake.expected] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostMissedChar = Object.entries(commonMistakes)
    .sort(([,a], [,b]) => b - a)[0];
  
  if (mostMissedChar && mostMissedChar[1] > 2) {
    improvements.push(`Practice typing the '${mostMissedChar[0]}' character more accurately`);
  }
  
  return improvements;
}

/**
 * Identify weak areas
 */
export function identifyWeakAreas(session: TypingGameSession): string[] {
  const { statistics, mistakes } = session;
  const weakAreas: string[] = [];
  
  if (statistics.accuracy < 0.8) {
    weakAreas.push("Accuracy");
  }
  
  if (statistics.wpm < 25) {
    weakAreas.push("Speed");
  }
  
  if (mistakes.length > 10) {
    weakAreas.push("Error Rate");
  }
  
  return weakAreas;
}

/**
 * Identify strong areas
 */
export function identifyStrongAreas(session: TypingGameSession): string[] {
  const { statistics, mistakes } = session;
  const strongAreas: string[] = [];
  
  if (statistics.accuracy >= 0.95) {
    strongAreas.push("Accuracy");
  }
  
  if (statistics.wpm >= 50) {
    strongAreas.push("Speed");
  }
  
  if (mistakes.length <= 2) {
    strongAreas.push("Error Rate");
  }
  
  return strongAreas;
}

/**
 * Generate next recommendation
 */
export function generateNextRecommendation(session: TypingGameSession): string {
  const { statistics } = session;
  
  if (statistics.accuracy < 0.85) {
    return "Focus on accuracy with slower, deliberate typing practice";
  }
  
  if (statistics.wpm < 40) {
    return "Practice speed drills with common words and phrases";
  }
  
  if (statistics.wpm >= 60 && statistics.accuracy >= 0.95) {
    return "Challenge yourself with advanced texts or programming code";
  }
  
  return "Continue practicing to build consistency and muscle memory";
}