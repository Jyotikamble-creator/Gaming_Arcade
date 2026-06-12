// Word Management System Type Definitions

export type WordCategory = 
  | 'Programming' 
  | 'Technology' 
  | 'Computer Science' 
  | 'Web Development' 
  | 'Security'
  | 'Biology' 
  | 'Physics' 
  | 'Environment' 
  | 'Politics' 
  | 'Communication' 
  | 'Geography' 
  | 'Education'
  | 'Science'
  | 'General'
  | 'Custom';

export type WordDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';

export type WordLanguage = 'english' | 'spanish' | 'french' | 'german' | 'italian' | 'portuguese';

export type WordStatus = 'active' | 'inactive' | 'pending' | 'archived';

export interface WordDefinition {
  id: string;
  word: string;
  category: WordCategory;
  difficulty: WordDifficulty;
  language: WordLanguage;
  description: string;
  definition?: string;
  pronunciation?: string;
  etymology?: string;
  examples: string[];
  synonyms: string[];
  antonyms: string[];
  tags: string[];
  length: number;
  frequency: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  status: WordStatus;
  metadata: WordMetadata;
}

export interface WordMetadata {
  usageCount: number;
  difficulty_score: number;
  popularity_score: number;
  learning_weight: number;
  source: string;
  verified: boolean;
  last_used?: Date;
  context_hints: string[];
}

export interface WordCollection {
  id: string;
  name: string;
  description: string;
  category: WordCategory;
  difficulty: WordDifficulty;
  language: WordLanguage;
  words: string[];
  totalWords: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  metadata: CollectionMetadata;
}

export interface CollectionMetadata {
  downloads: number;
  rating: number;
  reviews: number;
  featured: boolean;
  trending: boolean;
  last_downloaded?: Date;
  version: string;
}

export interface WordSearchQuery {
  query?: string;
  category?: WordCategory;
  difficulty?: WordDifficulty;
  language?: WordLanguage;
  minLength?: number;
  maxLength?: number;
  tags?: string[];
  status?: WordStatus;
  sortBy?: 'word' | 'category' | 'difficulty' | 'frequency' | 'created' | 'updated';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface WordSearchResult {
  words: WordDefinition[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  filters: WordSearchFilters;
}

export interface WordSearchFilters {
  categories: CategoryCount[];
  difficulties: DifficultyCount[];
  languages: LanguageCount[];
  lengths: LengthRange;
  tags: TagCount[];
}

export interface CategoryCount {
  category: WordCategory;
  count: number;
}

export interface DifficultyCount {
  difficulty: WordDifficulty;
  count: number;
}

export interface LanguageCount {
  language: WordLanguage;
  count: number;
}

export interface LengthRange {
  min: number;
  max: number;
  distribution: Record<number, number>;
}

export interface TagCount {
  tag: string;
  count: number;
}

export interface WordAnalytics {
  totalWords: number;
  wordsByCategory: Record<WordCategory, number>;
  wordsByDifficulty: Record<WordDifficulty, number>;
  wordsByLanguage: Record<WordLanguage, number>;
  averageLength: number;
  mostFrequent: WordDefinition[];
  recentlyAdded: WordDefinition[];
  trending: WordDefinition[];
  topCategories: CategoryCount[];
  lengthDistribution: Record<number, number>;
}

export interface WordImportRequest {
  format: 'json' | 'csv' | 'txt';
  data: any;
  options: ImportOptions;
}

export interface ImportOptions {
  category?: WordCategory;
  difficulty?: WordDifficulty;
  language?: WordLanguage;
  overwrite?: boolean;
  verify?: boolean;
  source?: string;
}

export interface WordImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
  words: WordDefinition[];
}

export interface WordExportRequest {
  wordIds?: string[];
  collectionId?: string;
  filters?: WordSearchQuery;
  format: 'json' | 'csv' | 'txt' | 'xml';
  options: ExportOptions;
}

export interface ExportOptions {
  includeMetadata?: boolean;
  includeExamples?: boolean;
  includeSynonyms?: boolean;
  includeDefinitions?: boolean;
  sortBy?: string;
}

export interface WordUsageStats {
  wordId: string;
  word: string;
  usageCount: number;
  lastUsed: Date;
  contexts: string[];
  performance: WordPerformance;
}

export interface WordPerformance {
  correctGuesses: number;
  totalAttempts: number;
  accuracy: number;
  averageTime: number;
  difficulty_rating: number;
}

export interface WordRecommendation {
  word: WordDefinition;
  score: number;
  reasons: string[];
  category: 'similar' | 'related' | 'difficulty' | 'popular' | 'recent';
}

export interface WordValidationRequest {
  word: string;
  category?: WordCategory;
  difficulty?: WordDifficulty;
  language?: WordLanguage;
}

export interface WordValidationResult {
  isValid: boolean;
  exists: boolean;
  suggestions: string[];
  warnings: string[];
  errors: string[];
  score: number;
}

export interface BulkWordOperation {
  operation: 'update' | 'delete' | 'archive' | 'activate';
  wordIds: string[];
  data?: Partial<WordDefinition>;
}

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
  results: WordDefinition[];
}

// Default word data expanded from the original sample
export const defaultWordDatabase: Omit<WordDefinition, 'id' | 'createdAt' | 'updatedAt' | 'metadata'>[] = [
  {
    word: "HELLO",
    category: "Communication",
    difficulty: "beginner",
    language: "english",
    description: "A friendly greeting used to acknowledge someone's presence or start a conversation",
    definition: "An expression or gesture of greeting",
    examples: ["Hello, how are you?", "She said hello to her neighbor"],
    synonyms: ["Hi", "Greetings", "Hey"],
    antonyms: ["Goodbye", "Farewell"],
    tags: ["greeting", "social", "common"],
    length: 5,
    frequency: 95,
    status: "active"
  },
  {
    word: "WORLD",
    category: "Geography",
    difficulty: "beginner",
    language: "english",
    description: "The planet Earth, our home in the solar system, inhabited by over 8 billion people",
    definition: "The earth and all the people and things on it",
    examples: ["Around the world in 80 days", "The world is round"],
    synonyms: ["Earth", "Planet", "Globe"],
    antonyms: [],
    tags: ["planet", "earth", "global"],
    length: 5,
    frequency: 88,
    status: "active"
  },
  {
    word: "JAVASCRIPT",
    category: "Programming",
    difficulty: "intermediate",
    language: "english",
    description: "A high-level programming language that enables interactive web pages and is an essential part of web applications",
    definition: "A scripting language used primarily for web development",
    examples: ["JavaScript is used for frontend development", "Node.js runs JavaScript on servers"],
    synonyms: ["JS", "ECMAScript"],
    antonyms: [],
    tags: ["programming", "web", "scripting", "frontend"],
    length: 10,
    frequency: 75,
    status: "active"
  },
  {
    word: "REACT",
    category: "Programming",
    difficulty: "intermediate",
    language: "english",
    description: "A popular JavaScript library for building user interfaces, particularly single-page applications",
    definition: "A JavaScript library for building user interfaces",
    examples: ["React components are reusable", "Facebook created React"],
    synonyms: ["ReactJS"],
    antonyms: [],
    tags: ["programming", "frontend", "library", "ui"],
    length: 5,
    frequency: 70,
    status: "active"
  },
  {
    word: "PROGRAMMING",
    category: "Computer Science",
    difficulty: "intermediate",
    language: "english",
    description: "The process of creating instructions for computers to follow, using languages like Python, Java, or C++",
    definition: "The process of creating computer software using programming languages",
    examples: ["Programming requires logical thinking", "She learned programming at university"],
    synonyms: ["Coding", "Software Development"],
    antonyms: [],
    tags: ["computer", "development", "software", "coding"],
    length: 11,
    frequency: 82,
    status: "active"
  },
  {
    word: "ALGORITHM",
    category: "Computer Science",
    difficulty: "advanced",
    language: "english",
    description: "A step-by-step procedure or formula for solving a problem, fundamental to computer science and mathematics",
    definition: "A process or set of rules to be followed in calculations or problem-solving operations",
    examples: ["Sorting algorithms arrange data", "Machine learning uses complex algorithms"],
    synonyms: ["Procedure", "Formula", "Method"],
    antonyms: [],
    tags: ["computer science", "mathematics", "procedure", "logic"],
    length: 9,
    frequency: 65,
    status: "active"
  },
  {
    word: "CRYPTOGRAPHY",
    category: "Security",
    difficulty: "expert",
    language: "english",
    description: "The practice and study of techniques for secure communication in the presence of adversarial behavior",
    definition: "The art of writing or solving codes",
    examples: ["Cryptography protects online transactions", "Modern cryptography uses mathematical algorithms"],
    synonyms: ["Encryption", "Code-making"],
    antonyms: ["Decryption"],
    tags: ["security", "encryption", "mathematics", "protection"],
    length: 12,
    frequency: 45,
    status: "active"
  },
  {
    word: "PHOTOSYNTHESIS",
    category: "Biology",
    difficulty: "advanced",
    language: "english",
    description: "The process by which plants convert light energy into chemical energy, producing oxygen and glucose from carbon dioxide and water",
    definition: "The process by which green plants make their food using sunlight",
    examples: ["Photosynthesis produces oxygen", "Plants need sunlight for photosynthesis"],
    synonyms: [],
    antonyms: ["Respiration"],
    tags: ["biology", "plants", "energy", "science"],
    length: 14,
    frequency: 55,
    status: "active"
  },
  {
    word: "QUANTUM",
    category: "Physics",
    difficulty: "expert",
    language: "english",
    description: "A branch of physics dealing with matter and energy at the smallest scales, where particles exhibit wave-particle duality",
    definition: "The smallest possible discrete unit of any physical property",
    examples: ["Quantum mechanics governs atomic behavior", "Quantum computers use quantum bits"],
    synonyms: ["Discrete unit"],
    antonyms: ["Classical"],
    tags: ["physics", "science", "particle", "energy"],
    length: 7,
    frequency: 40,
    status: "active"
  },
  {
    word: "BLOCKCHAIN",
    category: "Technology",
    difficulty: "advanced",
    language: "english",
    description: "A decentralized digital ledger that records transactions across multiple computers securely and transparently",
    definition: "A digital ledger of transactions that is duplicated and distributed across a network",
    examples: ["Bitcoin uses blockchain technology", "Blockchain ensures transaction security"],
    synonyms: ["Distributed ledger"],
    antonyms: ["Centralized database"],
    tags: ["technology", "cryptocurrency", "security", "digital"],
    length: 10,
    frequency: 60,
    status: "active"
  }
];

// Word Management Constants
export const WORD_CONSTANTS = {
  MIN_WORD_LENGTH: 2,
  MAX_WORD_LENGTH: 30,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_EXAMPLES: 5,
  MAX_SYNONYMS: 10,
  MAX_ANTONYMS: 10,
  MAX_TAGS: 15,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  DIFFICULTY_SCORES: {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4,
    master: 5
  },
  
  FREQUENCY_WEIGHTS: {
    very_common: 90,
    common: 70,
    moderate: 50,
    uncommon: 30,
    rare: 10
  }
} as const;

// Search and filter types
export interface WordFilterCriteria {
  category?: WordCategory[];
  difficulty?: WordDifficulty[];
  language?: WordLanguage[];
  lengthRange?: [number, number];
  frequencyRange?: [number, number];
  tags?: string[];
  status?: WordStatus[];
  verified?: boolean;
  hasExamples?: boolean;
  hasSynonyms?: boolean;
  hasDefinition?: boolean;
}

export interface WordSortOptions {
  field: 'word' | 'category' | 'difficulty' | 'frequency' | 'length' | 'created' | 'updated' | 'usage';
  direction: 'asc' | 'desc';
}

export interface WordPagination {
  page: number;
  limit: number;
  offset: number;
  total?: number;
}

export interface WordManagementConfig {
  defaultLanguage: WordLanguage;
  defaultCategory: WordCategory;
  defaultDifficulty: WordDifficulty;
  autoVerification: boolean;
  allowDuplicates: boolean;
  requireExamples: boolean;
  minExamples: number;
  enableAnalytics: boolean;
  cacheResults: boolean;
}