// Word management utility functions and helpers

import type {
  IWord,
  WordGameType,
  WordCategory,
  WordDifficulty,
  WordLength,
  WordValidation,
  UserWordHistory,
  WordHint,
  WordPuzzleConfig
} from "@/types/words/words";

/**
 * Word validation utilities
 */
export class WordValidator {
  /**
   * Validate word format and content
   */
  static validateWord(word: string): WordValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic format validation
    if (!word || typeof word !== 'string') {
      errors.push("Word must be a non-empty string");
      return { word, isValid: false, exists: false, suggestions: [] };
    }

    const cleanWord = word.trim().toLowerCase();
    
    if (cleanWord.length === 0) {
      errors.push("Word cannot be empty");
    }

    if (cleanWord.length < 2) {
      errors.push("Word must be at least 2 characters long");
    }

    if (cleanWord.length > 20) {
      warnings.push("Unusually long word detected");
    }

    // Character validation
    if (!/^[a-zA-Z]+$/.test(cleanWord)) {
      errors.push("Word can only contain letters");
    }

    // Common word patterns
    if (/(.)\1{3,}/.test(cleanWord)) {
      warnings.push("Word has unusual repeated characters");
    }

    return {
      word: cleanWord,
      isValid: errors.length === 0,
      exists: true, // Would need dictionary lookup in real implementation
      suggestions: errors.length > 0 ? this.generateSuggestions(cleanWord) : undefined
    };
  }

  /**
   * Generate word suggestions for corrections
   */
  static generateSuggestions(word: string): string[] {
    // Simple suggestion algorithm - would be more sophisticated in real implementation
    const suggestions: string[] = [];
    
    // Remove duplicate characters
    const deduplicated = word.replace(/(.)\1+/g, '$1');
    if (deduplicated !== word && deduplicated.length >= 2) {
      suggestions.push(deduplicated);
    }

    // Common letter substitutions
    const substitutions = [
      ['ph', 'f'], ['ck', 'k'], ['qu', 'kw'], ['x', 'ks']
    ];

    for (const [from, to] of substitutions) {
      const substituted = word.replace(new RegExp(from, 'g'), to);
      if (substituted !== word) {
        suggestions.push(substituted);
      }
    }

    return suggestions.slice(0, 3); // Return top 3 suggestions
  }

  /**
   * Validate word for specific game context
   */
  static validateForGame(word: string, game: WordGameType): boolean {
    const validation = this.validateWord(word);
    if (!validation.isValid) return false;

    const gameRules: Record<WordGameType, (word: string) => boolean> = {
      'word-guess': (w) => w.length >= 4 && w.length <= 8,
      'word-scramble': (w) => w.length >= 3 && w.length <= 10,
      'word-builder': (w) => w.length >= 3 && w.length <= 12,
      'hangman': (w) => w.length >= 4 && w.length <= 15,
      'typing': (w) => w.length >= 2 && w.length <= 20
    };

    const rule = gameRules[game];
    return rule ? rule(word) : true;
  }
}

/**
 * Word filtering and search utilities
 */
export class WordFilter {
  /**
   * Filter words by length category
   */
  static filterByLength(words: IWord[], lengthCategory: WordLength): IWord[] {
    const lengthRanges: Record<WordLength, { min: number; max: number }> = {
      short: { min: 2, max: 5 },
      medium: { min: 6, max: 8 },
      long: { min: 9, max: 15 },
      any: { min: 1, max: 50 }
    };

    const range = lengthRanges[lengthCategory];
    return words.filter(word => 
      word.length >= range.min && word.length <= range.max
    );
  }

  /**
   * Filter words by difficulty
   */
  static filterByDifficulty(words: IWord[], difficulty: WordDifficulty): IWord[] {
    return words.filter(word => word.difficulty === difficulty);
  }

  /**
   * Filter words by category
   */
  static filterByCategory(words: IWord[], categories: WordCategory[]): IWord[] {
    return words.filter(word => categories.includes(word.category));
  }

  /**
   * Filter out recently used words
   */
  static filterOutRecentWords(words: IWord[], recentWords: string[], hoursAgo: number = 24): IWord[] {
    const recentSet = new Set(recentWords.map(w => w.toLowerCase()));
    return words.filter(word => !recentSet.has(word.word.toLowerCase()));
  }

  /**
   * Apply multiple filters
   */
  static applyFilters(words: IWord[], filters: {
    categories?: WordCategory[];
    difficulties?: WordDifficulty[];
    lengthRange?: { min: number; max: number };
    excludeWords?: string[];
    minFrequency?: number;
    tags?: string[];
  }): IWord[] {
    let filteredWords = [...words];

    if (filters.categories) {
      filteredWords = this.filterByCategory(filteredWords, filters.categories);
    }

    if (filters.difficulties) {
      filteredWords = filteredWords.filter(word => 
        filters.difficulties!.includes(word.difficulty)
      );
    }

    if (filters.lengthRange) {
      filteredWords = filteredWords.filter(word => 
        word.length >= filters.lengthRange!.min && 
        word.length <= filters.lengthRange!.max
      );
    }

    if (filters.excludeWords) {
      const excludeSet = new Set(filters.excludeWords.map(w => w.toLowerCase()));
      filteredWords = filteredWords.filter(word => 
        !excludeSet.has(word.word.toLowerCase())
      );
    }

    if (filters.minFrequency) {
      filteredWords = filteredWords.filter(word => 
        (word.frequency || 0) >= filters.minFrequency!
      );
    }

    if (filters.tags) {
      filteredWords = filteredWords.filter(word => 
        word.tags?.some(tag => filters.tags!.includes(tag))
      );
    }

    return filteredWords;
  }
}

/**
 * Word analysis utilities
 */
export class WordAnalyzer {
  /**
   * Analyze word difficulty based on various factors
   */
  static analyzeWordDifficulty(word: string): WordDifficulty {
    let difficultyScore = 0;

    // Length factor
    if (word.length <= 4) difficultyScore += 0;
    else if (word.length <= 6) difficultyScore += 1;
    else if (word.length <= 8) difficultyScore += 2;
    else difficultyScore += 3;

    // Vowel-consonant ratio
    const vowels = word.match(/[aeiou]/gi) || [];
    const consonants = word.match(/[bcdfghjklmnpqrstvwxyz]/gi) || [];
    const vowelRatio = vowels.length / word.length;
    
    if (vowelRatio < 0.2 || vowelRatio > 0.8) {
      difficultyScore += 1; // Unusual vowel ratio makes it harder
    }

    // Repeated letters
    if (/(.)\1/.test(word)) {
      difficultyScore -= 0.5; // Repeated letters make it easier
    }

    // Common letter patterns
    const commonPatterns = ['ing', 'tion', 'er', 'ed', 'ly', 'est'];
    if (commonPatterns.some(pattern => word.includes(pattern))) {
      difficultyScore -= 0.5; // Common patterns make it easier
    }

    // Uncommon letters
    const uncommonLetters = ['j', 'q', 'x', 'z'];
    if (uncommonLetters.some(letter => word.includes(letter))) {
      difficultyScore += 1; // Uncommon letters make it harder
    }

    // Map score to difficulty level
    if (difficultyScore <= 0.5) return 'easy';
    else if (difficultyScore <= 2) return 'medium';
    else if (difficultyScore <= 3.5) return 'hard';
    else return 'expert';
  }

  /**
   * Extract word patterns for analysis
   */
  static extractPatterns(word: string): {
    vowelPattern: string;
    consonantClusters: string[];
    prefixes: string[];
    suffixes: string[];
    syllableCount: number;
  } {
    const vowelPattern = word.replace(/[bcdfghjklmnpqrstvwxyz]/gi, 'C')
                           .replace(/[aeiou]/gi, 'V');

    const consonantClusters = word.match(/[bcdfghjklmnpqrstvwxyz]{2,}/gi) || [];
    
    const commonPrefixes = ['pre', 'un', 'in', 'dis', 'en', 'non', 'over', 'mis', 'sub', 'inter'];
    const prefixes = commonPrefixes.filter(prefix => word.startsWith(prefix));
    
    const commonSuffixes = ['ing', 'ed', 'er', 'est', 'ly', 'tion', 'ness', 'ment', 'ful', 'less'];
    const suffixes = commonSuffixes.filter(suffix => word.endsWith(suffix));

    const syllableCount = this.countSyllables(word);

    return {
      vowelPattern,
      consonantClusters,
      prefixes,
      suffixes,
      syllableCount
    };
  }

  /**
   * Count syllables in a word (approximation)
   */
  static countSyllables(word: string): number {
    word = word.toLowerCase();
    
    // Remove silent e
    word = word.replace(/e$/g, '');
    
    // Count vowel groups
    const vowelGroups = word.match(/[aeiouy]+/g) || [];
    let count = vowelGroups.length;
    
    // Every word has at least one syllable
    return Math.max(count, 1);
  }

  /**
   * Calculate word similarity score
   */
  static calculateSimilarity(word1: string, word2: string): number {
    if (word1 === word2) return 1;
    
    const longer = word1.length > word2.length ? word1 : word2;
    const shorter = word1.length > word2.length ? word2 : word1;
    
    if (longer.length === 0) return 1;
    
    const distance = this.levenshteinDistance(word1, word2);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two words
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

/**
 * Word formatting utilities
 */
export class WordFormatter {
  /**
   * Format word for display
   */
  static formatWord(word: string, style: 'normal' | 'uppercase' | 'lowercase' | 'title' = 'normal'): string {
    switch (style) {
      case 'uppercase':
        return word.toUpperCase();
      case 'lowercase':
        return word.toLowerCase();
      case 'title':
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      default:
        return word;
    }
  }

  /**
   * Create masked word for guessing games
   */
  static createMask(word: string, revealedLetters: string[] = []): string {
    const revealedSet = new Set(revealedLetters.map(l => l.toLowerCase()));
    return word
      .split('')
      .map(letter => revealedSet.has(letter.toLowerCase()) ? letter : '_')
      .join('');
  }

  /**
   * Format word with highlighting
   */
  static highlightLetters(word: string, highlightLetters: string[], className: string = 'highlight'): string {
    const highlightSet = new Set(highlightLetters.map(l => l.toLowerCase()));
    return word
      .split('')
      .map(letter => 
        highlightSet.has(letter.toLowerCase()) 
          ? `<span class="${className}">${letter}</span>`
          : letter
      )
      .join('');
  }

  /**
   * Create word scramble
   */
  static scrambleWord(word: string, preserveFirst: boolean = false): string {
    const letters = word.split('');
    
    if (preserveFirst && letters.length > 1) {
      const firstLetter = letters[0];
      const remainingLetters = letters.slice(1);
      return firstLetter + this.shuffleArray(remainingLetters).join('');
    }
    
    return this.shuffleArray(letters).join('');
  }

  /**
   * Shuffle array helper
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Add word hints formatting
   */
  static formatHints(hints: WordHint[]): string[] {
    return hints
      .sort((a, b) => a.order - b.order)
      .map(hint => {
        switch (hint.type) {
          case 'definition':
            return `Definition: ${hint.content}`;
          case 'synonym':
            return `Similar word: ${hint.content}`;
          case 'category':
            return `Category: ${hint.content}`;
          case 'length':
            return `Length: ${hint.content} letters`;
          case 'letter':
            return `Contains the letter: ${hint.content}`;
          case 'rhyme':
            return `Rhymes with: ${hint.content}`;
          default:
            return hint.content;
        }
      });
  }
}

/**
 * Word game utilities
 */
export class WordGameUtils {
  /**
   * Generate word puzzle configuration
   */
  static generatePuzzleConfig(word: IWord, gameType: WordGameType): WordPuzzleConfig {
    const hints: WordHint[] = [];
    
    // Generate hints based on word properties
    if (word.definition) {
      hints.push({
        id: '1',
        wordId: word.id,
        type: 'definition',
        content: word.definition,
        difficulty: 'easy',
        order: 1
      });
    }

    hints.push({
      id: '2',
      wordId: word.id,
      type: 'category',
      content: word.category,
      difficulty: 'easy',
      order: 2
    });

    hints.push({
      id: '3',
      wordId: word.id,
      type: 'length',
      content: word.length.toString(),
      difficulty: 'easy',
      order: 3
    });

    // Add letter hint for harder difficulties
    if (word.difficulty === 'hard' || word.difficulty === 'expert') {
      const firstLetter = word.word.charAt(0).toUpperCase();
      hints.push({
        id: '4',
        wordId: word.id,
        type: 'letter',
        content: `First letter is ${firstLetter}`,
        difficulty: 'medium',
        order: 4
      });
    }

    return {
      targetWord: word.word,
      hints,
      timeLimit: this.getTimeLimit(gameType, word.difficulty),
      maxAttempts: this.getMaxAttempts(gameType, word.difficulty),
      showProgress: true,
      allowSkip: true,
      difficulty: word.difficulty,
      category: word.category
    };
  }

  /**
   * Get time limit for game and difficulty
   */
  private static getTimeLimit(game: WordGameType, difficulty: WordDifficulty): number {
    const baseTimes: Record<WordGameType, number> = {
      'word-guess': 120, // 2 minutes
      'word-scramble': 60, // 1 minute
      'word-builder': 180, // 3 minutes
      'hangman': 300, // 5 minutes
      'typing': 30 // 30 seconds
    };

    const difficultyMultipliers: Record<WordDifficulty, number> = {
      easy: 1.5,
      medium: 1.2,
      hard: 1.0,
      expert: 0.8
    };

    return Math.round(baseTimes[game] * difficultyMultipliers[difficulty]);
  }

  /**
   * Get max attempts for game and difficulty
   */
  private static getMaxAttempts(game: WordGameType, difficulty: WordDifficulty): number {
    const baseAttempts: Record<WordGameType, number> = {
      'word-guess': 6,
      'word-scramble': 3,
      'word-builder': 5,
      'hangman': 7,
      'typing': 1
    };

    const difficultyAdjustments: Record<WordDifficulty, number> = {
      easy: 2,
      medium: 1,
      hard: 0,
      expert: -1
    };

    return Math.max(1, baseAttempts[game] + difficultyAdjustments[difficulty]);
  }

  /**
   * Calculate word score based on various factors
   */
  static calculateWordScore(params: {
    word: string;
    difficulty: WordDifficulty;
    timeUsed: number;
    timeLimit: number;
    attempts: number;
    maxAttempts: number;
    hintsUsed: number;
  }): number {
    const { word, difficulty, timeUsed, timeLimit, attempts, maxAttempts, hintsUsed } = params;

    // Base score from word length and difficulty
    let baseScore = word.length * 10;
    
    const difficultyMultipliers: Record<WordDifficulty, number> = {
      easy: 1,
      medium: 1.5,
      hard: 2,
      expert: 3
    };
    
    baseScore *= difficultyMultipliers[difficulty];

    // Time bonus (faster = higher score)
    const timeBonus = Math.max(0, (timeLimit - timeUsed) / timeLimit) * 100;
    
    // Attempt bonus (fewer attempts = higher score)
    const attemptBonus = Math.max(0, (maxAttempts - attempts) / maxAttempts) * 50;
    
    // Hint penalty
    const hintPenalty = hintsUsed * 20;

    const finalScore = Math.round(baseScore + timeBonus + attemptBonus - hintPenalty);
    return Math.max(finalScore, 10); // Minimum score of 10
  }

  /**
   * Get progress statistics for user
   */
  static calculateProgress(history: UserWordHistory): {
    improvementRate: number;
    accuracyTrend: 'improving' | 'declining' | 'stable';
    strongCategories: WordCategory[];
    weakCategories: WordCategory[];
    recommendations: string[];
  } {
    const recentWords = history.wordsUsed.slice(-20); // Last 20 words
    const olderWords = history.wordsUsed.slice(-40, -20); // Previous 20 words

    // Calculate improvement rate
    const recentAccuracy = recentWords.filter(w => w.correct).length / recentWords.length;
    const olderAccuracy = olderWords.length > 0 
      ? olderWords.filter(w => w.correct).length / olderWords.length 
      : recentAccuracy;
    
    const improvementRate = ((recentAccuracy - olderAccuracy) / olderAccuracy) * 100;

    // Determine accuracy trend
    let accuracyTrend: 'improving' | 'declining' | 'stable';
    if (improvementRate > 5) accuracyTrend = 'improving';
    else if (improvementRate < -5) accuracyTrend = 'declining';
    else accuracyTrend = 'stable';

    // Analyze category performance (simplified - would need more data in real implementation)
    const strongCategories: WordCategory[] = history.preferences.favoriteCategories;
    const weakCategories: WordCategory[] = ['science', 'technology']; // Placeholder

    // Generate recommendations
    const recommendations: string[] = [];
    if (accuracyTrend === 'declining') {
      recommendations.push("Consider taking a break or trying easier words");
    }
    if (recentAccuracy < 0.7) {
      recommendations.push("Focus on your strong categories to build confidence");
    }
    if (weakCategories.length > 0) {
      recommendations.push(`Practice more words in: ${weakCategories.join(', ')}`);
    }

    return {
      improvementRate,
      accuracyTrend,
      strongCategories,
      weakCategories,
      recommendations
    };
  }
}

/**
 * Export all utilities as a combined object
 */
export const WordUtils = {
  Validator: WordValidator,
  Filter: WordFilter,
  Analyzer: WordAnalyzer,
  Formatter: WordFormatter,
  GameUtils: WordGameUtils
};