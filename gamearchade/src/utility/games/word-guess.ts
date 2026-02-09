// WordGuess utility functions for game logic
import { 
  WordGuessData, 
  WordGuessPerformanceRating,
  WORD_GUESS_CONSTANTS 
} from '@/types/games/word-guess';

// Re-export constants for use in components
export { WORD_GUESS_CONSTANTS };

/**
 * Check if a letter is revealed in the word
 */
export function isLetterRevealed(letter: string, chosenLetters: string[]): boolean {
  return chosenLetters.includes(letter);
}

/**
 * Get the display version of the word with revealed letters
 */
export function getDisplayWord(word: string, chosenLetters: string[]): string {
  return word
    .split('')
    .map(letter => isLetterRevealed(letter, chosenLetters) ? letter : '_')
    .join(' ');
}

/**
 * Check if the word is completely guessed
 */
export function isWordComplete(word: string, chosenLetters: string[]): boolean {
  return word.split('').every(letter => chosenLetters.includes(letter));
}

/**
 * Get unrevealed letters in the word
 */
export function getUnrevealedLetters(word: string, chosenLetters: string[]): string[] {
  return word
    .split('')
    .filter(letter => !chosenLetters.includes(letter))
    .filter((letter, index, array) => array.indexOf(letter) === index); // Remove duplicates
}

/**
 * Get a random hint letter from unrevealed letters
 */
export function getRandomHintLetter(word: string, chosenLetters: string[]): string | null {
  const unrevealed = getUnrevealedLetters(word, chosenLetters);
  if (unrevealed.length === 0) return null;
  
  return unrevealed[Math.floor(Math.random() * unrevealed.length)];
}

/**
 * Check if a letter is valid (A-Z)
 */
export function isValidLetter(letter: string): boolean {
  return /^[A-Z]$/.test(letter);
}

/**
 * Calculate score for a letter guess
 */
export function calculateLetterScore(
  letter: string, 
  word: string, 
  isCorrect: boolean
): number {
  if (isCorrect) {
    return WORD_GUESS_CONSTANTS.SCORE_PER_CORRECT_LETTER;
  } else {
    return WORD_GUESS_CONSTANTS.SCORE_PER_WRONG_LETTER;
  }
}

/**
 * Calculate final score with bonuses
 */
export function calculateFinalScore(
  baseScore: number,
  isWon: boolean,
  hintsUsed: number
): number {
  let finalScore = baseScore;
  
  if (isWon) {
    finalScore += WORD_GUESS_CONSTANTS.WIN_BONUS;
  }
  
  // Hint penalty is already applied during gameplay
  return Math.max(0, finalScore);
}

/**
 * Get performance rating based on game results
 */
export function getPerformanceRating(
  isWon: boolean,
  score: number,
  wrongGuesses: number,
  hintsUsed: number
): WordGuessPerformanceRating {
  if (isWon) {
    if (wrongGuesses === 0 && hintsUsed === 0) {
      return {
        text: '🏆 Perfect!',
        color: 'text-yellow-400',
        description: 'Flawless victory with no mistakes!'
      };
    } else if (wrongGuesses <= 1 && hintsUsed <= 1) {
      return {
        text: '⭐ Excellent!',
        color: 'text-blue-400',
        description: 'Great guessing skills!'
      };
    } else if (wrongGuesses <= 2) {
      return {
        text: '👍 Good Job!',
        color: 'text-green-400',
        description: 'Well done, keep it up!'
      };
    } else {
      return {
        text: '🎯 Close Call!',
        color: 'text-orange-400',
        description: 'Made it by the skin of your teeth!'
      };
    }
  } else {
    return {
      text: '💪 Try Again!',
      color: 'text-red-400',
      description: 'Better luck next time!'
    };
  }
}

/**
 * Get available letters (not yet chosen)
 */
export function getAvailableLetters(chosenLetters: string[]): string[] {
  return WORD_GUESS_CONSTANTS.ALPHABET.filter(letter => !chosenLetters.includes(letter));
}

/**
 * Format word for display with spacing
 */
export function formatWordDisplay(word: string, chosenLetters: string[], showWord: boolean = false): string {
  if (showWord) {
    return word.split('').join(' ');
  }
  
  return getDisplayWord(word, chosenLetters);
}

/**
 * Get word completion percentage
 */
export function getWordCompletionPercentage(word: string, chosenLetters: string[]): number {
  const uniqueLetters = [...new Set(word.split(''))];
  const revealedUniqueLetters = uniqueLetters.filter(letter => chosenLetters.includes(letter));
  
  return Math.round((revealedUniqueLetters.length / uniqueLetters.length) * 100);
}

/**
 * Get game status message
 */
export function getGameStatusMessage(
  isWon: boolean,
  isGameOver: boolean,
  wrongGuesses: number,
  maxWrongGuesses: number
): string {
  if (isWon) {
    return 'Congratulations! You guessed the word!';
  } else if (isGameOver) {
    return `Game Over! You used all ${maxWrongGuesses} wrong guesses.`;
  } else if (wrongGuesses > 0) {
    const remaining = maxWrongGuesses - wrongGuesses;
    return `${remaining} wrong guess${remaining !== 1 ? 'es' : ''} remaining.`;
  }
  
  return 'Guess the letters to reveal the word!';
}

/**
 * Validate word data
 */
export function isValidWordData(wordData: any): wordData is WordGuessData {
  return (
    wordData &&
    typeof wordData.word === 'string' &&
    wordData.word.length > 0 &&
    typeof wordData.description === 'string' &&
    wordData.description.length > 0
  );
}

/**
 * Sanitize word data
 */
export function sanitizeWordData(wordData: any): WordGuessData {
  return {
    id: wordData.id || undefined,
    word: String(wordData.word || 'APPLE').toUpperCase().trim(),
    description: String(wordData.description || 'A fruit').trim(),
    category: wordData.category ? String(wordData.category).trim() : undefined
  };
}

/**
 * Get fallback word data
 */
export function getFallbackWordData(): WordGuessData {
  return {
    word: 'APPLE',
    description: 'A fruit',
    category: 'General'
  };
}

/**
 * Check if game should end
 */
export function shouldEndGame(
  wrongGuesses: number,
  maxWrongGuesses: number,
  word: string,
  chosenLetters: string[]
): { isGameOver: boolean; isWon: boolean } {
  const isWon = isWordComplete(word, chosenLetters);
  const isGameOver = wrongGuesses >= maxWrongGuesses;
  
  return {
    isGameOver: isGameOver || isWon,
    isWon: isWon && !isGameOver
  };
}