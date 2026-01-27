// MongoDB Model: Word Management System
import mongoose, { Schema, model, models } from 'mongoose';
// import type { WordDefinition, WordCategory, WordDifficulty, WordLanguage, WordStatus } from '@/types/games/word';\n\n// Local type definitions to avoid import issues\ntype WordDefinition = any;\ntype WordCategory = any;\ntype WordDifficulty = 'easy' | 'medium' | 'hard';\ntype WordLanguage = string;\ntype WordStatus = 'active' | 'inactive';

const WordMetadataSchema = new Schema({
  usageCount: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  difficulty_score: { 
    type: Number, 
    default: 1,
    min: 1,
    max: 5 
  },
  popularity_score: { 
    type: Number, 
    default: 50,
    min: 0,
    max: 100 
  },
  learning_weight: { 
    type: Number, 
    default: 1.0,
    min: 0.1,
    max: 5.0 
  },
  source: { 
    type: String, 
    default: 'system',
    maxlength: 100 
  },
  verified: { 
    type: Boolean, 
    default: false 
  },
  last_used: { 
    type: Date, 
    default: null 
  },
  context_hints: [{ 
    type: String, 
    maxlength: 200 
  }]
}, { _id: false });

const WordDefinitionSchema = new Schema<WordDefinition>({
  word: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    minlength: 2,
    maxlength: 30,
    match: /^[A-Z\s\-']+$/
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Programming', 'Technology', 'Computer Science', 'Web Development', 'Security',
      'Biology', 'Physics', 'Environment', 'Politics', 'Communication', 
      'Geography', 'Education', 'Science', 'General', 'Custom'
    ],
    default: 'General'
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced', 'expert', 'master'],
    default: 'beginner'
  },
  language: {
    type: String,
    required: true,
    enum: ['english', 'spanish', 'french', 'german', 'italian', 'portuguese'],
    default: 'english'
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  definition: {
    type: String,
    trim: true,
    maxlength: 300
  },
  pronunciation: {
    type: String,
    trim: true,
    maxlength: 100
  },
  etymology: {
    type: String,
    trim: true,
    maxlength: 300
  },
  examples: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  synonyms: [{
    type: String,
    uppercase: true,
    trim: true,
    maxlength: 30
  }],
  antonyms: [{
    type: String,
    uppercase: true,
    trim: true,
    maxlength: 30
  }],
  tags: [{
    type: String,
    lowercase: true,
    trim: true,
    maxlength: 30
  }],
  length: {
    type: Number,
    required: true,
    min: 2,
    max: 30
  },
  frequency: {
    type: Number,
    required: true,
    default: 50,
    min: 1,
    max: 100
  },
  createdBy: {
    type: String,
    default: 'system',
    maxlength: 100
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'archived'],
    default: 'active'
  },
  metadata: {
    type: WordMetadataSchema,
    default: () => ({})
  }
}, {
  timestamps: true,
  collection: 'word_definitions'
});

// Compound indexes for efficient querying
WordDefinitionSchema.index({ 
  word: 1, 
  language: 1, 
  category: 1 
}, { 
  unique: true,
  name: 'word_language_category_unique' 
});

WordDefinitionSchema.index({ 
  category: 1, 
  difficulty: 1, 
  status: 1 
}, { 
  name: 'category_difficulty_status_index' 
});

WordDefinitionSchema.index({ 
  language: 1, 
  status: 1, 
  frequency: -1 
}, { 
  name: 'language_status_frequency_index' 
});

WordDefinitionSchema.index({ 
  tags: 1, 
  category: 1 
}, { 
  name: 'tags_category_index' 
});

WordDefinitionSchema.index({ 
  length: 1, 
  difficulty: 1 
}, { 
  name: 'length_difficulty_index' 
});

WordDefinitionSchema.index({ 
  'metadata.usageCount': -1, 
  'metadata.popularity_score': -1 
}, { 
  name: 'usage_popularity_index' 
});

WordDefinitionSchema.index({ 
  word: 'text', 
  description: 'text', 
  tags: 'text' 
}, { 
  name: 'word_search_index',
  weights: {
    word: 10,
    description: 5,
    tags: 3
  }
});

// Pre-save middleware
WordDefinitionSchema.pre('save', function(next) {
  // Calculate word length
  this.length = this.word.length;
  
  // Remove duplicates from arrays
  this.examples = [...new Set(this.examples)];
  this.synonyms = [...new Set(this.synonyms)];
  this.antonyms = [...new Set(this.antonyms)];
  this.tags = [...new Set(this.tags)];
  
  // Limit array sizes
  this.examples = this.examples.slice(0, 5);
  this.synonyms = this.synonyms.slice(0, 10);
  this.antonyms = this.antonyms.slice(0, 10);
  this.tags = this.tags.slice(0, 15);
  
  // Update difficulty score based on word characteristics
  const difficultyScores = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4,
    master: 5
  };
  this.metadata.difficulty_score = difficultyScores[this.difficulty];
  
  // Calculate popularity score based on frequency and usage
  this.metadata.popularity_score = Math.min(
    100, 
    this.frequency + (this.metadata.usageCount * 0.1)
  );
  
  next();
});

// Instance methods
WordDefinitionSchema.methods.incrementUsage = function() {
  this.metadata.usageCount += 1;
  this.metadata.last_used = new Date();
  return this.save();
};

WordDefinitionSchema.methods.updatePopularity = function(score: number) {
  this.metadata.popularity_score = Math.max(0, Math.min(100, score));
  return this.save();
};

WordDefinitionSchema.methods.addContextHint = function(hint: string) {
  if (!this.metadata.context_hints.includes(hint)) {
    this.metadata.context_hints.push(hint);
    if (this.metadata.context_hints.length > 10) {
      this.metadata.context_hints = this.metadata.context_hints.slice(-10);
    }
  }
  return this.save();
};

WordDefinitionSchema.methods.verify = function() {
  this.metadata.verified = true;
  return this.save();
};

// Static methods
WordDefinitionSchema.statics.findByCategory = function(category: WordCategory) {
  return this.find({ category, status: 'active' });
};

WordDefinitionSchema.statics.findByDifficulty = function(difficulty: WordDifficulty) {
  return this.find({ difficulty, status: 'active' });
};

WordDefinitionSchema.statics.findByLength = function(minLength: number, maxLength?: number) {
  const query: any = { length: { $gte: minLength }, status: 'active' };
  if (maxLength) {
    query.length.$lte = maxLength;
  }
  return this.find(query);
};

WordDefinitionSchema.statics.searchWords = function(searchTerm: string, options: any = {}) {
  const {
    category,
    difficulty,
    language = 'english',
    limit = 20,
    sort = 'word'
  } = options;
  
  const query: any = {
    status: 'active',
    language
  };
  
  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }
  
  if (category) query.category = category;
  if (difficulty) query.difficulty = difficulty;
  
  return this.find(query)
    .sort({ [sort]: 1 })
    .limit(limit);
};

WordDefinitionSchema.statics.getMostUsed = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ 'metadata.usageCount': -1, 'metadata.popularity_score': -1 })
    .limit(limit);
};

WordDefinitionSchema.statics.getRandomWords = function(count = 1, filters: any = {}) {
  const query = { status: 'active', ...filters };
  return this.aggregate([
    { $match: query },
    { $sample: { size: count } }
  ]);
};

WordDefinitionSchema.statics.getWordsByTags = function(tags: string[], operator = 'any') {
  const query: any = { status: 'active' };
  
  if (operator === 'all') {
    query.tags = { $all: tags };
  } else {
    query.tags = { $in: tags };
  }
  
  return this.find(query);
};

// Create and export model
const WordModel = models.Word || model<WordDefinition>('Word', WordDefinitionSchema);

export default WordModel;