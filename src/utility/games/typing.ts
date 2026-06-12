// Typing Test Game Utility Functions
import {
  TypingPassage,
  TypingDifficulty,
  TypingCategory,
  TypingStatistics,
  TypingCharacter,
  TypingPerformanceMetrics
} from "@/types/games/typing";

/**
 * Calculate Words Per Minute (WPM)
 */
export function calculateWPM(
  charactersTyped: number, 
  timeElapsedMs: number, 
  includeSpaces: boolean = true
): number {
  const timeInMinutes = timeElapsedMs / 60000;
  if (timeInMinutes === 0) return 0;
  
  // Standard WPM calculation: (characters / 5) / time in minutes
  const divisor = includeSpaces ? 5 : 4; // Include or exclude spaces in calculation
  return Math.round((charactersTyped / divisor) / timeInMinutes);
}

/**
 * Calculate typing accuracy
 */
export function calculateAccuracy(correctChars: number, totalChars: number): number {
  if (totalChars === 0) return 0;
  return correctChars / totalChars;
}

/**
 * Calculate net WPM (accounting for errors)
 */
export function calculateNetWPM(
  grossWPM: number, 
  incorrectChars: number, 
  timeElapsedMs: number
): number {
  const timeInMinutes = timeElapsedMs / 60000;
  const penaltyWPM = timeInMinutes > 0 ? (incorrectChars / 5) / timeInMinutes : 0;
  return Math.max(0, Math.round(grossWPM - penaltyWPM));
}

/**
 * Analyze text for difficulty metrics
 */
export function analyzeTypingText(text: string): {
  wordCount: number;
  averageWordLength: number;
  commonWords: number;
  specialCharacters: number;
  difficulty: TypingDifficulty;
} {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Calculate average word length
  const totalWordLength = words.reduce((sum, word) => sum + word.length, 0);
  const averageWordLength = wordCount > 0 ? totalWordLength / wordCount : 0;
  
  // Count common words (basic list of most frequent English words)
  const commonWordsList = new Set([
    'the', 'and', 'to', 'of', 'a', 'in', 'is', 'it', 'you', 'that', 'he', 'was', 'for', 'on', 'are', 'as', 'with',
    'his', 'they', 'i', 'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by', 'word', 'but', 'not', 'what',
    'all', 'were', 'we', 'when', 'your', 'can', 'said', 'there', 'each', 'which', 'do', 'how', 'their', 'if', 'will'
  ]);
  
  const commonWords = words.filter(word => 
    commonWordsList.has(word.toLowerCase().replace(/[^\w]/g, ''))
  ).length;
  
  // Count special characters (non-alphanumeric, excluding spaces)
  const specialCharacters = (text.match(/[^\w\s]/g) || []).length;
  
  // Determine difficulty based on metrics
  let difficulty: TypingDifficulty = 'beginner';
  
  if (averageWordLength > 6 || specialCharacters > text.length * 0.1) {
    difficulty = 'master';
  } else if (averageWordLength > 5 || specialCharacters > text.length * 0.05) {
    difficulty = 'expert';
  } else if (averageWordLength > 4.5 || commonWords / wordCount < 0.3) {
    difficulty = 'advanced';
  } else if (averageWordLength > 4 || commonWords / wordCount < 0.5) {
    difficulty = 'intermediate';
  }
  
  return {
    wordCount,
    averageWordLength: Math.round(averageWordLength * 100) / 100,
    commonWords,
    specialCharacters,
    difficulty
  };
}

/**
 * Generate a unique passage ID from text
 */
export function generatePassageId(text: string): string {
  // Create a simple hash of the text
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `passage_${Math.abs(hash).toString(36)}`;
}

/**
 * Format WPM for display
 */
export function formatWPM(wpm: number): string {
  return Math.round(wpm).toString();
}

/**
 * Format accuracy percentage
 */
export function formatAccuracy(accuracy: number): string {
  return `${Math.round(accuracy * 100)}%`;
}

/**
 * Format time duration
 */
export function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${remainingSeconds}s`;
}

/**
 * Get color for WPM display
 */
export function getWPMColor(wpm: number): string {
  if (wpm >= 80) return '#4CAF50'; // Green
  if (wpm >= 60) return '#8BC34A'; // Light Green
  if (wpm >= 40) return '#FFEB3B'; // Yellow
  if (wpm >= 20) return '#FF9800'; // Orange
  return '#F44336'; // Red
}

/**
 * Get color for accuracy display
 */
export function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 0.95) return '#4CAF50'; // Green
  if (accuracy >= 0.90) return '#8BC34A'; // Light Green
  if (accuracy >= 0.80) return '#FFEB3B'; // Yellow
  if (accuracy >= 0.70) return '#FF9800'; // Orange
  return '#F44336'; // Red
}

/**
 * Calculate typing consistency
 */
export function calculateConsistency(timings: number[]): number {
  if (timings.length < 2) return 1.0;
  
  const mean = timings.reduce((sum, time) => sum + time, 0) / timings.length;
  const variance = timings.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / timings.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Lower standard deviation relative to mean indicates higher consistency
  const coefficient = mean > 0 ? standardDeviation / mean : 1;
  return Math.max(0, Math.min(1, 1 - coefficient));
}

/**
 * Get difficulty settings
 */
export function getDifficultySettings(difficulty: TypingDifficulty): {
  targetWPM: number;
  targetAccuracy: number;
  timeLimit?: number;
  allowedMistakes: number;
} {
  switch (difficulty) {
    case 'beginner':
      return {
        targetWPM: 20,
        targetAccuracy: 0.90,
        timeLimit: 120, // 2 minutes
        allowedMistakes: 10
      };
    case 'intermediate':
      return {
        targetWPM: 35,
        targetAccuracy: 0.93,
        timeLimit: 120,
        allowedMistakes: 7
      };
    case 'advanced':
      return {
        targetWPM: 50,
        targetAccuracy: 0.95,
        timeLimit: 120,
        allowedMistakes: 5
      };
    case 'expert':
      return {
        targetWPM: 70,
        targetAccuracy: 0.97,
        timeLimit: 120,
        allowedMistakes: 3
      };
    case 'master':
      return {
        targetWPM: 90,
        targetAccuracy: 0.99,
        timeLimit: 120,
        allowedMistakes: 1
      };
    default:
      return {
        targetWPM: 30,
        targetAccuracy: 0.85,
        allowedMistakes: 10
      };
  }
}

/**
 * Validate typing statistics
 */
export function validateTypingStats(stats: Partial<TypingStatistics>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (stats.wpm !== undefined && (stats.wpm < 0 || stats.wpm > 300)) {
    errors.push('WPM must be between 0 and 300');
  }
  
  if (stats.accuracy !== undefined && (stats.accuracy < 0 || stats.accuracy > 1)) {
    errors.push('Accuracy must be between 0 and 1');
  }
  
  if (stats.totalCharacters !== undefined && stats.totalCharacters < 0) {
    errors.push('Total characters must be non-negative');
  }
  
  if (stats.correctCharacters !== undefined && stats.incorrectCharacters !== undefined && 
      stats.totalCharacters !== undefined) {
    if (stats.correctCharacters + stats.incorrectCharacters > stats.totalCharacters) {
      errors.push('Correct + incorrect characters cannot exceed total characters');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calculate performance rating
 */
export function getPerformanceRating(metrics: TypingPerformanceMetrics): string {
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
 * Get text suggestions based on performance
 */
export function getTextSuggestions(
  currentWPM: number, 
  currentAccuracy: number
): { difficulty: TypingDifficulty; categories: TypingCategory[] } {
  let difficulty: TypingDifficulty = 'beginner';
  let categories: TypingCategory[] = ['random'];
  
  if (currentWPM >= 60 && currentAccuracy >= 0.95) {
    difficulty = 'master';
    categories = ['programming', 'technology', 'literature'];
  } else if (currentWPM >= 45 && currentAccuracy >= 0.90) {
    difficulty = 'expert';
    categories = ['business', 'science', 'news'];
  } else if (currentWPM >= 30 && currentAccuracy >= 0.85) {
    difficulty = 'advanced';
    categories = ['quotes', 'literature', 'technology'];
  } else if (currentWPM >= 20 && currentAccuracy >= 0.80) {
    difficulty = 'intermediate';
    categories = ['quotes', 'random'];
  }
  
  return { difficulty, categories };
}

/**
 * Calculate improvement rate
 */
export function calculateImprovementRate(
  previousWPM: number, 
  currentWPM: number, 
  daysBetween: number
): number {
  if (daysBetween === 0 || previousWPM === 0) return 0;
  const improvement = currentWPM - previousWPM;
  return improvement / daysBetween; // WPM improvement per day
}

/**
 * Default typing passages
 */
export function getDefaultPassages(): TypingPassage[] {
  return [
    {
      id: 'passage_1',
      text: "Fast typing tests make you accurate and quick. Practice makes perfect when you focus on proper technique and rhythm.",
      title: "Basic Typing Practice",
      difficulty: 'beginner',
      language: 'english',
      category: 'random',
      wordCount: 16,
      averageWordLength: 5.2,
      commonWords: 12,
      specialCharacters: 2,
      tags: ['practice', 'basic']
    },
    {
      id: 'passage_2',
      text: "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet and is perfect for practicing all keys on your keyboard.",
      title: "Pangram Practice",
      difficulty: 'intermediate',
      language: 'english',
      category: 'random',
      wordCount: 23,
      averageWordLength: 4.8,
      commonWords: 15,
      specialCharacters: 3,
      tags: ['pangram', 'alphabet', 'complete']
    },
    {
      id: 'passage_3',
      text: "In the realm of technology, artificial intelligence continues to revolutionize industries and transform the way we interact with digital systems and automated processes.",
      title: "Technology Text",
      difficulty: 'advanced',
      language: 'english',
      category: 'technology',
      wordCount: 23,
      averageWordLength: 6.8,
      commonWords: 8,
      specialCharacters: 0,
      tags: ['technology', 'ai', 'advanced']
    },
    {
      id: 'passage_4',
      text: "function calculateSum(array) { return array.reduce((acc, num) => acc + num, 0); }",
      title: "JavaScript Code",
      difficulty: 'expert',
      language: 'english',
      category: 'programming',
      wordCount: 12,
      averageWordLength: 4.2,
      commonWords: 2,
      specialCharacters: 25,
      tags: ['programming', 'javascript', 'code']
    },
    {
      id: 'passage_5',
      text: "To be or not to be, that is the question: Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles.",
      title: "Shakespeare Quote",
      difficulty: 'advanced',
      language: 'english',
      category: 'literature',
      wordCount: 32,
      averageWordLength: 4.1,
      commonWords: 20,
      specialCharacters: 8,
      tags: ['shakespeare', 'literature', 'classic']
    },
    {
      id: 'passage_6',
      text: "The mitochondria is the powerhouse of the cell, responsible for producing ATP through cellular respiration in eukaryotic organisms.",
      title: "Biology Facts",
      difficulty: 'expert',
      language: 'english',
      category: 'science',
      wordCount: 17,
      averageWordLength: 6.9,
      commonWords: 5,
      specialCharacters: 0,
      tags: ['biology', 'science', 'education']
    },
    {
      id: 'passage_7',
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      title: "Motivational Quote",
      difficulty: 'intermediate',
      language: 'english',
      category: 'quotes',
      wordCount: 14,
      averageWordLength: 5.3,
      commonWords: 8,
      specialCharacters: 3,
      tags: ['motivation', 'quotes', 'wisdom']
    },
    {
      id: 'passage_8',
      text: "In today's global economy, businesses must adapt to rapidly changing market conditions and embrace digital transformation to remain competitive in their respective industries.",
      title: "Business Strategy",
      difficulty: 'advanced',
      language: 'english',
      category: 'business',
      wordCount: 23,
      averageWordLength: 6.4,
      commonWords: 8,
      specialCharacters: 0,
      tags: ['business', 'strategy', 'economy']
    }
  ];
}

/**
 * Get random passage from defaults
 */
export function getRandomDefaultPassage(): TypingPassage {
  const passages = getDefaultPassages();
  return passages[Math.floor(Math.random() * passages.length)];
}

/**
 * Filter passages by criteria
 */
export function filterPassages(
  passages: TypingPassage[],
  criteria: {
    difficulty?: TypingDifficulty;
    category?: TypingCategory;
    minWords?: number;
    maxWords?: number;
    tags?: string[];
  }
): TypingPassage[] {
  return passages.filter(passage => {
    if (criteria.difficulty && passage.difficulty !== criteria.difficulty) return false;
    if (criteria.category && passage.category !== criteria.category) return false;
    if (criteria.minWords && passage.wordCount < criteria.minWords) return false;
    if (criteria.maxWords && passage.wordCount > criteria.maxWords) return false;
    if (criteria.tags && !criteria.tags.some(tag => passage.tags.includes(tag))) return false;
    
    return true;
  });
}