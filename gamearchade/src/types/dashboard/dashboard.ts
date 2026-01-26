// Dashboard page TypeScript interfaces and types

import { ReactNode } from "react";

/**
 * Game configuration and data types
 */
export interface GameConfig {
  id: string;
  name: string;
  path: string;
  icon: string;
  color: GameColor;
  category: GameCategory;
  difficulty: GameDifficulty;
  description: string;
  tags: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  isComingSoon?: boolean;
  minPlayers?: number;
  maxPlayers?: number;
  estimatedTime?: string; // e.g., "5-10 min"
  lastPlayed?: Date;
  personalBest?: number;
  totalPlays?: number;
}

/**
 * Game colors for theming
 */
export type GameColor = 
  | 'blue' | 'purple' | 'green' | 'indigo' | 'yellow' | 'pink' 
  | 'red' | 'orange' | 'brown' | 'cyan' | 'teal' | 'violet' 
  | 'lime' | 'amber' | 'rose' | 'emerald' | 'slate' | 'gray';

/**
 * Game categories
 */
export type GameCategory = 
  | 'word' | 'puzzle' | 'math' | 'memory' | 'action' | 'strategy' 
  | 'trivia' | 'skill' | 'arcade' | 'creative' | 'brain' | 'typing';

/**
 * Game difficulty levels
 */
export type GameDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

/**
 * Dashboard configuration
 */
export interface DashboardConfig {
  layout: DashboardLayout;
  itemsPerPage: number;
  showCategories: boolean;
  showFilters: boolean;
  showSearch: boolean;
  showStats: boolean;
  showRecentlyPlayed: boolean;
  showFavorites: boolean;
  enableAnimations: boolean;
  gridColumns: {
    mobile: number;
    tablet: number;
    desktop: number;
    large: number;
  };
}

/**
 * Dashboard layout types
 */
export type DashboardLayout = 'grid' | 'list' | 'masonry' | 'carousel';

/**
 * Dashboard props
 */
export interface DashboardPageProps {
  config?: Partial<DashboardConfig>;
  customGames?: GameConfig[];
  onGameSelect?: (game: GameConfig) => void;
  className?: string;
  children?: ReactNode;
}

/**
 * Dashboard component props
 */
export interface DashboardComponentProps {
  games: GameConfig[];
  config: DashboardConfig;
  onGameSelect: (game: GameConfig) => void;
  isLoading?: boolean;
  error?: DashboardError | null;
}

/**
 * Game card props
 */
export interface GameCardProps {
  game: GameConfig;
  onSelect: (game: GameConfig) => void;
  className?: string;
  showStats?: boolean;
  isLoading?: boolean;
}

/**
 * Dashboard filters
 */
export interface DashboardFilters {
  category?: GameCategory[];
  difficulty?: GameDifficulty[];
  search?: string;
  isNew?: boolean;
  isFeatured?: boolean;
  recentlyPlayed?: boolean;
  favorites?: boolean;
}

/**
 * Dashboard sorting options
 */
export interface DashboardSorting {
  field: DashboardSortField;
  direction: 'asc' | 'desc';
}

export type DashboardSortField = 
  | 'name' | 'category' | 'difficulty' | 'lastPlayed' 
  | 'totalPlays' | 'personalBest' | 'dateAdded';

/**
 * Dashboard state
 */
export interface DashboardState {
  games: GameConfig[];
  filteredGames: GameConfig[];
  filters: DashboardFilters;
  sorting: DashboardSorting;
  searchQuery: string;
  selectedCategory: GameCategory | null;
  isLoading: boolean;
  error: DashboardError | null;
  currentPage: number;
  totalPages: number;
}

/**
 * Dashboard error types
 */
export interface DashboardError {
  type: DashboardErrorType;
  message: string;
  code: string;
  details?: Record<string, any>;
}

export type DashboardErrorType = 
  | 'LOAD_GAMES_FAILED'
  | 'GAME_NAVIGATION_FAILED'
  | 'USER_DATA_ERROR'
  | 'NETWORK_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'CONFIGURATION_ERROR';

/**
 * User stats for dashboard
 */
export interface DashboardUserStats {
  totalGamesPlayed: number;
  totalTimeSpent: number; // in minutes
  favoriteCategory: GameCategory;
  currentStreak: number;
  bestStreak: number;
  achievementsUnlocked: number;
  level: number;
  experience: number;
  recentlyPlayed: GameConfig[];
  favoriteGames: GameConfig[];
}

/**
 * Dashboard analytics
 */
export interface DashboardAnalytics {
  popularGames: Array<{
    game: GameConfig;
    playCount: number;
    averageTime: number;
  }>;
  categoryStats: Record<GameCategory, {
    gamesCount: number;
    totalPlays: number;
    averageRating: number;
  }>;
  userEngagement: {
    dailyActiveUsers: number;
    averageSessionTime: number;
    returnRate: number;
  };
  gamePerformance: Record<string, {
    gameId: string;
    loadTime: number;
    errorRate: number;
    completionRate: number;
  }>;
}

/**
 * Dashboard hooks return types
 */
export interface UseDashboardReturn {
  state: DashboardState;
  actions: {
    loadGames: () => Promise<void>;
    filterGames: (filters: Partial<DashboardFilters>) => void;
    sortGames: (sorting: DashboardSorting) => void;
    searchGames: (query: string) => void;
    selectGame: (game: GameConfig) => void;
    toggleFavorite: (gameId: string) => void;
    updateGameStats: (gameId: string, stats: Partial<GameConfig>) => void;
    resetFilters: () => void;
  };
  computed: {
    hasFilters: boolean;
    isEmpty: boolean;
    hasMore: boolean;
    categories: GameCategory[];
    featuredGames: GameConfig[];
    newGames: GameConfig[];
  };
}

/**
 * Game navigation types
 */
export interface GameNavigationConfig {
  enablePreloading: boolean;
  enableAnalytics: boolean;
  trackPlayTime: boolean;
  saveProgress: boolean;
  showLoadingScreen: boolean;
}

/**
 * Dashboard theme customization
 */
export interface DashboardTheme {
  cardStyle: 'modern' | 'classic' | 'minimal' | 'gaming';
  colorScheme: 'auto' | 'light' | 'dark' | 'gaming';
  animations: 'none' | 'reduced' | 'full';
  iconStyle: 'emoji' | 'svg' | 'custom';
  spacing: 'compact' | 'comfortable' | 'spacious';
}

/**
 * Dashboard responsive breakpoints
 */
export interface DashboardBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  large: number;
  xlarge: number;
}

/**
 * Dashboard accessibility options
 */
export interface DashboardAccessibility {
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
  enableLargeText: boolean;
  enableScreenReader: boolean;
  keyboardNavigation: boolean;
}

/**
 * Next.js specific types
 */
export interface DashboardPageParams {
  category?: string[];
}

export interface DashboardPageSearchParams {
  search?: string;
  category?: string;
  difficulty?: string;
  sort?: string;
  page?: string;
  view?: DashboardLayout;
}

/**
 * Export all types
 */
export type {
  // Core interfaces
  GameConfig,
  DashboardConfig,
  DashboardPageProps,
  DashboardComponentProps,
  GameCardProps,
  
  // Filter and sorting
  DashboardFilters,
  DashboardSorting,
  DashboardSortField,
  
  // State management
  DashboardState,
  DashboardError,
  DashboardErrorType,
  
  // User data
  DashboardUserStats,
  DashboardAnalytics,
  
  // Hooks
  UseDashboardReturn,
  
  // Configuration
  GameNavigationConfig,
  DashboardTheme,
  DashboardBreakpoints,
  DashboardAccessibility,
  
  // Next.js specific
  DashboardPageParams,
  DashboardPageSearchParams,
  
  // Enums
  GameColor,
  GameCategory,
  GameDifficulty,
  DashboardLayout
};