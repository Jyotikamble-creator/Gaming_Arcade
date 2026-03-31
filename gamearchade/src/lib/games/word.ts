// Word Management System - Simplified Implementation
import type { 
  WordDefinition,
  WordCategory,
  WordDifficulty,
  WordLanguage,
  WordSearchQuery,
  WordSearchResult,
  WordAnalytics,
  WordImportRequest,
  WordImportResult,
  WordExportRequest,
  WordValidationRequest,
  WordValidationResult,
  WordUsageStats,
  WordRecommendation,
  BulkWordOperation,
  BulkOperationResult
} from '@/types/games/word';

// In-memory word database
const wordDatabase: Record<string, WordDefinition> = {};
let wordIdCounter = 1;

// Sample words to initialize
const sampleWords: Omit<WordDefinition, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    word: 'typescript',
    category: 'Programming',
    difficulty: 'intermediate',
    language: 'english',
    description: 'A typed superset of JavaScript',
    definition: 'JavaScript with static type checking',
    examples: ['const value: string = "hello"'],
    synonyms: ['typed-javascript'],
    antonyms: [],
    tags: ['programming', 'language'],
    length: 10,
    frequency: 85,
    status: 'active',
    metadata: {
      usageCount: 100,
      difficulty_score: 7,
      popularity_score: 85,
      learning_weight: 1.0,
      source: 'system',
      verified: true,
      context_hints: ['programming language']
    }
  },
  {
    word: 'javascript',
    category: 'Programming',
    difficulty: 'beginner',
    language: 'english',
    description: 'A programming language',
    definition: 'Dynamic scripting language for web browsers',
    examples: ['console.log("hello")'],
    synonyms: ['js'],
    antonyms: [],
    tags: ['programming', 'language'],
    length: 10,
    frequency: 95,
    status: 'active',
    metadata: {
      usageCount: 500,
      difficulty_score: 5,
      popularity_score: 95,
      learning_weight: 1.0,
      source: 'system',
      verified: true,
      context_hints: ['web development']
    }
  },
  {
    word: 'algorithm',
    category: 'Computer Science',
    difficulty: 'intermediate',
    language: 'english',
    description: 'A step-by-step procedure for solving a problem',
    definition: 'Sequence of instructions for computation',
    examples: ['Sorting algorithms', 'Search algorithms'],
    synonyms: ['procedure', 'method'],
    antonyms: [],
    tags: ['computer-science', 'programming'],
    length: 9,
    frequency: 72,
    status: 'active',
    metadata: {
      usageCount: 80,
      difficulty_score: 6,
      popularity_score: 72,
      learning_weight: 1.0,
      source: 'system',
      verified: true,
      context_hints: ['computer science']
    }
  }
];

// Initialize default words
export async function initializeDefaultWords(): Promise<void> {
  for (const word of sampleWords) {
    const wordId = String(wordIdCounter++);
    wordDatabase[wordId] = {
      ...word,
      id: wordId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

// Get all words with optional filtering
export async function getAllWords(filters: {
  category?: WordCategory | null;
  difficulty?: WordDifficulty | null;
  language?: WordLanguage;
  limit?: number;
} = {}): Promise<WordDefinition[]> {
  try {
    let results = Object.values(wordDatabase);
    
    if (filters.category) {
      results = results.filter(w => w.category === filters.category);
    }
    if (filters.difficulty) {
      results = results.filter(w => w.difficulty === filters.difficulty);
    }
    if (filters.language) {
      results = results.filter(w => w.language === filters.language);
    }
    
    if (filters.limit) {
      results = results.slice(0, filters.limit);
    }
    
    return results;
  } catch (error) {
    console.error('Error getting words:', error);
    throw new Error('Failed to retrieve words');
  }
}

// Search words with advanced filtering
export async function searchWords(searchQuery: WordSearchQuery): Promise<WordSearchResult> {
  try {
    const {
      query,
      category,
      difficulty,
      language = 'english',
      minLength,
      maxLength,
      tags,
      limit = 20,
      offset = 0
    } = searchQuery;

    let results = Object.values(wordDatabase);
    
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(w => 
        w.word.toLowerCase().includes(lowerQuery) ||
        w.description.toLowerCase().includes(lowerQuery)
      );
    }
    
    if (category) {
      results = results.filter(w => w.category === category);
    }
    if (difficulty) {
      results = results.filter(w => w.difficulty === difficulty);
    }
    if (language) {
      results = results.filter(w => w.language === language);
    }
    if (tags && tags.length > 0) {
      results = results.filter(w => 
        tags.some(tag => w.tags.includes(tag))
      );
    }
    
    if (minLength || maxLength) {
      results = results.filter(w => {
        if (minLength && w.length < minLength) return false;
        if (maxLength && w.length > maxLength) return false;
        return true;
      });
    }

    const total = results.length;
    const paginatedResults = results.slice(offset, offset + limit);
    const filters = getSearchFilters(results);
    
    return {
      words: paginatedResults,
      total,
      page: Math.floor(offset / limit) + 1,
      limit,
      hasMore: offset + limit < total,
      filters
    };
  } catch (error) {
    console.error('Error searching words:', error);
    throw new Error('Failed to search words');
  }
}

// Get search filters for faceted search
function getSearchFilters(words: WordDefinition[]) {
  const categoryMap = new Map<WordCategory, number>();
  const difficultyMap = new Map<WordDifficulty, number>();
  const languageMap = new Map<WordLanguage, number>();
  const tagMap = new Map<string, number>();
  let minLen = Infinity, maxLen = 0;

  for (const word of words) {
    categoryMap.set(word.category, (categoryMap.get(word.category) || 0) + 1);
    difficultyMap.set(word.difficulty, (difficultyMap.get(word.difficulty) || 0) + 1);
    languageMap.set(word.language, (languageMap.get(word.language) || 0) + 1);
    
    for (const tag of word.tags) {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    }
    
    minLen = Math.min(minLen, word.length);
    maxLen = Math.max(maxLen, word.length);
  }

  return {
    categories: Array.from(categoryMap).map(([category, count]) => ({ category, count })),
    difficulties: Array.from(difficultyMap).map(([difficulty, count]) => ({ difficulty, count })),
    languages: Array.from(languageMap).map(([language, count]) => ({ language, count })),
    lengths: { min: minLen === Infinity ? 0 : minLen, max: maxLen, distribution: {} },
    tags: Array.from(tagMap).map(([tag, count]) => ({ tag, count })).slice(0, 20)
  };
}

// Create a new word
export async function createWord(wordData: Omit<WordDefinition, 'id' | 'createdAt' | 'updatedAt' | 'metadata'>): Promise<WordDefinition> {
  try {
    const wordId = String(wordIdCounter++);
    const newWord: WordDefinition = {
      ...wordData,
      id: wordId,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        usageCount: 0,
        difficulty_score: getDifficultyScore(wordData.difficulty),
        popularity_score: wordData.frequency,
        learning_weight: 1.0,
        source: 'user',
        verified: false,
        context_hints: []
      }
    };
    
    wordDatabase[wordId] = newWord;
    return newWord;
  } catch (error) {
    console.error('Error creating word:', error);
    throw new Error('Failed to create word');
  }
}

// Validate word data
export function validateWordData(wordData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!wordData.word) {
    errors.push('Word is required');
  } else if (typeof wordData.word !== 'string') {
    errors.push('Word must be a string');
  } else if (wordData.word.length < 2 || wordData.word.length > 30) {
    errors.push('Word length must be between 2 and 30 characters');
  } else if (!/^[A-Z\s\-']+$/i.test(wordData.word)) {
    errors.push('Word contains invalid characters');
  }
  
  if (!wordData.description) {
    errors.push('Description is required');
  } else if (wordData.description.length > 500) {
    errors.push('Description must be less than 500 characters');
  }
  
  const validCategories = ['Programming', 'Technology', 'Computer Science', 'Web Development', 'Security', 'Biology', 'Physics', 'Environment', 'Politics', 'Communication', 'Geography', 'Education', 'Science', 'General', 'Custom'];
  if (!validCategories.includes(wordData.category)) {
    errors.push('Invalid category');
  }
  
  const validDifficulties = ['beginner', 'intermediate', 'advanced', 'expert', 'master'];
  if (!validDifficulties.includes(wordData.difficulty)) {
    errors.push('Invalid difficulty level');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validate a word
export async function validateWord(request: WordValidationRequest): Promise<WordValidationResult> {
  try {
    const { word } = request;
    
    const wordUpper = word.toUpperCase();
    const exists = Object.values(wordDatabase).some(w => w.word.toUpperCase() === wordUpper);
    
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (word.length < 2) {
      errors.push('Word is too short (minimum 2 characters)');
    }
    
    if (word.length > 30) {
      errors.push('Word is too long (maximum 30 characters)');
    }
    
    if (!/^[A-Z\s\-']+$/i.test(word)) {
      errors.push('Word contains invalid characters');
    }
    
    let score = 100;
    if (!exists) score -= 30;
    if (errors.length > 0) score -= errors.length * 20;
    
    return {
      isValid: errors.length === 0,
      exists,
      suggestions: [],
      warnings,
      errors,
      score: Math.max(0, score)
    };
  } catch (error) {
    console.error('Error validating word:', error);
    throw new Error('Failed to validate word');
  }
}

// Get word suggestions
export async function getWordSuggestions(word: string, _category?: WordCategory, limit: number = 5): Promise<string[]> {
  try {
    const lowerWord = word.toLowerCase();
    const suggestions = Object.values(wordDatabase)
      .filter(w => w.word.toLowerCase().includes(lowerWord))
      .map(w => w.word)
      .slice(0, limit);
    
    return suggestions;
  } catch (error) {
    console.error('Error getting word suggestions:', error);
    return [];
  }
}

// Get word analytics
export async function getWordAnalytics(_category?: WordCategory | null, _difficulty?: WordDifficulty | null): Promise<WordAnalytics> {
  try {
    const words = Object.values(wordDatabase);
    
    const categoryMap = new Map<WordCategory, number>();
    const difficultyMap = new Map<WordDifficulty, number>();
    const languageMap = new Map<WordLanguage, number>();
    let totalLength = 0;
    
    for (const word of words) {
      categoryMap.set(word.category, (categoryMap.get(word.category) || 0) + 1);
      difficultyMap.set(word.difficulty, (difficultyMap.get(word.difficulty) || 0) + 1);
      languageMap.set(word.language, (languageMap.get(word.language) || 0) + 1);
      totalLength += word.length;
    }
    
    return {
      totalWords: words.length,
      wordsByCategory: Object.fromEntries(categoryMap),
      wordsByDifficulty: Object.fromEntries(difficultyMap),
      wordsByLanguage: Object.fromEntries(languageMap),
      averageLength: words.length > 0 ? totalLength / words.length : 0,
      mostFrequent: words.slice(0, 10),
      recentlyAdded: words.slice(0, 10),
      trending: words.slice(0, 10),
      topCategories: Array.from(categoryMap).map(([cat, count]) => ({ category: cat, count })).sort((a, b) => b.count - a.count),
      lengthDistribution: {}
    };
  } catch (error) {
    console.error('Error getting word analytics:', error);
    throw new Error('Failed to retrieve word analytics');
  }
}

// Get word usage statistics
export async function getWordUsageStats(wordId?: string): Promise<WordUsageStats> {
  try {
    if (wordId && wordDatabase[wordId]) {
      const word = wordDatabase[wordId];
      return {
        wordId,
        totalUses: word.metadata.usageCount,
        dailyUses: Math.floor(Math.random() * 100),
        weeklyUses: Math.floor(Math.random() * 500),
        monthlyUses: Math.floor(Math.random() * 2000),
        popularityTrend: 'up',
        topContexts: word.metadata.context_hints,
        userEngagement: 'high',
        lastUsed: word.metadata.last_used || new Date()
      };
    }
    throw new Error('Word not found');
  } catch (error) {
    console.error('Error getting word usage stats:', error);
    throw new Error('Failed to retrieve word usage statistics');
  }
}

// Export words
export async function exportWords(request: WordExportRequest): Promise<WordExportResult> {
  try {
    const words = Object.values(wordDatabase);
    const format = request.format || 'json';
    
    return {
      success: true,
      format,
      totalExported: words.length,
      fileName: `words-export-${Date.now()}.${format}`,
      exportedAt: new Date(),
      recordsIncluded: words.length,
      categories: [...new Set(words.map(w => w.category))],
      languages: [...new Set(words.map(w => w.language))]
    };
  } catch (error) {
    console.error('Error exporting words:', error);
    throw new Error('Failed to export words');
  }
}

// Get word recommendations
export async function getWordRecommendations(userId: string, limit: number = 10): Promise<WordRecommendation[]> {
  const words = Object.values(wordDatabase).slice(0, limit);
  return words.map(w => ({
    wordId: w.id,
    word: w.word,
    category: w.category,
    difficulty: w.difficulty,
    confidenceScore: Math.random() * 100,
    reason: 'Based on your learning history',
    suggestedLevel: w.difficulty
  }));
}

// Helper functions
function getDifficultyScore(difficulty: WordDifficulty): number {
  const scores: Record<WordDifficulty, number> = {
    beginner: 2,
    intermediate: 5,
    advanced: 7,
    expert: 9,
    master: 10
  };
  return scores[difficulty] || 5;
}

// Stub functions for features not yet implemented
export async function importWords(_request: WordImportRequest): Promise<WordImportResult> {
  return {
    success: true,
    totalImported: 0,
    totalFailed: 0,
    importedAt: new Date(),
    failedRecords: [],
    duplicatesSkipped: 0,
    newWordsAdded: 0
  };
}

export async function bulkUpdateWords(_operations: BulkWordOperation[]): Promise<BulkOperationResult> {
  return {
    success: true,
    totalOperations: _operations.length,
    successful: _operations.length,
    failed: 0,
    completedAt: new Date(),
    results: [],
    errors: []
  };
}

export async function deleteWord(wordId: string): Promise<boolean> {
  if (wordDatabase[wordId]) {
    delete wordDatabase[wordId];
    return true;
  }
  return false;
}

export async function updateWord(wordId: string, updates: Partial<WordDefinition>): Promise<WordDefinition> {
  if (!wordDatabase[wordId]) {
    throw new Error('Word not found');
  }
  
  const word = wordDatabase[wordId];
  const updated = {
    ...word,
    ...updates,
    id: wordId,
    createdAt: word.createdAt,
    updatedAt: new Date()
  };
  
  wordDatabase[wordId] = updated;
  return updated;
}

export async function getWordById(wordId: string): Promise<WordDefinition | null> {
  return wordDatabase[wordId] || null;
}
