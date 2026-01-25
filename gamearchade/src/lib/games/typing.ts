// Typing Test Game Core Logic
import {
  TypingGameSession,
  TypingSessionRequest,
  TypingPassage,
  TypingPassageRequest,
  TypingUpdateRequest,
  TypingSessionResult,
  TypingStatistics,
  TypingPerformanceMetrics,
  TypingCharacter,
  TypingWord,
  TypingAchievement,
  TypingDifficulty,
  TypingCategory,
  TypingGameSettings,
  TypingGrade,
  TypingRank
} from "@/types/games/typing";
import { TypingSession } from "@/models/games/typing";
import { 
  calculateWPM, 
  calculateAccuracy, 
  analyzeTypingText,
  generatePassageId,
  getDefaultPassages 
} from "@/utility/games/typing";

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

/**
 * Get a typing passage based on criteria
 */
export async function getTypingPassage(request: TypingPassageRequest): Promise<TypingPassage> {
  const { 
    difficulty = 'beginner', 
    category = 'random', 
    minWords = 10, 
    maxWords = 100,
    language = 'english',
    excludeUsed = false,
    userId 
  } = request;

  // Get default passages
  const passages = getDefaultPassages();
  
  // Filter passages based on criteria
  let filteredPassages = passages.filter(passage => {
    if (difficulty !== 'random' && passage.difficulty !== difficulty) return false;
    if (category !== 'random' && passage.category !== category) return false;
    if (passage.wordCount < minWords || passage.wordCount > maxWords) return false;
    if (passage.language !== language) return false;
    
    return true;
  });

  // If no passages found, relax constraints
  if (filteredPassages.length === 0) {
    filteredPassages = passages.filter(passage => 
      passage.language === language && 
      passage.wordCount >= minWords && 
      passage.wordCount <= maxWords
    );
  }

  // If still no passages, use any passage
  if (filteredPassages.length === 0) {
    filteredPassages = passages;
  }

  // TODO: If excludeUsed and userId provided, filter out used passages
  // This would require tracking user's typing history

  // Select random passage
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
  
  // Get passage
  let passage: TypingPassage;
  
  if (passageId) {
    // Find specific passage
    const passages = getDefaultPassages();
    const foundPassage = passages.find(p => generatePassageId(p.text) === passageId);
    
    if (!foundPassage) {
      throw new Error("Passage not found");
    }
    
    passage = { ...foundPassage, id: passageId };
  } else {
    // Get random passage
    passage = await getTypingPassage({});
  }

  // Initialize characters array
  const characters: TypingCharacter[] = passage.text.split('').map(char => ({
    char,
    status: 'untyped'
  }));

  // Create session
  const session: TypingGameSession = {
    sessionId: `typing_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    passageId: passage.id,
    passage,
    startTime: new Date(),
    isCompleted: false,
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
      missedCharacters: 0,
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

  // Save to database
  const sessionDoc = new TypingSession(session);
  await sessionDoc.save();
  
  return sessionDoc.toObject();
}

/**
 * Update typing session with new input
 */
export async function updateTypingSession(request: TypingUpdateRequest): Promise<TypingGameSession | null> {
  const { sessionId, currentPosition, typedText, timestamp, keystroke } = request;
  
  const session = await TypingSession.findOne({ sessionId });
  
  if (!session) {
    return null;
  }

  if (session.isCompleted || session.isPaused) {
    return session.toObject();
  }

  // Update session data
  session.currentPosition = currentPosition;
  session.typedText = typedText;

  // Update characters status
  const passageText = session.passage.text;
  const updatedCharacters = passageText.split('').map((char, index) => {
    if (index < typedText.length) {
      const typedChar = typedText[index];
      return {
        char,
        status: (typedChar === char ? 'correct' : 'incorrect') as any,
        timestamp: new Date(),
        timeTaken: keystroke?.timeTaken || 0
      };
    } else if (index < typedText.length) {
      return {
        char,
        status: 'extra' as any,
        timestamp: new Date(),
        timeTaken: keystroke?.timeTaken || 0
      };
    } else {
      return {
        char,
        status: 'untyped' as any
      };
    }
  });

  // Add extra characters if typed text is longer
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

  session.characters = updatedCharacters;

  // Update statistics
  session.updateStatistics();

  // Check for mistakes
  if (keystroke && !keystroke.isCorrect) {
    session.addMistake(
      currentPosition, 
      passageText[currentPosition] || '', 
      keystroke.key
    );
  }

  await session.save();
  return session.toObject();
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
  
  const session = await TypingSession.findOne({ sessionId });
  
  if (!session) {
    return null;
  }

  if (session.isCompleted) {
    return null; // Already completed
  }

  // Update final data
  session.typedText = finalText;
  session.endTime = endTime;
  session.isCompleted = true;

  // Calculate final statistics
  await session.updateStatistics();

  // Calculate performance metrics
  const performance = calculatePerformanceMetrics(session.toObject());
  
  // Determine grade
  const grade = calculateTypingGrade(session.statistics);
  
  // Determine rank
  const rank = calculateTypingRank(session.statistics);
  
  // Check for achievements
  const achievements = await checkTypingAchievements(session.toObject());
  session.achievements = achievements;
  
  // Check if personal best
  const userSessions = await TypingSession.find({ 
    userId: session.userId, 
    isCompleted: true,
    _id: { $ne: session._id }
  }).sort({ 'statistics.wpm': -1 });
  
  const personalBest = userSessions.length === 0 || 
    session.statistics.wpm > userSessions[0].statistics.wpm;

  // Generate improvements and recommendations
  const improvements = generateImprovements(session.toObject());
  const weakAreas = identifyWeakAreas(session.toObject());
  const strongAreas = identifyStrongAreas(session.toObject());
  const nextRecommendation = generateNextRecommendation(session.toObject());

  await session.save();

  const result: TypingSessionResult = {
    sessionId,
    finalStatistics: session.statistics,
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
  
  // Speed rating (0-1)
  const speedRating = Math.min(1, statistics.wpm / 100); // 100 WPM = perfect speed
  
  // Accuracy rating (0-1)
  const accuracyRating = statistics.accuracy;
  
  // Consistency rating based on typing rhythm
  let consistencyRating = 1.0;
  if (characters.length > 10) {
    const timings = characters
      .filter(c => c.timeTaken && c.timeTaken > 0)
      .map(c => c.timeTaken!);
    
    if (timings.length > 5) {
      const avgTiming = timings.reduce((a, b) => a + b, 0) / timings.length;
      const variance = timings.reduce((sum, timing) => sum + Math.pow(timing - avgTiming, 2), 0) / timings.length;
      const stdDev = Math.sqrt(variance);
      consistencyRating = Math.max(0, 1 - (stdDev / avgTiming)); // Lower deviation = higher consistency
    }
  }
  
  // Rhythm rating (similar to consistency but focuses on keystroke intervals)
  const rhythmRating = consistencyRating; // Simplified for now
  
  // Stamina rating (performance over time - simplified)
  const staminaRating = statistics.timeElapsed > 60000 ? // Over 1 minute
    Math.max(0.5, 1 - (mistakes.length / statistics.totalCharacters)) : 1.0;
  
  // Adaptability rating (simplified)
  const adaptabilityRating = 1.0 - (mistakes.length / Math.max(1, statistics.totalCharacters));
  
  // Overall rating (weighted average)
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
  
  // Combined score based on WPM and accuracy
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
  
  // Speed achievements
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
  
  // Accuracy achievements
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
  
  // Endurance achievements
  if (statistics.timeElapsed >= 300000) { // 5 minutes
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
  
  // Analyze common mistake patterns
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