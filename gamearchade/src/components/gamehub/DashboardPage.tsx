"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardHelpers } from '@/utility/dashboard/helpers';
import Link from "next/link";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

interface GameConfig {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedTime: string;
  image: string;
  path: string;
  isNew?: boolean;
  isFeatured?: boolean;
  isComingSoon?: boolean;
}

interface DashboardPageProps {
  games?: GameConfig[];
  user?: any;
  className?: string;
}

const helperGames = DashboardHelpers?.Games?.getDefaultGames?.() || [];

const defaultGames: GameConfig[] = helperGames.map(g => ({
  id: g.id || g.name?.toLowerCase().replace(/\s+/g, '-'),
  title: g.name || g.id,
  description: g.description || '',
  category: g.category || 'uncategorized',
  difficulty: (g as any).difficulty || 'medium',
  estimatedTime: (g as any).estimatedTime || '5-10 min',
  image: `/images/${(g.id || g.name || 'game').toString().toLowerCase().replace(/[^a-z0-9-]/g, '-')}.jpg`,
  // Normalize path so it points at the app pages route used in this project
  path: (g.path && g.path.startsWith('/pages')) ? g.path : `/pages${g.path.startsWith('/') ? g.path : '/' + (g.path || g.id)}`,
  isNew: !!g.isNew,
  isFeatured: !!g.isFeatured,
  isComingSoon: !!g.isComingSoon
}));

function GameCard({ game }: { game: GameConfig }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="min-w-0 rounded-lg border border-white/20 bg-white/10 p-4 shadow-lg backdrop-blur-lg transition-all duration-300 hover:border-white/40 sm:rounded-xl sm:p-5 lg:p-6"
    >
      <div className="flex h-full min-w-0 flex-col">
        <div className="mb-3 flex items-start justify-between sm:mb-4">
          {/* <div className="flex items-center space-x-2">
            {game.isNew && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">NEW</span>
            )}
            {game.isFeatured && (
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">FEATURED</span>
            )}
            {game.isComingSoon && (
              <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">COMING SOON</span>
            )}
          </div> */}
          <div className="max-w-[55%] text-right">
            <div className="text-xs uppercase tracking-wide text-white/60 wrap-break-word">{game.category}</div>
            <div className="text-xs text-white/60">{game.difficulty}</div>
          </div>
        </div>

        <h3 className="mb-2 text-lg font-bold text-white wrap-break-word sm:text-xl">{game.title}</h3>
        <p className="mb-4 grow text-xs text-white/70 wrap-break-word sm:text-sm">{game.description}</p>

        <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <span className="text-xs text-white/60">{game.estimatedTime || '5-10 min'}</span>
          <Link
            href={game.path}
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 sm:w-auto"
          >
            Play Now
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage({
  games = defaultGames,
  user,
  className = ""
}: DashboardPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filteredGames, setFilteredGames] = useState<GameConfig[]>(games);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredGames(games);
    } else {
      setFilteredGames(games.filter(game => game.category === selectedCategory));
    }
  }, [selectedCategory, games]);

  const categories = ["all", ...Array.from(new Set(games.map(game => game.category)))];

  return (
    <div className={`min-h-screen overflow-x-hidden bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 ${className}`}>
      <div className="flex min-h-screen w-full">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex items-center justify-between md:mb-8">
            <button
              type="button"
              aria-label="Open navigation"
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20 md:hidden"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
              Menu
            </button>
          </div>

          <div className="mb-6 md:mb-8">
            <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
              Welcome{user?.name ? ` back, ${user.name}😊` : " to GameArchade"}
            </h1>
            <p className="text-sm text-white/70 sm:text-base lg:text-lg">
              Choose Games from our collection of engaging games
            </p>
          </div>

          {/* Category Filter */}
          <div className="mb-6 md:mb-8">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors duration-200 sm:px-4 sm:text-sm ${selectedCategory === category
                      ? "bg-blue-600 text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                    }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Games Grid */}
          <motion.div
            layout
            className="grid w-full grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 sm:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] sm:gap-5 lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] lg:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredGames.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-white/60 text-lg">No games found in this category.</p>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}