"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
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

import { DashboardHelpers } from '@/utility/dashboard/helpers';

const helperGames = DashboardHelpers?.Games?.getDefaultGames?.() || [];

const defaultGames: GameConfig[] = helperGames.map(g => ({
  id: g.id || g.name?.toLowerCase().replace(/\s+/g, '-'),
  title: g.name || g.title || g.id,
  description: g.description || '',
  category: g.category || 'uncategorized',
  difficulty: g.difficulty || 'medium',
  estimatedTime: g.estimatedTime || '5-10 min',
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
      className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/20 hover:border-white/40 transition-all duration-300"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            {game.isNew && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">NEW</span>
            )}
            {game.isFeatured && (
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">FEATURED</span>
            )}
            {game.isComingSoon && (
              <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">COMING SOON</span>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-white/60 uppercase tracking-wide">{game.category}</div>
            <div className="text-xs text-white/60">{game.difficulty}</div>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">{game.title}</h3>
        <p className="text-white/70 text-sm mb-4 flex-grow">{game.description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-xs">{game.estimatedTime}</span>
          <Link
            href={game.path}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
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
  
  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredGames(games);
    } else {
      setFilteredGames(games.filter(game => game.category === selectedCategory));
    }
  }, [selectedCategory, games]);

  const categories = ["all", ...Array.from(new Set(games.map(game => game.category)))];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 ${className}`}>
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome{user?.name ? ` back, ${user.name}` : " to GameArchade"}
            </h1>
            <p className="text-white/70 text-lg">
              Choose from our collection of engaging games
            </p>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                    selectedCategory === category
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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