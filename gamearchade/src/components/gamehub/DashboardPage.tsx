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

const defaultGames: GameConfig[] = [
  {
    id: "word-guess",
    title: "Word Guess",
    description: "Test your vocabulary with our word guessing game",
    category: "word",
    difficulty: "medium",
    estimatedTime: "5-10 min",
    image: "/images/word-guess.jpg",
    path: "/pages/wordguess",
    isFeatured: true
  },
  {
    id: "brain-teaser",
    title: "Brain Teaser",
    description: "Challenge your mind with puzzles and logic problems",
    category: "puzzle",
    difficulty: "hard",
    estimatedTime: "10-15 min",
    image: "/images/brain-teaser.jpg",
    path: "/pages/brainteaser",
    isNew: true
  },
  {
    id: "coding-puzzle",
    title: "Coding Puzzle",
    description: "Solve programming challenges and improve your coding skills",
    category: "coding",
    difficulty: "hard",
    estimatedTime: "15-30 min",
    image: "/images/coding-puzzle.jpg",
    path: "/pages/codingpuzzle"
  },
  {
    id: "memory-card",
    title: "Memory Card",
    description: "Test your memory with this classic card matching game",
    category: "memory",
    difficulty: "easy",
    estimatedTime: "3-5 min",
    image: "/images/memory-card.jpg",
    path: "/pages/memorycard"
  },
  {
    id: "hangman",
    title: "Hangman",
    description: "Classic word guessing game - guess the word letter by letter",
    category: "word",
    difficulty: "easy",
    estimatedTime: "3-7 min",
    image: "/images/hangman.jpg",
    path: "/pages/hangman"
  },
  {
    id: "whack-mole",
    title: "Whack-a-Mole",
    description: "Test your reflexes in this fast-paced action game",
    category: "action",
    difficulty: "medium",
    estimatedTime: "2-5 min",
    image: "/images/whack-mole.jpg",
    path: "/pages/whackmole"
  },
  {
    id: "2048",
    title: "2048",
    description: "Combine tiles to reach the 2048 tile in this addictive puzzle game",
    category: "puzzle",
    difficulty: "medium",
    estimatedTime: "10-20 min",
    image: "/images/2048.jpg",
    path: "/pages/game2048"
  },
  {
    id: "math-quiz",
    title: "Math Quiz",
    description: "Test your math skills with quick calculations",
    category: "educational",
    difficulty: "easy",
    estimatedTime: "5-10 min",
    image: "/images/math-quiz.jpg",
    path: "/pages/mathquiz"
  },
  {
    id: "word-builder",
    title: "Word Builder",
    description: "Build words from given letters",
    category: "word",
    difficulty: "medium",
    estimatedTime: "5-15 min",
    image: "/images/word-builder.jpg",
    path: "/pages/wordbuilder"
  },
  {
    id: "word-scramble",
    title: "Word Scramble",
    description: "Unscramble letters to form words",
    category: "word", 
    difficulty: "medium",
    estimatedTime: "3-8 min",
    image: "/images/word-scramble.jpg",
    path: "/pages/wordscramble"
  },
  {
    id: "emoji-guess",
    title: "Emoji Guess",
    description: "Guess the phrase or word from emoji combinations",
    category: "puzzle",
    difficulty: "easy",
    estimatedTime: "2-5 min",
    image: "/images/emoji-guess.jpg",
    path: "/pages/emoji"
  },
  {
    id: "number-maze",
    title: "Number Maze",
    description: "Navigate through numbers to reach your target",
    category: "puzzle",
    difficulty: "hard",
    estimatedTime: "5-12 min",
    image: "/images/number-maze.jpg",
    path: "/pages/numbermaze"
  }
];

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