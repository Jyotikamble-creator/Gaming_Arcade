// Enhanced Dashboard page client implementation for GameArchade

"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Components
import Sidebar from "@/components/gamehub/Sidebar";

// Types
import type {
  DashboardPageProps,
  DashboardConfig,
  GameConfig,
  DashboardState,
  DashboardFilters,
  DashboardError,
  GameCategory,
  DashboardLayout
} from "@/types/dashboard/dashboard";

// Utilities
import { DashboardHelpers } from "@/utility/dashboard/helpers";

// Hooks
import { useAuth } from "@/hooks/auth/useAuth";

// Logger
import { Logger } from "@/lib/logger/client";

/**
 * Enhanced Dashboard Page Client
 */
export class DashboardPageClient {
  private static instance: DashboardPageClient | null = null;
  private logger: Logger;
  private config: DashboardConfig;

  constructor(config: Partial<DashboardConfig> = {}) {
    this.logger = new Logger({ tag: 'DASHBOARD_PAGE' });
    this.config = DashboardHelpers.Config.createDefaultConfig(config);
  }

  /**
   * Singleton instance
   */
  static getInstance(config?: Partial<DashboardConfig>): DashboardPageClient {
    if (!DashboardPageClient.instance) {
      DashboardPageClient.instance = new DashboardPageClient(config);
    }
    return DashboardPageClient.instance;
  }

  /**
   * Get default configuration
   */
  getDefaultConfig(): DashboardConfig {
    return this.config;
  }

  /**
   * Navigate to game
   */
  async navigateToGame(game: GameConfig, router: any): Promise<void> {
    this.logger.info('Navigating to game', { gameId: game.id, gameName: game.name });

    try {
      // Track game selection analytics
      this.trackGameSelection(game);

      // Update last played
      this.updateLastPlayed(game.id);

      // Navigate using Next.js router
      await router.push(game.path);
    } catch (error) {
      this.logger.error('Game navigation failed', { error, game });
      throw new Error(`Failed to navigate to ${game.name}`);
    }
  }

  /**
   * Track game selection for analytics
   */
  private trackGameSelection(game: GameConfig): void {
    // This would integrate with your analytics service
    this.logger.debug('Game selected', {
      gameId: game.id,
      category: game.category,
      difficulty: game.difficulty
    });
  }

  /**
   * Update last played timestamp
   */
  private updateLastPlayed(gameId: string): void {
    try {
      const recentGames = JSON.parse(localStorage.getItem('recentGames') || '[]');
      const updatedGames = [
        gameId,
        ...recentGames.filter((id: string) => id !== gameId)
      ].slice(0, 10); // Keep last 10 games

      localStorage.setItem('recentGames', JSON.stringify(updatedGames));
      localStorage.setItem(`lastPlayed_${gameId}`, new Date().toISOString());
    } catch (error) {
      this.logger.warn('Failed to update last played', { error, gameId });
    }
  }
}

/**
 * Game Card Component
 */
function GameCard({ 
  game, 
  onSelect, 
  className = "",
  showStats = true 
}: {
  game: GameConfig;
  onSelect: (game: GameConfig) => void;
  className?: string;
  showStats?: boolean;
}) {
  const handleClick = useCallback(() => {
    onSelect(game);
  }, [game, onSelect]);

  const colorClasses = {
    blue: 'group-hover:text-blue-400',
    purple: 'group-hover:text-purple-400',
    green: 'group-hover:text-green-400',
    indigo: 'group-hover:text-indigo-400',
    yellow: 'group-hover:text-yellow-400',
    pink: 'group-hover:text-pink-400',
    red: 'group-hover:text-red-400',
    orange: 'group-hover:text-orange-400',
    brown: 'group-hover:text-amber-600',
    cyan: 'group-hover:text-cyan-400',
    teal: 'group-hover:text-teal-400',
    violet: 'group-hover:text-violet-400',
    lime: 'group-hover:text-lime-400',
    amber: 'group-hover:text-amber-400',
    rose: 'group-hover:text-rose-400',
    emerald: 'group-hover:text-emerald-400',
    slate: 'group-hover:text-slate-400',
    gray: 'group-hover:text-gray-400'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <div
        onClick={handleClick}
        className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-700 group cursor-pointer relative overflow-hidden"
      >
        {/* New/Featured badges */}
        {game.isNew && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            NEW
          </div>
        )}
        {game.isFeatured && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full">
            ⭐ FEATURED
          </div>
        )}
        {game.isComingSoon && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-medium">Coming Soon</span>
          </div>
        )}

        <div className="text-center">
          {/* Game Icon */}
          <motion.div 
            className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300"
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
          >
            {game.icon}
          </motion.div>

          {/* Game Name */}
          <h3 className={`text-lg font-semibold text-white transition-colors ${colorClasses[game.color]}`}>
            {game.name}
          </h3>

          {/* Game Description */}
          {game.description && (
            <p className="text-sm text-gray-400 mt-2 line-clamp-2">
              {game.description}
            </p>
          )}

          {/* Game Stats */}
          {showStats && (
            <div className="mt-3 flex justify-between text-xs text-gray-500">
              <span>{game.category}</span>
              {game.difficulty && (
                <span className="capitalize">{game.difficulty}</span>
              )}
            </div>
          )}

          {/* Estimated Time */}
          {game.estimatedTime && (
            <div className="mt-2 text-xs text-gray-400">
              ⏱️ {game.estimatedTime}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Dashboard Header Component
 */
function DashboardHeader({ 
  user, 
  onSearch, 
  onFilterChange 
}: { 
  user: any;
  onSearch: (query: string) => void;
  onFilterChange: (filters: Partial<DashboardFilters>) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  }, [onSearch]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.displayName || user?.username || 'Gamer'}! 🎮
          </h1>
          <p className="text-gray-400">
            Choose your next adventure from {DashboardHelpers.Games.getDefaultGames().length} amazing games
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full lg:w-80 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute right-3 top-2.5 text-gray-400">
            🔍
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Category Filter Component
 */
function CategoryFilter({ 
  categories,
  selectedCategory,
  onCategorySelect 
}: {
  categories: GameCategory[];
  selectedCategory: GameCategory | null;
  onCategorySelect: (category: GameCategory | null) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mb-6"
    >
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategorySelect(null)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedCategory === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          All Games
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategorySelect(category)}
            className={`px-4 py-2 rounded-lg transition-colors capitalize ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/**
 * Main Dashboard Component
 */
export function GameDashboardPage({
  config: configOverride,
  customGames,
  onGameSelect: externalGameSelect,
  className,
  children
}: DashboardPageProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const client = useMemo(() => DashboardPageClient.getInstance(configOverride), [configOverride]);
  
  // State management
  const [games] = useState<GameConfig[]>(
    customGames || DashboardHelpers.Games.getDefaultGames()
  );
  const [filteredGames, setFilteredGames] = useState<GameConfig[]>(games);
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<DashboardError | null>(null);

  // Configuration
  const config = useMemo(() => 
    client.getDefaultConfig(), 
    [client]
  );

  // Get unique categories
  const categories = useMemo(() => 
    [...new Set(games.map(game => game.category))],
    [games]
  );

  // Handle game selection
  const handleGameSelect = useCallback(async (game: GameConfig) => {
    if (game.isComingSoon) return;

    try {
      setIsLoading(true);
      await client.navigateToGame(game, router);
      externalGameSelect?.(game);
    } catch (error) {
      setError({
        type: 'GAME_NAVIGATION_FAILED',
        message: `Failed to open ${game.name}`,
        code: 'NAVIGATION_ERROR',
        details: { game, error }
      });
    } finally {
      setIsLoading(false);
    }
  }, [client, router, externalGameSelect]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Handle category filter
  const handleCategorySelect = useCallback((category: GameCategory | null) => {
    setSelectedCategory(category);
  }, []);

  // Filter games based on search and category
  useEffect(() => {
    let filtered = games;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(game => 
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(game => game.category === selectedCategory);
    }

    setFilteredGames(filtered);
  }, [games, searchQuery, selectedCategory]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, authLoading, router]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Custom children override
  if (children) {
    return (
      <div className={`flex h-screen text-light-text ${className || ''}`}>
        <Sidebar />
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen text-light-text ${className || ''}`}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <DashboardHeader
            user={user}
            onSearch={handleSearch}
            onFilterChange={() => {}}
          />

          {/* Category Filter */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
              >
                <p className="text-red-400">{error.message}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-red-300 hover:text-red-100 text-sm mt-2"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Games Grid */}
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="wait">
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onSelect={handleGameSelect}
                  showStats={true}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* No Results */}
          {filteredGames.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold text-white mb-2">No games found</h3>
              <p className="text-gray-400">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </motion.div>
          )}

          {/* Loading Overlay */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              >
                <div className="bg-gray-800 p-6 rounded-lg flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span className="text-white">Loading game...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/**
 * Legacy Dashboard component for backward compatibility
 */
export default function Dashboard() {
  return <GameDashboardPage />;
}

/**
 * Export client class and components
 */
export { DashboardPageClient, GameCard };