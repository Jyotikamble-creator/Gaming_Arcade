// Word Management System Utility Functions
import type { 
  WordDefinition, 
  WordCategory, 
  WordDifficulty, 
  WordLanguage,
  WordAnalytics,
  WordUsageStats,
  WordRecommendation
} from '@/types/games/word';

// Word formatting utilities
export function formatWordDisplay(word: string): string {
  return word.toUpperCase().trim();
}

export function formatCategoryDisplay(category: WordCategory): string {
  return category.replace(/([A-Z])/g, ' $1').trim();
}

export function formatDifficultyDisplay(difficulty: WordDifficulty): string {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

export function formatLanguageDisplay(language: WordLanguage): string {
  const languageNames: Record<WordLanguage, string> = {
    english: 'English',
    spanish: 'Español',
    french: 'Français',
    german: 'Deutsch',
    italian: 'Italiano',
    portuguese: 'Português'
  };
  return languageNames[language];
}

// Word validation utilities
export function isValidWord(word: string): boolean {
  if (!word || typeof word !== 'string') return false;
  const trimmed = word.trim();
  return trimmed.length >= 2 && 
         trimmed.length <= 30 && 
         /^[A-Z\s\-']+$/i.test(trimmed);
}

export function isValidCategory(category: string): category is WordCategory {
  const validCategories: WordCategory[] = [
    'Programming', 'Technology', 'Computer Science', 'Web Development', 'Security',
    'Biology', 'Physics', 'Environment', 'Politics', 'Communication', 
    'Geography', 'Education', 'Science', 'General', 'Custom'
  ];
  return validCategories.includes(category as WordCategory);
}

export function isValidDifficulty(difficulty: string): difficulty is WordDifficulty {
  const validDifficulties: WordDifficulty[] = ['beginner', 'intermediate', 'advanced', 'expert', 'master'];
  return validDifficulties.includes(difficulty as WordDifficulty);
}

export function isValidLanguage(language: string): language is WordLanguage {
  const validLanguages: WordLanguage[] = ['english', 'spanish', 'french', 'german', 'italian', 'portuguese'];
  return validLanguages.includes(language as WordLanguage);
}

// Word analysis utilities
export function calculateWordComplexity(word: WordDefinition): number {
  let complexity = 0;
  
  // Base complexity on length
  complexity += Math.min(word.length * 2, 20);
  
  // Add difficulty multiplier
  const difficultyMultipliers = {
    beginner: 1,
    intermediate: 1.5,
    advanced: 2,
    expert: 2.5,
    master: 3
  };
  complexity *= difficultyMultipliers[word.difficulty];
  
  // Add category complexity
  const categoryComplexity = {
    'Communication': 1,
    'General': 1,
    'Geography': 1.2,
    'Education': 1.3,
    'Biology': 1.5,
    'Physics': 1.7,
    'Technology': 1.8,
    'Programming': 2,
    'Computer Science': 2.2,
    'Web Development': 2,
    'Security': 2.5,
    'Environment': 1.4,
    'Politics': 1.6,
    'Science': 1.8,
    'Custom': 1.5
  };
  complexity *= categoryComplexity[word.category] || 1;
  
  return Math.round(complexity);
}

export function calculateWordScore(word: WordDefinition): number {
  const baseScore = word.length * 10;
  const difficultyBonus = {
    beginner: 0,
    intermediate: 20,
    advanced: 50,
    expert: 100,
    master: 200
  };
  const frequencyBonus = Math.max(0, 100 - word.frequency);
  
  return baseScore + difficultyBonus[word.difficulty] + frequencyBonus;
}

export function getWordRarity(frequency: number): 'common' | 'uncommon' | 'rare' | 'very_rare' {
  if (frequency >= 80) return 'common';
  if (frequency >= 60) return 'uncommon';
  if (frequency >= 30) return 'rare';
  return 'very_rare';
}

// Word filtering utilities
export function filterWordsByLength(words: WordDefinition[], minLength: number, maxLength?: number): WordDefinition[] {
  return words.filter(word => {
    const length = word.length;
    if (length < minLength) return false;
    if (maxLength && length > maxLength) return false;
    return true;
  });
}

export function filterWordsByTags(words: WordDefinition[], tags: string[], operator: 'any' | 'all' = 'any'): WordDefinition[] {
  return words.filter(word => {
    if (operator === 'all') {
      return tags.every(tag => word.tags.includes(tag.toLowerCase()));
    } else {
      return tags.some(tag => word.tags.includes(tag.toLowerCase()));
    }
  });
}

export function filterWordsByFrequency(words: WordDefinition[], minFreq: number, maxFreq: number): WordDefinition[] {
  return words.filter(word => word.frequency >= minFreq && word.frequency <= maxFreq);
}

// Word search utilities
export function createSearchRegex(query: string): RegExp {
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escapedQuery, 'i');
}

export function searchWordsByText(words: WordDefinition[], query: string): WordDefinition[] {
  const regex = createSearchRegex(query);
  return words.filter(word => 
    regex.test(word.word) || 
    regex.test(word.description) ||
    word.tags.some(tag => regex.test(tag)) ||
    word.synonyms.some(synonym => regex.test(synonym))
  );
}

export function rankSearchResults(words: WordDefinition[], query: string): WordDefinition[] {
  const lowerQuery = query.toLowerCase();
  
  return words.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    
    // Exact word match gets highest score
    if (a.word.toLowerCase() === lowerQuery) scoreA += 100;
    if (b.word.toLowerCase() === lowerQuery) scoreB += 100;
    
    // Word starts with query
    if (a.word.toLowerCase().startsWith(lowerQuery)) scoreA += 50;
    if (b.word.toLowerCase().startsWith(lowerQuery)) scoreB += 50;
    
    // Word contains query
    if (a.word.toLowerCase().includes(lowerQuery)) scoreA += 25;
    if (b.word.toLowerCase().includes(lowerQuery)) scoreB += 25;
    
    // Description contains query
    if (a.description.toLowerCase().includes(lowerQuery)) scoreA += 10;
    if (b.description.toLowerCase().includes(lowerQuery)) scoreB += 10;
    
    // Tag matches
    if (a.tags.some(tag => tag.includes(lowerQuery))) scoreA += 15;
    if (b.tags.some(tag => tag.includes(lowerQuery))) scoreB += 15;
    
    // Frequency bonus
    scoreA += a.frequency * 0.1;
    scoreB += b.frequency * 0.1;
    
    return scoreB - scoreA;
  });
}

// Word suggestion utilities
export function generateWordSuggestions(partialWord: string, words: WordDefinition[], limit: number = 5): string[] {
  const lowerPartial = partialWord.toLowerCase();
  const suggestions = new Set<string>();
  
  // Find words that start with the partial word
  words.forEach(word => {
    if (word.word.toLowerCase().startsWith(lowerPartial)) {
      suggestions.add(word.word);
    }
  });
  
  // If we don't have enough suggestions, find words that contain the partial word
  if (suggestions.size < limit) {
    words.forEach(word => {
      if (word.word.toLowerCase().includes(lowerPartial) && suggestions.size < limit) {
        suggestions.add(word.word);
      }
    });
  }
  
  return Array.from(suggestions).slice(0, limit);
}

export function findSimilarWords(word: WordDefinition, allWords: WordDefinition[], limit: number = 5): WordDefinition[] {
  return allWords
    .filter(w => w.word !== word.word)
    .map(w => ({
      word: w,
      similarity: calculateSimilarity(word, w)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(item => item.word);
}

function calculateSimilarity(word1: WordDefinition, word2: WordDefinition): number {
  let similarity = 0;
  
  // Same category
  if (word1.category === word2.category) similarity += 40;
  
  // Same difficulty
  if (word1.difficulty === word2.difficulty) similarity += 30;
  
  // Similar length
  const lengthDiff = Math.abs(word1.length - word2.length);
  if (lengthDiff === 0) similarity += 20;
  else if (lengthDiff <= 2) similarity += 10;
  
  // Common tags
  const commonTags = word1.tags.filter(tag => word2.tags.includes(tag));
  similarity += commonTags.length * 5;
  
  // Similar frequency
  const freqDiff = Math.abs(word1.frequency - word2.frequency);
  if (freqDiff <= 10) similarity += 10;
  else if (freqDiff <= 20) similarity += 5;
  
  return similarity;
}

// Color coding utilities for UI
export function getDifficultyColor(difficulty: WordDifficulty): string {
  const colors = {
    beginner: '#4CAF50',     // Green
    intermediate: '#FF9800', // Orange
    advanced: '#F44336',     // Red
    expert: '#9C27B0',       // Purple
    master: '#000000'        // Black
  };
  return colors[difficulty];
}

export function getCategoryColor(category: WordCategory): string {
  const colors: Record<WordCategory, string> = {
    'Programming': '#2196F3',
    'Technology': '#00BCD4',
    'Computer Science': '#3F51B5',
    'Web Development': '#009688',
    'Security': '#F44336',
    'Biology': '#4CAF50',
    'Physics': '#673AB7',
    'Environment': '#8BC34A',
    'Politics': '#FF5722',
    'Communication': '#795548',
    'Geography': '#607D8B',
    'Education': '#FFC107',
    'Science': '#E91E63',
    'General': '#9E9E9E',
    'Custom': '#FF9800'
  };
  return colors[category];
}

export function getFrequencyColor(frequency: number): string {
  if (frequency >= 80) return '#4CAF50';  // High frequency - green
  if (frequency >= 60) return '#FF9800';  // Medium frequency - orange
  if (frequency >= 40) return '#FF5722';  // Low frequency - red-orange
  return '#F44336';                       // Very low frequency - red
}

// Analytics utilities
export function calculateAnalyticsPercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function formatAnalyticsNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function getTopCategories(analytics: WordAnalytics): Array<{ category: WordCategory; count: number; percentage: number }> {
  const categoryEntries = Object.entries(analytics.wordsByCategory) as [WordCategory, number][];
  
  return categoryEntries
    .map(([category, count]) => ({
      category,
      count,
      percentage: calculateAnalyticsPercentage(count, analytics.totalWords)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export function getTrendingWords(analytics: WordAnalytics): WordDefinition[] {
  return analytics.trending || [];
}

// Word import/export utilities
export function validateImportData(data: any, format: 'json' | 'csv' | 'txt'): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data) {
    errors.push('No data provided');
    return { isValid: false, errors };
  }
  
  switch (format) {
    case 'json':
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        if (!Array.isArray(parsed) && typeof parsed !== 'object') {
          errors.push('JSON data must be an array or object');
        }
      } catch (e) {
        errors.push('Invalid JSON format');
      }
      break;
      
    case 'csv':
      if (typeof data !== 'string') {
        errors.push('CSV data must be a string');
      } else if (!data.includes(',')) {
        errors.push('CSV data appears to be invalid (no commas found)');
      }
      break;
      
    case 'txt':
      if (typeof data !== 'string') {
        errors.push('Text data must be a string');
      }
      break;
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function parseWordFromText(line: string): Partial<WordDefinition> | null {
  const parts = line.trim().split('\t');
  if (parts.length < 2) return null;
  
  return {
    word: parts[0]?.toUpperCase(),
    category: (parts[1] as WordCategory) || 'General',
    difficulty: (parts[2] as WordDifficulty) || 'beginner',
    description: parts[3] || '',
    language: 'english',
    examples: [],
    synonyms: [],
    antonyms: [],
    tags: [],
    frequency: 50,
    status: 'active'
  };
}

// Performance monitoring utilities
export function measureWordOperationTime<T>(operation: () => T, operationName: string): { result: T; timeMs: number } {
  const startTime = performance.now();
  const result = operation();
  const endTime = performance.now();
  const timeMs = endTime - startTime;
  
  console.log(`Word operation "${operationName}" took ${timeMs.toFixed(2)}ms`);
  
  return { result, timeMs };
}

export function debounceWordSearch(searchFunction: Function, delay: number = 300) {
  let timeoutId: NodeJS.Timeout;
  
  return function(this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      searchFunction.apply(this, args);
    }, delay);
  };
}

// Cache utilities for word data
const wordCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function cacheWordData(key: string, data: any): void {
  wordCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

export function getCachedWordData(key: string): any | null {
  const cached = wordCache.get(key);
  if (!cached) return null;
  
  const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
  if (isExpired) {
    wordCache.delete(key);
    return null;
  }
  
  return cached.data;
}

export function clearWordCache(): void {
  wordCache.clear();
}

// Word management helpers
export function generateWordId(): string {
  return `word_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function sanitizeWordInput(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/[^A-Z\s\-']/g, '')
    .replace(/\s+/g, ' ');
}

export function extractTagsFromText(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/);
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
  
  return words
    .filter(word => word.length > 3 && !commonWords.has(word))
    .slice(0, 10); // Limit to 10 auto-generated tags
}

// Accessibility utilities
export function getWordReadabilityScore(word: WordDefinition): number {
  let score = 100;
  
  // Penalize very long words
  if (word.length > 15) score -= (word.length - 15) * 5;
  
  // Penalize complex words
  if (word.difficulty === 'expert' || word.difficulty === 'master') score -= 20;
  
  // Penalize words without examples
  if (word.examples.length === 0) score -= 10;
  
  // Penalize words without clear descriptions
  if (word.description.length < 20) score -= 15;
  
  return Math.max(0, score);
}

export function generateWordPronunciationGuide(word: string): string {
  // Simple pronunciation guide generation
  // In a real app, this would use a proper phonetic library
  const syllables = word.toLowerCase().match(/[aeiou]+[bcdfghjklmnpqrstvwxyz]*/g) || [];
  return syllables.join('-');
}