// Word Management System Core Logic
import WordModel from '@/models/games/word';
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
  BulkOperationResult,
  defaultWordDatabase
} from '@/types/games/word';
import { defaultWordDatabase as defaultWords } from '@/types/games/word';

// Initialize default words in database
export async function initializeDefaultWords(): Promise<void> {
  try {
    const existingCount = await WordModel.countDocuments();
    
    if (existingCount === 0) {
      console.log('Initializing default word database...');
      
      const wordsWithMetadata = defaultWords.map(word => ({
        ...word,
        metadata: {
          usageCount: 0,
          difficulty_score: getDifficultyScore(word.difficulty),
          popularity_score: word.frequency,
          learning_weight: 1.0,
          source: 'system',
          verified: true,
          context_hints: []
        }
      }));
      
      await WordModel.insertMany(wordsWithMetadata);
      console.log(`Inserted ${wordsWithMetadata.length} default words`);
    }
  } catch (error) {
    console.error('Error initializing default words:', error);
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
    const query: any = { status: 'active' };
    
    if (filters.category) query.category = filters.category;
    if (filters.difficulty) query.difficulty = filters.difficulty;
    if (filters.language) query.language = filters.language;
    
    let queryBuilder = WordModel.find(query).sort({ word: 1 });
    
    if (filters.limit) {
      queryBuilder = queryBuilder.limit(filters.limit);
    }
    
    return await queryBuilder.exec();
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
      status = 'active',
      sortBy = 'word',
      sortOrder = 'asc',
      limit = 20,
      offset = 0
    } = searchQuery;

    // Build MongoDB query
    const mongoQuery: any = { status, language };
    
    if (query) {
      mongoQuery.$text = { $search: query };
    }
    
    if (category) mongoQuery.category = category;
    if (difficulty) mongoQuery.difficulty = difficulty;
    if (tags && tags.length > 0) mongoQuery.tags = { $in: tags };
    
    if (minLength || maxLength) {
      mongoQuery.length = {};
      if (minLength) mongoQuery.length.$gte = minLength;
      if (maxLength) mongoQuery.length.$lte = maxLength;
    }

    // Get total count
    const total = await WordModel.countDocuments(mongoQuery);
    
    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Get words with pagination
    const words = await WordModel.find(mongoQuery)
      .sort(sortObj)
      .skip(offset)
      .limit(limit)
      .exec();

    // Get search filters/facets
    const filters = await getSearchFilters(mongoQuery);
    
    return {
      words,
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
async function getSearchFilters(baseQuery: any) {
  try {
    const [categories, difficulties, languages, lengthStats, tags] = await Promise.all([
      // Categories
      WordModel.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Difficulties
      WordModel.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Languages
      WordModel.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$language', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Length statistics
      WordModel.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: null,
            minLength: { $min: '$length' },
            maxLength: { $max: '$length' },
            avgLength: { $avg: '$length' }
          }
        }
      ]),
      
      // Top tags
      WordModel.aggregate([
        { $match: baseQuery },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ])
    ]);

    return {
      categories: categories.map(c => ({ category: c._id, count: c.count })),
      difficulties: difficulties.map(d => ({ difficulty: d._id, count: d.count })),
      languages: languages.map(l => ({ language: l._id, count: l.count })),
      lengths: lengthStats[0] || { min: 0, max: 0, distribution: {} },
      tags: tags.map(t => ({ tag: t._id, count: t.count }))
    };
  } catch (error) {
    console.error('Error getting search filters:', error);
    return {
      categories: [],
      difficulties: [],
      languages: [],
      lengths: { min: 0, max: 0, distribution: {} },
      tags: []
    };
  }
}

// Create a new word
export async function createWord(wordData: Omit<WordDefinition, 'id' | 'createdAt' | 'updatedAt' | 'metadata'>): Promise<WordDefinition> {
  try {
    const word = new WordModel({
      ...wordData,
      metadata: {
        usageCount: 0,
        difficulty_score: getDifficultyScore(wordData.difficulty),
        popularity_score: wordData.frequency,
        learning_weight: 1.0,
        source: 'user',
        verified: false,
        context_hints: []
      }
    });
    
    return await word.save();
  } catch (error: any) {
    console.error('Error creating word:', error);
    if (error.code === 11000) {
      throw new Error('Word already exists');
    }
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
  
  if (wordData.examples && wordData.examples.length > 5) {
    errors.push('Maximum 5 examples allowed');
  }
  
  if (wordData.synonyms && wordData.synonyms.length > 10) {
    errors.push('Maximum 10 synonyms allowed');
  }
  
  if (wordData.tags && wordData.tags.length > 15) {
    errors.push('Maximum 15 tags allowed');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Get word analytics
export async function getWordAnalytics(category?: WordCategory | null, difficulty?: WordDifficulty | null): Promise<WordAnalytics> {
  try {
    const baseQuery: any = { status: 'active' };
    if (category) baseQuery.category = category;
    if (difficulty) baseQuery.difficulty = difficulty;

    const [
      totalWords,
      categoryStats,
      difficultyStats,
      languageStats,
      lengthStats,
      mostFrequent,
      recentlyAdded
    ] = await Promise.all([
      WordModel.countDocuments(baseQuery),
      
      WordModel.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      
      WordModel.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } }
      ]),
      
      WordModel.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$language', count: { $sum: 1 } } }
      ]),
      
      WordModel.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$length',
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      WordModel.find(baseQuery)
        .sort({ 'metadata.usageCount': -1, frequency: -1 })
        .limit(10),
        
      WordModel.find(baseQuery)
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    // Calculate average length
    const totalLength = await WordModel.aggregate([
      { $match: baseQuery },
      { $group: { _id: null, avgLength: { $avg: '$length' } } }
    ]);

    return {
      totalWords,
      wordsByCategory: categoryStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      wordsByDifficulty: difficultyStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      wordsByLanguage: languageStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      averageLength: totalLength[0]?.avgLength || 0,
      mostFrequent,
      recentlyAdded,
      trending: mostFrequent, // Simple implementation
      topCategories: categoryStats
        .map(c => ({ category: c._id, count: c.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      lengthDistribution: lengthStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };
  } catch (error) {
    console.error('Error getting word analytics:', error);
    throw new Error('Failed to retrieve word analytics');
  }
}

// Validate a word against the database
export async function validateWord(request: WordValidationRequest): Promise<WordValidationResult> {
  try {
    const { word, category, difficulty, language = 'english' } = request;
    
    // Check if word exists
    const existingWord = await WordModel.findOne({
      word: word.toUpperCase(),
      language,
      status: 'active'
    });
    
    const exists = !!existingWord;
    const warnings: string[] = [];
    const errors: string[] = [];
    
    // Basic validation
    if (word.length < 2) {
      errors.push('Word is too short (minimum 2 characters)');
    }
    
    if (word.length > 30) {
      errors.push('Word is too long (maximum 30 characters)');
    }
    
    if (!/^[A-Z\s\-']+$/i.test(word)) {
      errors.push('Word contains invalid characters');
    }
    
    // Category/difficulty validation
    if (exists && category && existingWord.category !== category) {
      warnings.push(`Word exists in category "${existingWord.category}", not "${category}"`);
    }
    
    if (exists && difficulty && existingWord.difficulty !== difficulty) {
      warnings.push(`Word exists with difficulty "${existingWord.difficulty}", not "${difficulty}"`);
    }
    
    // Calculate validation score
    let score = 100;
    if (!exists) score -= 30;
    if (errors.length > 0) score -= errors.length * 20;
    if (warnings.length > 0) score -= warnings.length * 10;
    
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
export async function getWordSuggestions(word: string, category?: WordCategory, limit: number = 5): Promise<string[]> {
  try {
    const query: any = { status: 'active' };
    if (category) query.category = category;
    
    // Find similar words using text search and regex
    const [textMatches, regexMatches] = await Promise.all([
      WordModel.find({
        ...query,
        $text: { $search: word }
      }).limit(limit),
      
      WordModel.find({
        ...query,
        word: { $regex: word.substring(0, 3), $options: 'i' }
      }).limit(limit)
    ]);
    
    // Combine and deduplicate
    const allMatches = [...textMatches, ...regexMatches];
    const uniqueWords = Array.from(new Set(allMatches.map(w => w.word)));
    
    return uniqueWords.slice(0, limit);
  } catch (error) {
    console.error('Error getting word suggestions:', error);
    return [];
  }
}

// Get word usage statistics
export async function getWordUsageStats(wordId: string): Promise<WordUsageStats | null> {
  try {
    const word = await WordModel.findById(wordId);
    if (!word) return null;
    
    return {
      wordId,
      word: word.word,
      usageCount: word.metadata.usageCount,
      lastUsed: word.metadata.last_used || word.createdAt,
      contexts: word.metadata.context_hints,
      performance: {
        correctGuesses: Math.floor(word.metadata.usageCount * 0.7), // Mock data
        totalAttempts: word.metadata.usageCount,
        accuracy: 0.7,
        averageTime: 5.0,
        difficulty_rating: word.metadata.difficulty_score
      }
    };
  } catch (error) {
    console.error('Error getting word usage stats:', error);
    return null;
  }
}

// Get word recommendations
export async function getWordRecommendations(wordId: string, limit: number = 5): Promise<WordRecommendation[]> {
  try {
    const word = await WordModel.findById(wordId);
    if (!word) return [];
    
    // Find similar words by category and difficulty
    const similarWords = await WordModel.find({
      _id: { $ne: wordId },
      category: word.category,
      difficulty: word.difficulty,
      status: 'active'
    }).limit(limit);
    
    return similarWords.map(w => ({
      word: w,
      score: calculateSimilarityScore(word, w),
      reasons: [`Same category: ${w.category}`, `Same difficulty: ${w.difficulty}`],
      category: 'similar' as const
    }));
  } catch (error) {
    console.error('Error getting word recommendations:', error);
    return [];
  }
}

// Bulk create words
export async function bulkCreateWords(importRequest: WordImportRequest): Promise<WordImportResult> {
  try {
    const { format, data, options } = importRequest;
    const results: WordImportResult = {
      success: true,
      imported: 0,
      skipped: 0,
      errors: [],
      words: []
    };
    
    let wordsToImport: any[] = [];
    
    // Parse data based on format
    if (format === 'json') {
      wordsToImport = Array.isArray(data) ? data : [data];
    } else if (format === 'csv') {
      // Simple CSV parsing (would need proper CSV parser in production)
      const lines = data.split('\n');
      const headers = lines[0].split(',');
      wordsToImport = lines.slice(1).map((line: string) => {
        const values = line.split(',');
        return headers.reduce((obj: any, header: string, index: number) => {
          obj[header.trim()] = values[index]?.trim();
          return obj;
        }, {});
      });
    }
    
    // Process each word
    for (const wordData of wordsToImport) {
      try {
        // Apply default options
        const processedWordData = {
          ...wordData,
          category: wordData.category || options.category || 'General',
          difficulty: wordData.difficulty || options.difficulty || 'beginner',
          language: wordData.language || options.language || 'english',
          status: 'active'
        };
        
        // Validate word data
        const validation = validateWordData(processedWordData);
        if (!validation.isValid) {
          results.errors.push(`Invalid word "${wordData.word}": ${validation.errors.join(', ')}`);
          results.skipped++;
          continue;
        }
        
        // Check if word already exists
        const existingWord = await WordModel.findOne({
          word: processedWordData.word.toUpperCase(),
          language: processedWordData.language,
          category: processedWordData.category
        });
        
        if (existingWord && !options.overwrite) {
          results.skipped++;
          continue;
        }
        
        // Create or update word
        const newWord = await createWord(processedWordData);
        results.words.push(newWord);
        results.imported++;
        
      } catch (error: any) {
        results.errors.push(`Failed to import word "${wordData.word}": ${error.message}`);
        results.skipped++;
      }
    }
    
    return results;
  } catch (error: any) {
    console.error('Error in bulk word import:', error);
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [`Bulk import failed: ${error.message}`],
      words: []
    };
  }
}

// Export words
export async function exportWords(exportRequest: WordExportRequest): Promise<{ data: any; filename: string }> {
  try {
    const { wordIds, collectionId, filters, format, options } = exportRequest;
    
    // Build query
    let query: any = { status: 'active' };
    
    if (wordIds) {
      query._id = { $in: wordIds };
    } else if (filters) {
      if (filters.category) query.category = filters.category;
      if (filters.difficulty) query.difficulty = filters.difficulty;
      if (filters.language) query.language = filters.language;
    }
    
    // Get words
    let wordsQuery = WordModel.find(query);
    
    if (options?.sortBy) {
      wordsQuery = wordsQuery.sort({ [options.sortBy]: 1 });
    }
    
    const words = await wordsQuery.exec();
    
    // Format data based on export format
    let exportData: any;
    let filename: string;
    
    switch (format) {
      case 'json':
        exportData = words.map(word => formatWordForExport(word, options));
        filename = `words_export_${Date.now()}.json`;
        break;
        
      case 'csv':
        exportData = convertToCSV(words, options);
        filename = `words_export_${Date.now()}.csv`;
        break;
        
      case 'txt':
        exportData = words.map(word => 
          `${word.word}\t${word.category}\t${word.difficulty}\t${word.description}`
        ).join('\n');
        filename = `words_export_${Date.now()}.txt`;
        break;
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
    
    return { data: exportData, filename };
  } catch (error) {
    console.error('Error exporting words:', error);
    throw new Error('Failed to export words');
  }
}

// Helper functions
function getDifficultyScore(difficulty: WordDifficulty): number {
  const scores = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4,
    master: 5
  };
  return scores[difficulty];
}

function calculateSimilarityScore(word1: WordDefinition, word2: WordDefinition): number {
  let score = 0;
  
  if (word1.category === word2.category) score += 30;
  if (word1.difficulty === word2.difficulty) score += 20;
  if (Math.abs(word1.length - word2.length) <= 2) score += 15;
  
  // Check for common tags
  const commonTags = word1.tags.filter(tag => word2.tags.includes(tag));
  score += commonTags.length * 5;
  
  return Math.min(100, score);
}

function formatWordForExport(word: WordDefinition, options?: any) {
  const exported: any = {
    word: word.word,
    category: word.category,
    difficulty: word.difficulty,
    description: word.description
  };
  
  if (options?.includeDefinitions && word.definition) {
    exported.definition = word.definition;
  }
  
  if (options?.includeExamples && word.examples.length > 0) {
    exported.examples = word.examples;
  }
  
  if (options?.includeSynonyms && word.synonyms.length > 0) {
    exported.synonyms = word.synonyms;
  }
  
  if (options?.includeMetadata) {
    exported.metadata = word.metadata;
  }
  
  return exported;
}

function convertToCSV(words: WordDefinition[], options?: any): string {
  const headers = ['word', 'category', 'difficulty', 'description'];
  
  if (options?.includeExamples) headers.push('examples');
  if (options?.includeSynonyms) headers.push('synonyms');
  
  const csvData = [
    headers.join(','),
    ...words.map(word => {
      const row = [
        word.word,
        word.category,
        word.difficulty,
        `"${word.description.replace(/"/g, '""')}"`
      ];
      
      if (options?.includeExamples) {
        row.push(`"${word.examples.join('; ')}"`);
      }
      if (options?.includeSynonyms) {
        row.push(`"${word.synonyms.join('; ')}"`);
      }
      
      return row.join(',');
    })
  ];
  
  return csvData.join('\n');
}