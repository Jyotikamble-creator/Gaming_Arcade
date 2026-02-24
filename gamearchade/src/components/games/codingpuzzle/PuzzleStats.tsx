"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { X, Trophy, Clock, Target, Code } from 'lucide-react';

interface PuzzleStatsProps {
  onClose: () => void;
}

export default function PuzzleStats({ onClose }: PuzzleStatsProps) {
  // Placeholder stats - in a real app, these would come from props or context
  const stats = {
    totalPuzzles: 45,
    totalScore: 28500,
    averageTime: 420, // seconds
    bestScore: 1850,
    puzzlesSolved: 32,
    currentStreak: 5
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 h-full w-80 bg-card-bg border-l border-gray-700 p-6 overflow-y-auto z-40"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-light-text text-xl font-bold">Puzzle Statistics</h2>
        <button
          onClick={onClose}
          className="text-subtle-text hover:text-light-text transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="bg-dark-bg p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5 text-primary-blue" />
            <span className="text-light-text font-medium">Total Score</span>
          </div>
          <p className="text-2xl font-bold text-primary-blue">{stats.totalScore.toLocaleString()}</p>
        </div>

        <div className="bg-dark-bg p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Code className="w-5 h-5 text-green-400" />
            <span className="text-light-text font-medium">Puzzles Solved</span>
          </div>
          <p className="text-2xl font-bold text-light-text">{stats.puzzlesSolved} / {stats.totalPuzzles}</p>
        </div>

        <div className="bg-dark-bg p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-orange-400" />
            <span className="text-light-text font-medium">Average Time</span>
          </div>
          <p className="text-2xl font-bold text-light-text">{formatTime(stats.averageTime)}</p>
        </div>

        <div className="bg-dark-bg p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-light-text font-medium">Best Score</span>
          </div>
          <p className="text-2xl font-bold text-yellow-400">{stats.bestScore.toLocaleString()}</p>
        </div>

        <div className="bg-dark-bg p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-blue-400" />
            <span className="text-light-text font-medium">Current Streak</span>
          </div>
          <p className="text-2xl font-bold text-light-text">{stats.currentStreak}</p>
        </div>
      </div>
    </motion.div>
  );
}