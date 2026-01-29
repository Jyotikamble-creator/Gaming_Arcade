// Typing Test game constants and utilities
import { CharacterStyle, TypingTestStats, TypingPerformanceRating } from '@/types/games/typing-test';

// Game configuration constants
export const TYPING_CONFIG = {
  MIN_CHARS_FOR_WPM: 5,
  WORDS_PER_MINUTE_DIVISOR: 5, // Standard: 1 word = 5 characters
  ACCURACY_PRECISION: 0,
  GAME_NAME: 'typing-test',
  DEFAULT_TIME_LIMIT: 60 * 1000, // 60 seconds in milliseconds
  MIN_ACCURACY_FOR_SCORE: 80 // Minimum accuracy percentage for score submission
} as const;

// Character styling constants
export const CHARACTER_STYLES = {
  CORRECT: 'text-green-400',
  INCORRECT: 'bg-red-700 text-white',
  CURRENT: 'text-white border-r-2 border-yellow-400',
  UNTYPED: 'text-white'
} as const;

// Performance rating thresholds
export const PERFORMANCE_THRESHOLDS = {
  MASTER: 80,
  EXPERT: 60,
  ADVANCED: 40,
  INTERMEDIATE: 25,
  BEGINNER: 0
} as const;

// Utility functions
export const calculateWPM = (charactersTyped: number, elapsedTimeMs: number): number => {
  if (elapsedTimeMs <= 0) return 0;
  const minutes = elapsedTimeMs / (1000 * 60);
  const words = charactersTyped / TYPING_CONFIG.WORDS_PER_MINUTE_DIVISOR;
  return Math.round(words / minutes);
};

export const calculateAccuracy = (input: string, sourceText: string): number => {
  if (input.length === 0) return 100;
  
  const inputChars = input.split('');
  const sourceChars = sourceText.slice(0, inputChars.length).split('');
  const correctChars = inputChars.filter((char, i) => char === sourceChars[i]).length;
  
  return Math.round((correctChars / inputChars.length) * 100);
};

export const getCharacterStyle = (
  charIndex: number, 
  inputLength: number, 
  isCorrect: boolean
): string => {
  if (charIndex < inputLength) {
    return isCorrect ? CHARACTER_STYLES.CORRECT : CHARACTER_STYLES.INCORRECT;
  } else if (charIndex === inputLength) {
    return CHARACTER_STYLES.CURRENT;
  } else {
    return CHARACTER_STYLES.UNTYPED;
  }
};

export const calculateStats = (
  input: string,
  sourceText: string,
  startTime: number,
  endTime: number
): TypingTestStats => {
  const elapsedTime = endTime - startTime;
  const accuracy = calculateAccuracy(input, sourceText);
  const correctChars = input.split('').filter((char, i) => char === sourceText[i]).length;
  const wpm = calculateWPM(input.length, elapsedTime);

  return {
    wpm,
    accuracy,
    correctChars,
    totalChars: input.length,
    elapsedTime: Math.round(elapsedTime / 1000) // Convert to seconds
  };
};

export const isTestComplete = (input: string, sourceText: string): boolean => {
  return input.trim() === sourceText.trim();
};

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const getPerformanceRating = (wpm: number): TypingPerformanceRating => {
  if (wpm >= PERFORMANCE_THRESHOLDS.MASTER) {
    return {
      text: '🚀 Lightning Fast!',
      color: 'text-yellow-400',
      description: 'Professional typing speed',
      level: 'master'
    };
  }
  if (wpm >= PERFORMANCE_THRESHOLDS.EXPERT) {
    return {
      text: '⚡ Excellent!',
      color: 'text-green-400',
      description: 'Above average typing speed',
      level: 'expert'
    };
  }
  if (wpm >= PERFORMANCE_THRESHOLDS.ADVANCED) {
    return {
      text: '👍 Good Speed!',
      color: 'text-blue-400',
      description: 'Solid typing speed',
      level: 'advanced'
    };
  }
  if (wpm >= PERFORMANCE_THRESHOLDS.INTERMEDIATE) {
    return {
      text: '📈 Getting Better!',
      color: 'text-purple-400',
      description: 'Average typing speed',
      level: 'intermediate'
    };
  }
  return {
    text: '🐌 Keep Practicing!',
    color: 'text-gray-400',
    description: 'Below average typing speed',
    level: 'beginner'
  };
};

export const calculateScore = (stats: TypingTestStats): number => {
  const { wpm, accuracy, elapsedTime } = stats;
  
  // Base score from WPM
  let score = wpm * 10;
  
  // Accuracy multiplier (0.5x to 2x based on accuracy)
  const accuracyMultiplier = Math.max(0.5, accuracy / 50);
  score *= accuracyMultiplier;
  
  // Time bonus (faster completion gets bonus)
  const timeBonus = Math.max(0, (60 - elapsedTime) * 2);
  score += timeBonus;
  
  return Math.round(Math.max(0, score));
};

export const getTypingErrors = (input: string, sourceText: string) => {
  const errors = [];
  const inputChars = input.split('');
  const sourceChars = sourceText.split('');
  
  for (let i = 0; i < inputChars.length; i++) {
    if (i < sourceChars.length && inputChars[i] !== sourceChars[i]) {
      errors.push({
        position: i,
        expected: sourceChars[i],
        typed: inputChars[i],
        timestamp: new Date()
      });
    }
  }
  
  return errors;
};

export const generateTypingPassages = (): string[] => {
  return [
    "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once.",
    "Programming is not about what you know; it's about what you can figure out. The best code is written when you understand the problem deeply.",
    "TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.",
    "React is a JavaScript library for building user interfaces. It lets you compose complex UIs from small and isolated pieces of code called components.",
    "The art of programming is the art of organizing complexity, of mastering multitude and avoiding its bastard chaos as effectively as possible.",
    "In the world of software development, debugging is twice as hard as writing the code in the first place.",
    "Good software, like wine, takes time to mature. The best programs are written not grown.",
    "Code is like humor. When you have to explain it, it's bad. Clean code always looks like it was written by someone who cares."
  ];
};