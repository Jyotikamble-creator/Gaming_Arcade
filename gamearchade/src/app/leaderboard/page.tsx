'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedBackground from '@/components/AnimatedBackground';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import { GAME_NAMES, GAME_ICONS } from '@/utility/progress';

type GameType = keyof typeof GAME_NAMES;

const GAMES: GameType[] = [
  'word-guess',
  'word-scramble',
  'word-builder',
  'hangman',
  'brain-teaser',
  'coding-puzzle',
  'sudoku',
  'quiz',
  'emoji-guess',
  'math-quiz',
  'speed-math',
  'number-maze',
  'memory-card',
  'simon-says',
  'reaction-time',
  'typing-test',
  'whack-a-mole',
  'sliding-puzzle',
  'tower-stacker',
  'tic-tac-toe'
];

export default function LeaderboardPage() {
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | 'month' | 'week'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Set first game as default
    if (!selectedGame && GAMES.length > 0) {
      setSelectedGame(GAMES[0]);
    }
  }, [selectedGame]);

  if (!mounted) return null;

  const currentGame = selectedGame || GAMES[0];
  const gameIcon = GAME_ICONS[currentGame] || '🎮';
  const gameName = GAME_NAMES[currentGame] || 'Game';

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-linear-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            🏆 Global Leaderboards
          </h1>
          <p className="text-gray-300 text-lg">
            Compete with players worldwide across all games
          </p>
        </motion.div>

        {/* Time Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center gap-3 mb-8"
        >
          {(['all', 'month', 'week'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                timeFilter === filter
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              {filter === 'all' ? 'All Time' : filter === 'month' ? 'This Month' : 'This Week'}
            </button>
          ))}
        </motion.div>

        {/* Game Selector Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Select a Game</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-48 overflow-y-auto pb-4 px-2">
            {GAMES.map((game, index) => (
              <motion.button
                key={game}
                onClick={() => setSelectedGame(game)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  selectedGame === game
                    ? 'bg-purple-600 text-white shadow-lg ring-2 ring-purple-400'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }`}
                title={GAME_NAMES[game]}
              >
                <div className="text-xl mb-1">{GAME_ICONS[game]}</div>
                <div className="truncate text-xs">{GAME_NAMES[game]?.split(' ')[0]}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Current Game Leaderboard */}
        <motion.div
          key={currentGame}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-800/40 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 shadow-2xl"
        >
          {/* Game Title */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl">{gameIcon}</span>
              <div>
                <h3 className="text-3xl font-bold text-white">{gameName}</h3>
                <p className="text-gray-400 text-sm">Top scores for {gameName}</p>
              </div>
            </div>
          </div>

          {/* Leaderboard Component */}
          <Leaderboard 
            gameType={currentGame} 
            limit={20}
          />
        </motion.div>

        {/* Global Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid md:grid-cols-3 gap-6"
        >
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 rounded-xl p-6 border border-blue-500/30 backdrop-blur-lg">
            <div className="text-blue-400 text-sm font-semibold mb-2">Total Players</div>
            <div className="text-4xl font-bold text-white">12,458</div>
            <div className="text-blue-300 text-xs mt-2">Active this month</div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 rounded-xl p-6 border border-purple-500/30 backdrop-blur-lg">
            <div className="text-purple-400 text-sm font-semibold mb-2">Games Available</div>
            <div className="text-4xl font-bold text-white">{GAMES.length}</div>
            <div className="text-purple-300 text-xs mt-2">Compete across all genres</div>
          </div>

          <div className="bg-gradient-to-br from-pink-600/20 to-pink-900/20 rounded-xl p-6 border border-pink-500/30 backdrop-blur-lg">
            <div className="text-pink-400 text-sm font-semibold mb-2">Total Scores</div>
            <div className="text-4xl font-bold text-white">1.2M+</div>
            <div className="text-pink-300 text-xs mt-2">Submitted scores</div>
          </div>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-amber-900/20 border border-amber-500/30 rounded-xl p-6 backdrop-blur-lg"
        >
          <h4 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
            💡 Tips to climb the leaderboard
          </h4>
          <ul className="text-amber-200/80 text-sm space-y-2">
            <li>✓ Play regularly to improve your skills and consistency</li>
            <li>✓ Challenge yourself with higher difficulty levels for bigger score multipliers</li>
            <li>✓ Focus on one game to master it and dominate that leaderboard</li>
            <li>✓ Use hints wisely - they reduce your score but can help you win</li>
            <li>✓ Join the community and compete with friends</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
