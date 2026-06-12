import React from 'react';
import { motion } from 'framer-motion';

interface EmojiDisplayProps {
  emojis: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function EmojiDisplay({ emojis, category, difficulty }: EmojiDisplayProps) {
  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
    >
      <div className="mb-4">
        <div className="text-6xl mb-4 font-emoji">
          {emojis}
        </div>
        <div className="space-y-2">
          <div className={`text-sm font-semibold uppercase tracking-wide ${getDifficultyColor()}`}>
            {difficulty}
          </div>
          <div className="text-white/70 text-sm capitalize">
            Category: {category}
          </div>
        </div>
      </div>
      <p className="text-white/80 text-lg">
        What do these emojis represent?
      </p>
    </motion.div>
  );
}