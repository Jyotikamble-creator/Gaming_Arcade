// Enhanced Dashboard utility helpers for GameArchade

import type {
  DashboardConfig,
  GameConfig,
  DashboardFilters,
  DashboardUserStats,
  DashboardAnalytics,
  GameCategory,
  GameDifficulty,
  GameColor,
  DashboardError,
  GameStats,
  DashboardLayout
} from "@/types/dashboard/dashboard";

/**
 * Dashboard Configuration Utilities
 */
export namespace DashboardHelpers {
  
  /**
   * Configuration Management
   */
  export namespace Config {
    
    /**
     * Create default dashboard configuration
     */
    export function createDefaultConfig(overrides: Partial<DashboardConfig> = {}): DashboardConfig {
      const defaultConfig: DashboardConfig = {
        layout: 'grid',
        itemsPerPage: 24,
        showCategories: true,
        showSearch: true,
        showStats: true,
        enableAnimations: true,
        enableSounds: false,
        theme: 'dark',
        sortBy: 'name',
        sortOrder: 'asc',
        allowCustomGames: false,
        enableAnalytics: true,
        autoSaveProgress: true,
        showTutorials: true,
        enableNotifications: true,
        defaultCategory: null,
        cacheTimeout: 300000, // 5 minutes
        maxRecentGames: 10,
        enableOfflineMode: false,
        accessibilityOptions: {
          highContrast: false,
          reducedMotion: false,
          screenReader: false,
          largeText: false,
          keyboardNavigation: true
        }
      };

      return { ...defaultConfig, ...overrides };
    }

    /**
     * Validate configuration
     */
    export function validateConfig(config: Partial<DashboardConfig>): string[] {
      const errors: string[] = [];

      if (config.itemsPerPage && (config.itemsPerPage < 1 || config.itemsPerPage > 100)) {
        errors.push('itemsPerPage must be between 1 and 100');
      }

      if (config.cacheTimeout && config.cacheTimeout < 0) {
        errors.push('cacheTimeout must be non-negative');
      }

      if (config.maxRecentGames && (config.maxRecentGames < 1 || config.maxRecentGames > 50)) {
        errors.push('maxRecentGames must be between 1 and 50');
      }

      return errors;
    }
  }

  /**
   * Game Management Utilities
   */
  export namespace Games {
    
    /**
     * Get default game configurations
     */
    export function getDefaultGames(): GameConfig[] {
      return [
        {
          id: 'wordguess',
          name: 'Word Guess',
          path: '/wordguess',
          icon: '🔤',
          color: 'blue',
          category: 'word',
          difficulty: 'medium',
          description: 'Guess the hidden word with letter clues',
          tags: ['word', 'puzzle', 'vocabulary'],
          estimatedTime: '5-10 min',
          isNew: false,
          isFeatured: true,
          isComingSoon: false,
          minPlayers: 1,
          maxPlayers: 1,
          ageRating: 'all',
          platforms: ['web'],
          controls: ['keyboard', 'mouse'],
          features: ['singleplayer', 'scoring', 'hints'],
          lastUpdated: new Date().toISOString(),
          stats: {
            totalPlays: 0,
            averageScore: 0,
            bestScore: 0,
            completionRate: 0,
            averageTime: 0,
            rating: 0,
            reviews: 0
          }
        },
        {
          id: 'hangman',
          name: 'Hangman',
          path: '/hangman',
          icon: '🎯',
          color: 'purple',
          category: 'word',
          difficulty: 'easy',
          description: 'Classic word guessing game',
          tags: ['word', 'classic', 'guessing'],
          estimatedTime: '5-15 min',
          isNew: false,
          isFeatured: false,
          isComingSoon: false,
          minPlayers: 1,
          maxPlayers: 1,
          ageRating: 'all',
          platforms: ['web'],
          controls: ['keyboard', 'mouse'],
          features: ['singleplayer', 'scoring', 'categories'],
          lastUpdated: new Date().toISOString(),
          stats: {
            totalPlays: 0,
            averageScore: 0,
            bestScore: 0,
            completionRate: 0,
            averageTime: 0,
            rating: 0,
            reviews: 0
          }
        },
        {
          id: 'wordscramble',
          name: 'Word Scramble',
          path: '/wordscramble',
          icon: '🔀',
          color: 'green',
          category: 'word',
          difficulty: 'medium',
          description: 'Unscramble letters to form words',
          tags: ['word', 'scramble', 'anagram'],
          estimatedTime: '3-8 min',
          isNew: false,
          isFeatured: false,
          isComingSoon: false,
          minPlayers: 1,
          maxPlayers: 1,
          ageRating: 'all',
          platforms: ['web'],
          controls: ['keyboard', 'mouse'],
          features: ['singleplayer', 'timer', 'scoring'],
          lastUpdated: new Date().toISOString(),
          stats: {
            totalPlays: 0,
            averageScore: 0,
            bestScore: 0,
            completionRate: 0,
            averageTime: 0,
            rating: 0,
            reviews: 0
          }
        },
        {
          id: 'wordbuilder',
          name: 'Word Builder',
          path: '/wordbuilder',
          icon: '🧱',
          color: 'indigo',
          category: 'word',
          difficulty: 'hard',
          description: 'Build words from letter tiles',
          tags: ['word', 'building', 'tiles'],
          estimatedTime: '10-20 min',
          isNew: true,
          isFeatured: false,
          isComingSoon: false,
          minPlayers: 1,
          maxPlayers: 1,
          ageRating: 'all',
          platforms: ['web'],
          controls: ['mouse', 'touch'],
          features: ['singleplayer', 'scoring', 'powerups'],
          lastUpdated: new Date().toISOString(),
          stats: {
            totalPlays: 0,
            averageScore: 0,
            bestScore: 0,
            completionRate: 0,
            averageTime: 0,
            rating: 0,
            reviews: 0
          }
        },
        {
          id: 'quiz',
          name: 'Quiz Master',
          path: '/quiz',
          icon: '🧠',
          color: 'yellow',
          category: 'trivia',
          difficulty: 'medium',
          description: 'Test your knowledge with trivia questions',
          tags: ['trivia', 'knowledge', 'questions'],
          estimatedTime: '10-30 min',
          isNew: false,
          isFeatured: true,
          isComingSoon: false,
          minPlayers: 1,
          maxPlayers: 1,
          ageRating: 'all',
          platforms: ['web'],
          controls: ['mouse', 'keyboard'],
          features: ['singleplayer', 'categories', 'scoring'],
          lastUpdated: new Date().toISOString(),
          stats: {
            totalPlays: 0,
            averageScore: 0,
            bestScore: 0,
            completionRate: 0,
            averageTime: 0,
            rating: 0,
            reviews: 0
          }
        },
        {
          id: 'mathquiz',
          name: 'Math Quiz',
          path: '/mathquiz',
          icon: '➕',
          color: 'pink',
          category: 'math',
          difficulty: 'easy',
          description: 'Practice math with fun quizzes',
          tags: ['math', 'arithmetic', 'education'],
          estimatedTime: '5-15 min',
          isNew: false,
          isFeatured: false,
          isComingSoon: false,
          minPlayers: 1,
          maxPlayers: 1,
          ageRating: 'all',
          platforms: ['web'],
          controls: ['keyboard', 'mouse'],
          features: ['singleplayer', 'levels', 'progress'],
          lastUpdated: new Date().toISOString(),
          stats: {
            totalPlays: 0,
            averageScore: 0,
            bestScore: 0,
            completionRate: 0,
            averageTime: 0,
            rating: 0,
            reviews: 0
          }
        },
        {
          id: 'speedmath',
          name: 'Speed Math',
          path: '/speed-math',
          icon: '⚡',
          color: 'red',
          category: 'math',
          difficulty: 'hard',
          description: 'Solve math problems as fast as you can',
          tags: ['math', 'speed', 'challenge'],
          estimatedTime: '3-10 min',
          isNew: false,
          isFeatured: false,
          isComingSoon: false,
          minPlayers: 1,
          maxPlayers: 1,
          ageRating: 'all',
          platforms: ['web'],
          controls: ['keyboard'],
          features: ['singleplayer', 'timer', 'leaderboard'],
          lastUpdated: new Date().toISOString(),
          stats: {
            totalPlays: 0,
            averageScore: 0,
            bestScore: 0,
            completionRate: 0,
            averageTime: 0,
            rating: 0,
            reviews: 0
          }
        },
        {
          id: 'memorycard',
          name: 'Memory Cards',
          path: '/memorycard',
          icon: '🃏',
          color: 'orange',
          category: 'memory',
          difficulty: 'medium',
          description: 'Match pairs of cards to test your memory',
          tags: ['memory', 'cards', 'matching'],
          estimatedTime: '5-15 min',
          isNew: false,
          isFeatured: false,
          isComingSoon: false,
          minPlayers: 1,
          maxPlayers: 1,
          ageRating: 'all',
          platforms: ['web'],
          controls: ['mouse', 'touch'],
          features: ['singleplayer', 'levels', 'scoring'],
          lastUpdated: new Date().toISOString(),
          stats: {
            totalPlays: 0,
            averageScore: 0,
            bestScore: 0,
            completionRate: 0,
            averageTime: 0,
            rating: 0,
            reviews: 0
          }
        },
        {
          id: 'simonsays',
          name: 'Simon Says',
          path: '/simonsays',
          icon: '🎵',
          color: 'brown',
          category: 'memory',
          difficulty: 'medium',
          description: 'Remember and repeat the sequence',
          tags: ['memory', 'sequence', 'pattern'],
          estimatedTime: '5-20 min',
          isNew: false,
          isFeatured: false,
          isComingSoon: false,
          minPlayers: 1,
          maxPlayers: 1,
          ageRating: 'all',
          platforms: ['web'],
          controls: ['mouse', 'touch'],
          features: ['singleplayer', 'sound', 'progression'],
          lastUpdated: new Date().toISOString(),
          stats: {
            totalPlays: 0,
            averageScore: 0,
            bestScore: 0,
            completionRate: 0,
            averageTime: 0,
            rating: 0,
            reviews: 0
          }
        },
        {
          id: 'slidingpuzzle',
          name: 'Sliding Puzzle',
          path: '/slidingpuzzle',
          icon: '🧩',
          color: 'cyan',
          category: 'puzzle',
          difficulty: 'medium',
          description: 'Slide tiles to complete the picture',
          tags: ['puzzle', 'tiles', 'sliding'],
          estimatedTime: '10-30 min',
          isNew: false,
          isFeatured: false,
          isComingSoon: false,
          minPlayers: 1,
          maxPlayers: 1,
          ageRating: 'all',
          platforms: ['web'],
          controls: ['mouse', 'touch'],
          features: ['singleplayer', 'images', 'timer'],
          lastUpdated: new Date().toISOString(),
          stats: {
            totalPlays: 0,
            averageScore: 0,
            bestScore: 0,
            completionRate: 0,
            averageTime: 0,
            rating: 0,
            reviews: 0
          }
        },
        {
          id: 'sudoku',
          name: 'Sudoku',
          path: '/sudoku',
          icon: '🔢',
          color: 'teal',
          category: 'puzzle',
          difficulty: 'hard',
          description: 'Fill the grid with numbers 1-9',
          tags: ['puzzle', 'numbers', 'logic'],
          estimatedTime: '15-60 min',
          isNew: false,
          isFeatured: true,
          isComingSoon: false,
          minPlayers: 1,
          maxPlayers: 1,
          ageRating: 'all',
          platforms: ['web'],
          controls: ['keyboard', 'mouse'],
          features: ['singleplayer', 'difficulty', 'hints'],
          lastUpdated: new Date().toISOString(),
          stats: {
            totalPlays: 0,
            averageScore: 0,
            bestScore: 0,
            completionRate: 0,
            averageTime: 0,
            rating: 0,
            reviews: 0
          }
        },
        {
          id: 'brainteaser',
          name: 'Brain Teaser',
          path: '/brainteaser',
          icon: '🤔',
          color: 'violet',
          category: 'puzzle',
          difficulty: 'hard',
          description: 'Challenge your mind with brain teasers',
          tags: ['puzzle', 'brain', 'logic'],
          estimatedTime: '5-20 min',
          isNew: true,
          isFeatured: false,
          isComingSoon: false,
          minPlayers: 1,
          maxPlayers: 1,
          ageRating: 'all',
          platforms: ['web'],
          controls: ['keyboard', 'mouse'],
          features: ['singleplayer', 'categories', 'hints'],
          lastUpdated: new Date().toISOString(),
          stats: {
            totalPlays: 0,
            averageScore: 0,
            bestScore: 0,
            completionRate: 0,
            averageTime: 0,
            rating: 0,
            reviews: 0
          }
        },
        {
          id: 'reactiontime',
          name: 'Reaction Time',
          path: '/reaction-time',
          icon: '⚡',
          color: 'lime',
          category: 'action',
          difficulty: 'easy',
          description: 'Test your reflexes and reaction speed',
          tags: ['action', 'reflexes', 'speed'],
          estimatedTime: '2-5 min',
          isNew: false,
          isFeatured: false,
          isComingSoon: false,
          minPlayers: 1,
          maxPlayers: 1,
          ageRating: 'all',
          platforms: ['web'],
          controls: ['mouse', 'keyboard'],
          features: ['singleplayer', 'leaderboard', 'statistics'],
          lastUpdated: new Date().toISOString(),
          stats: {
            totalPlays: 0,
            averageScore: 0,
            bestScore: 0,
            completionRate: 0,
            averageTime: 0,
            rating: 0,
            reviews: 0
          }
        },
        {
          id: 'typetesting',
          name: 'Type Testing',
          path: '/typing-test',
          icon: '⌨️',
          color: 'amber',
          category: 'typing',
          difficulty: 'medium',
          description: 'Improve your typing speed and accuracy',
          tags: ['typing', 'speed', 'accuracy'],
          estimatedTime: '5-15 min',
          isNew: false,
          isFeatured: false,
          isComingSoon: false,
          minPlayers: 1,
          maxPlayers: 1,
          ageRating: 'all',
          platforms: ['web'],
          controls: ['keyboard'],
          features: ['singleplayer', 'wpm', 'accuracy'],
          lastUpdated: new Date().toISOString(),
          stats: {
            totalPlays: 0,
            averageScore: 0,
            bestScore: 0,
            completionRate: 0,
            averageTime: 0,
            rating: 0,
            reviews: 0
          }
        },
        {
          id: 'whackmole',
          name: 'Whack-a-Mole',
          path: '/whackmole',
          icon: '🔨',
          color: 'rose',
          category: 'action',
          difficulty: 'easy',
          description: 'Whack the moles as they pop up',
          tags: ['action', 'arcade', 'timing'],
          estimatedTime: '3-10 min',
          isNew: false,
          isFeatured: false,
          isComingSoon: false,
          minPlayers: 1,
          maxPlayers: 1,
          ageRating: 'all',
          platforms: ['web'],
          controls: ['mouse', 'touch'],
          features: ['singleplayer', 'score', 'timer'],
          lastUpdated: new Date().toISOString(),
          stats: {
            totalPlays: 0,
            averageScore: 0,
            bestScore: 0,
            completionRate: 0,
            averageTime: 0,
            rating: 0,
            reviews: 0
          }
        },
        {
          id: 'towerstacker',
          name: 'Tower Stacker',
          path: '/tower-stacker',
          icon: '🏗️',
          color: 'emerald',
          category: 'action',
          difficulty: 'medium',
          description: 'Stack blocks to build the tallest tower',
          tags: ['action', 'stacking', 'precision'],
          estimatedTime: '5-15 min',
          isNew: false,
          isFeatured: false,
          isComingSoon: false,
          minPlayers: 1,
          maxPlayers: 1,
          ageRating: 'all',
          platforms: ['web'],
          controls: ['mouse', 'keyboard'],
          features: ['singleplayer', 'physics', 'highscore'],
          lastUpdated: new Date().toISOString(),
          stats: {
            totalPlays: 0,
            averageScore: 0,
            bestScore: 0,
            completionRate: 0,
            averageTime: 0,
            rating: 0,
            reviews: 0
          }
        },
        {
          id: 'emojiguess',
          name: 'Emoji Guess',
          path: '/emoji',
          icon: '😄',
          color: 'slate',
          category: 'word',
          difficulty: 'easy',
          description: 'Guess the word from emoji clues',
          tags: ['emoji', 'word', 'guessing'],
          estimatedTime: '5-10 min',
          isNew: false,
          isFeatured: false,
          isComingSoon: false,
          minPlayers: 1,
          maxPlayers: 1,
          ageRating: 'all',
          platforms: ['web'],
          controls: ['keyboard', 'mouse'],
          features: ['singleplayer', 'categories', 'hints'],
          lastUpdated: new Date().toISOString(),
          stats: {
            totalPlays: 0,
            averageScore: 0,
            bestScore: 0,
            completionRate: 0,
            averageTime: 0,
            rating: 0,
            reviews: 0
          }
        },
        {
          id: 'numbermaze',
          name: 'Number Maze',
          path: '/numbermaze',
          icon: '🔢',
          color: 'gray',
          category: 'puzzle',
          difficulty: 'medium',
          description: 'Navigate through the number maze',
          tags: ['puzzle', 'numbers', 'maze'],
          estimatedTime: '10-25 min',
          isNew: false,
          isFeatured: false,
          isComingSoon: false,
          minPlayers: 1,
          maxPlayers: 1,
          ageRating: 'all',
          platforms: ['web'],
          controls: ['keyboard', 'mouse'],
          features: ['singleplayer', 'levels', 'pathfinding'],
          lastUpdated: new Date().toISOString(),
          stats: {
            totalPlays: 0,
            averageScore: 0,
            bestScore: 0,
            completionRate: 0,
            averageTime: 0,
            rating: 0,
            reviews: 0
          }
        },
        {
          id: 'codingpuzzle',
          name: 'Coding Puzzle',
          path: '/codingpuzzle',
          icon: '💻',
          color: 'blue',
          category: 'coding',
          difficulty: 'hard',
          description: 'Solve programming challenges',
          tags: ['coding', 'programming', 'challenge'],
          estimatedTime: '15-45 min',
          isNew: true,
          isFeatured: true,
          isComingSoon: false,
          minPlayers: 1,
          maxPlayers: 1,
          ageRating: 'teen',
          platforms: ['web'],
          controls: ['keyboard'],
          features: ['singleplayer', 'languages', 'complexity'],
          lastUpdated: new Date().toISOString(),
          stats: {
            totalPlays: 0,
            averageScore: 0,
            bestScore: 0,
            completionRate: 0,
            averageTime: 0,
            rating: 0,
            reviews: 0
          }
        },
        {
          id: 'tictactoe',
          name: 'Tic-Tac-Toe',
          path: '/tic-tac-toe',
          icon: '⭕',
          color: 'purple',
          category: 'strategy',
          difficulty: 'easy',
          description: 'Classic three-in-a-row game',
          tags: ['strategy', 'classic', 'turn-based'],
          estimatedTime: '2-5 min',
          isNew: false,
          isFeatured: false,
          isComingSoon: false,
          minPlayers: 1,
          maxPlayers: 2,
          ageRating: 'all',
          platforms: ['web'],
          controls: ['mouse', 'touch'],
          features: ['singleplayer', 'multiplayer', 'ai'],
          lastUpdated: new Date().toISOString(),
          stats: {
            totalPlays: 0,
            averageScore: 0,
            bestScore: 0,
            completionRate: 0,
            averageTime: 0,
            rating: 0,
            reviews: 0
          }
        },
        {
          id: 'game2048',
          name: '2048',
          path: '/game2048',
          icon: '🎯',
          color: 'green',
          category: 'puzzle',
          difficulty: 'medium',
          description: 'Combine tiles to reach 2048',
          tags: ['puzzle', 'numbers', 'strategy'],
          estimatedTime: '10-30 min',
          isNew: false,
          isFeatured: false,
          isComingSoon: false,
          minPlayers: 1,
          maxPlayers: 1,
          ageRating: 'all',
          platforms: ['web'],
          controls: ['keyboard', 'touch'],
          features: ['singleplayer', 'scoring', 'undo'],
          lastUpdated: new Date().toISOString(),
          stats: {
            totalPlays: 0,
            averageScore: 0,
            bestScore: 0,
            completionRate: 0,
            averageTime: 0,
            rating: 0,
            reviews: 0
          }
        },
        {
          id: 'pixelartcreator',
          name: 'Pixel Art Creator',
          path: '/pixel-art-creator',
          icon: '🎨',
          color: 'indigo',
          category: 'creative',
          difficulty: 'easy',
          description: 'Create pixel art masterpieces',
          tags: ['creative', 'art', 'pixels'],
          estimatedTime: '15-60 min',
          isNew: true,
          isFeatured: false,
          isComingSoon: false,
          minPlayers: 1,
          maxPlayers: 1,
          ageRating: 'all',
          platforms: ['web'],
          controls: ['mouse', 'touch'],
          features: ['singleplayer', 'save', 'share'],
          lastUpdated: new Date().toISOString(),
          stats: {
            totalPlays: 0,
            averageScore: 0,
            bestScore: 0,
            completionRate: 0,
            averageTime: 0,
            rating: 0,
            reviews: 0
          }
        },
        {
          id: 'musictiles',
          name: 'Music Tiles',
          path: '/musictiles',
          icon: '🎶',
          color: 'yellow',
          category: 'music',
          difficulty: 'medium',
          description: 'Tap the tiles to the rhythm',
          tags: ['music', 'rhythm', 'tiles'],
          estimatedTime: '3-10 min',
          isNew: false,
          isFeatured: false,
          isComingSoon: false,
          minPlayers: 1,
          maxPlayers: 1,
          ageRating: 'all',
          platforms: ['web'],
          controls: ['mouse', 'touch', 'keyboard'],
          features: ['singleplayer', 'songs', 'rhythm'],
          lastUpdated: new Date().toISOString(),
          stats: {
            totalPlays: 0,
            averageScore: 0,
            bestScore: 0,
            completionRate: 0,
            averageTime: 0,
            rating: 0,
            reviews: 0
          }
        }
      ];
    }

    /**
     * Filter games by category
     */
    export function filterByCategory(
      games: GameConfig[], 
      category: GameCategory | null
    ): GameConfig[] {
      if (!category) return games;
      return games.filter(game => game.category === category);
    }

    /**
     * Filter games by difficulty
     */
    export function filterByDifficulty(
      games: GameConfig[], 
      difficulty: GameDifficulty | null
    ): GameConfig[] {
      if (!difficulty) return games;
      return games.filter(game => game.difficulty === difficulty);
    }

    /**
     * Search games by query
     */
    export function searchGames(games: GameConfig[], query: string): GameConfig[] {
      if (!query.trim()) return games;
      
      const searchTerm = query.toLowerCase();
      return games.filter(game =>
        game.name.toLowerCase().includes(searchTerm) ||
        game.description.toLowerCase().includes(searchTerm) ||
        game.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        game.category.toLowerCase().includes(searchTerm)
      );
    }

    /**
     * Sort games
     */
    export function sortGames(
      games: GameConfig[], 
      sortBy: 'name' | 'category' | 'difficulty' | 'lastPlayed' | 'rating',
      order: 'asc' | 'desc' = 'asc'
    ): GameConfig[] {
      const sorted = [...games].sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'category':
            comparison = a.category.localeCompare(b.category);
            break;
          case 'difficulty':
            const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
            comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
            break;
          case 'rating':
            comparison = (a.stats.rating || 0) - (b.stats.rating || 0);
            break;
          case 'lastPlayed':
            const aTime = new Date(a.lastUpdated || 0).getTime();
            const bTime = new Date(b.lastUpdated || 0).getTime();
            comparison = aTime - bTime;
            break;
        }
        
        return order === 'desc' ? -comparison : comparison;
      });
      
      return sorted;
    }

    /**
     * Get game by ID
     */
    export function getGameById(games: GameConfig[], id: string): GameConfig | null {
      return games.find(game => game.id === id) || null;
    }

    /**
     * Get unique categories from games
     */
    export function getCategories(games: GameConfig[]): GameCategory[] {
      return [...new Set(games.map(game => game.category))];
    }

    /**
     * Get unique difficulties from games
     */
    export function getDifficulties(games: GameConfig[]): GameDifficulty[] {
      return [...new Set(games.map(game => game.difficulty))];
    }

    /**
     * Validate game configuration
     */
    export function validateGame(game: Partial<GameConfig>): string[] {
      const errors: string[] = [];

      if (!game.id) errors.push('Game ID is required');
      if (!game.name) errors.push('Game name is required');
      if (!game.path) errors.push('Game path is required');
      if (!game.icon) errors.push('Game icon is required');
      if (!game.category) errors.push('Game category is required');
      if (!game.difficulty) errors.push('Game difficulty is required');

      if (game.minPlayers && game.maxPlayers && game.minPlayers > game.maxPlayers) {
        errors.push('minPlayers cannot be greater than maxPlayers');
      }

      return errors;
    }
  }

  /**
   * Filter Management Utilities
   */
  export namespace Filters {
    
    /**
     * Apply filters to games
     */
    export function applyFilters(games: GameConfig[], filters: DashboardFilters): GameConfig[] {
      let filtered = games;

      // Search filter
      if (filters.search && filters.search.trim()) {
        filtered = Games.searchGames(filtered, filters.search);
      }

      // Category filter
      if (filters.category) {
        filtered = Games.filterByCategory(filtered, filters.category);
      }

      // Difficulty filter
      if (filters.difficulty) {
        filtered = Games.filterByDifficulty(filtered, filters.difficulty);
      }

      // Featured filter
      if (filters.showFeatured) {
        filtered = filtered.filter(game => game.isFeatured);
      }

      // New games filter
      if (filters.showNew) {
        filtered = filtered.filter(game => game.isNew);
      }

      // Hide coming soon
      if (filters.hideComingSoon) {
        filtered = filtered.filter(game => !game.isComingSoon);
      }

      // Minimum rating
      if (filters.minRating !== undefined) {
        filtered = filtered.filter(game => (game.stats.rating || 0) >= filters.minRating!);
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter(game => 
          filters.tags!.some(tag => game.tags.includes(tag))
        );
      }

      return filtered;
    }

    /**
     * Create default filters
     */
    export function createDefaultFilters(): DashboardFilters {
      return {
        search: '',
        category: null,
        difficulty: null,
        showFeatured: false,
        showNew: false,
        hideComingSoon: true,
        minRating: undefined,
        tags: []
      };
    }
  }

  /**
   * Analytics Utilities
   */
  export namespace Analytics {
    
    /**
     * Generate analytics data
     */
    export function generateAnalytics(games: GameConfig[]): DashboardAnalytics {
      const totalGames = games.length;
      const categories = Games.getCategories(games);
      const avgRating = games.reduce((sum, game) => sum + (game.stats.rating || 0), 0) / totalGames;
      
      const gamesByCategory = categories.reduce((acc, category) => {
        acc[category] = games.filter(game => game.category === category).length;
        return acc;
      }, {} as Record<GameCategory, number>);

      const gamesByDifficulty = {
        easy: games.filter(game => game.difficulty === 'easy').length,
        medium: games.filter(game => game.difficulty === 'medium').length,
        hard: games.filter(game => game.difficulty === 'hard').length
      };

      return {
        totalGames,
        totalCategories: categories.length,
        averageRating: avgRating,
        gamesByCategory,
        gamesByDifficulty,
        featuredGames: games.filter(game => game.isFeatured).length,
        newGames: games.filter(game => game.isNew).length,
        comingSoonGames: games.filter(game => game.isComingSoon).length,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Error Handling Utilities
   */
  export namespace Errors {
    
    /**
     * Create dashboard error
     */
    export function createError(
      type: DashboardError['type'],
      message: string,
      code?: string,
      details?: any
    ): DashboardError {
      return {
        type,
        message,
        code: code || 'UNKNOWN_ERROR',
        details
      };
    }

    /**
     * Handle navigation errors
     */
    export function handleNavigationError(error: any, game: GameConfig): DashboardError {
      return createError(
        'GAME_NAVIGATION_FAILED',
        `Failed to navigate to ${game.name}`,
        'NAVIGATION_ERROR',
        { game, error }
      );
    }

    /**
     * Handle loading errors
     */
    export function handleLoadingError(error: any): DashboardError {
      return createError(
        'DASHBOARD_LOAD_FAILED',
        'Failed to load dashboard data',
        'LOADING_ERROR',
        { error }
      );
    }
  }

  /**
   * Storage Utilities
   */
  export namespace Storage {
    
    /**
     * Get recent games from localStorage
     */
    export function getRecentGames(): string[] {
      try {
        return JSON.parse(localStorage.getItem('recentGames') || '[]');
      } catch {
        return [];
      }
    }

    /**
     * Add game to recent games
     */
    export function addRecentGame(gameId: string, maxRecent = 10): void {
      try {
        const recent = getRecentGames();
        const updated = [gameId, ...recent.filter(id => id !== gameId)].slice(0, maxRecent);
        localStorage.setItem('recentGames', JSON.stringify(updated));
      } catch (error) {
        console.warn('Failed to update recent games:', error);
      }
    }

    /**
     * Get user preferences
     */
    export function getUserPreferences(): Partial<DashboardConfig> {
      try {
        const prefs = localStorage.getItem('dashboardPrefs');
        return prefs ? JSON.parse(prefs) : {};
      } catch {
        return {};
      }
    }

    /**
     * Save user preferences
     */
    export function saveUserPreferences(prefs: Partial<DashboardConfig>): void {
      try {
        localStorage.setItem('dashboardPrefs', JSON.stringify(prefs));
      } catch (error) {
        console.warn('Failed to save preferences:', error);
      }
    }
  }

  /**
   * Utility Functions
   */
  export namespace Utils {
    
    /**
     * Debounce function
     */
    export function debounce<T extends (...args: any[]) => any>(
      func: T,
      delay: number
    ): (...args: Parameters<T>) => void {
      let timeoutId: NodeJS.Timeout;
      return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
      };
    }

    /**
     * Throttle function
     */
    export function throttle<T extends (...args: any[]) => any>(
      func: T,
      limit: number
    ): (...args: Parameters<T>) => void {
      let lastFunc: NodeJS.Timeout;
      let lastRan: number;
      return (...args: Parameters<T>) => {
        if (!lastRan) {
          func(...args);
          lastRan = Date.now();
        } else {
          clearTimeout(lastFunc);
          lastFunc = setTimeout(() => {
            if (Date.now() - lastRan >= limit) {
              func(...args);
              lastRan = Date.now();
            }
          }, limit - (Date.now() - lastRan));
        }
      };
    }

    /**
     * Format duration
     */
    export function formatDuration(minutes: number): string {
      if (minutes < 60) {
        return `${minutes} min`;
      }
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }

    /**
     * Calculate completion percentage
     */
    export function calculateCompletionRate(completed: number, total: number): number {
      return total > 0 ? Math.round((completed / total) * 100) : 0;
    }

    /**
     * Generate color scheme
     */
    export function generateColorScheme(color: GameColor): Record<string, string> {
      const colorMap: Record<GameColor, Record<string, string>> = {
        blue: { primary: '#3B82F6', secondary: '#1E40AF', light: '#DBEAFE' },
        purple: { primary: '#8B5CF6', secondary: '#5B21B6', light: '#EDE9FE' },
        green: { primary: '#10B981', secondary: '#047857', light: '#D1FAE5' },
        indigo: { primary: '#6366F1', secondary: '#3730A3', light: '#E0E7FF' },
        yellow: { primary: '#F59E0B', secondary: '#B45309', light: '#FEF3C7' },
        pink: { primary: '#EC4899', secondary: '#BE185D', light: '#FCE7F3' },
        red: { primary: '#EF4444', secondary: '#B91C1C', light: '#FEE2E2' },
        orange: { primary: '#F97316', secondary: '#C2410C', light: '#FFEDD5' },
        brown: { primary: '#A16207', secondary: '#78350F', light: '#FEF3C7' },
        cyan: { primary: '#06B6D4', secondary: '#0E7490', light: '#CFFAFE' },
        teal: { primary: '#14B8A6', secondary: '#0F766E', light: '#CCFBF1' },
        violet: { primary: '#7C3AED', secondary: '#5B21B6', light: '#EDE9FE' },
        lime: { primary: '#84CC16', secondary: '#4D7C0F', light: '#ECFCCB' },
        amber: { primary: '#F59E0B', secondary: '#B45309', light: '#FEF3C7' },
        rose: { primary: '#F43F5E', secondary: '#BE123C', light: '#FFE4E6' },
        emerald: { primary: '#10B981', secondary: '#047857', light: '#D1FAE5' },
        slate: { primary: '#64748B', secondary: '#334155', light: '#F1F5F9' },
        gray: { primary: '#6B7280', secondary: '#374151', light: '#F9FAFB' }
      };

      return colorMap[color] || colorMap.blue;
    }
  }
}