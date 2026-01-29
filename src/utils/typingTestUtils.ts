// Typing Test game constants and utilities
import { CharacterStyle, TypingTestStats } from '../types/typingTest';

// Game configuration constants
export const TYPING_CONFIG = {
  MIN_CHARS_FOR_WPM: 5,
  WORDS_PER_MINUTE_DIVISOR: 5, // Standard: 1 word = 5 characters
  ACCURACY_PRECISION: 0,
  GAME_NAME: 'typing-test'
} as const;

// Character styling constants
export const CHARACTER_STYLES = {
  CORRECT: 'text-green-400',
  INCORRECT: 'bg-red-700 text-white',
  CURRENT: 'text-white border-r-2 border-yellow-400',
  UNTYPED: 'text-white'
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

export const getPerformanceRating = (wpm: number): { text: string; color: string } => {
  if (wpm >= 80) return { text: '🚀 Lightning Fast!', color: 'text-yellow-400' };
  if (wpm >= 60) return { text: '⚡ Excellent!', color: 'text-green-400' };
  if (wpm >= 40) return { text: '👍 Good Speed!', color: 'text-blue-400' };
  if (wpm >= 20) return { text: '📈 Getting Better!', color: 'text-purple-400' };
  return { text: '🐌 Keep Practicing!', color: 'text-gray-400' };
};