import React from 'react';
import { motion } from 'framer-motion';

interface EmojiGuessHeaderProps {
  streak: number;
}

export default function EmojiGuessHeader({ streak }: EmojiGuessHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-8"
    >
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="text-4xl">🎯</div>
        <h1 className="text-4xl font-bold text-white">Emoji Guess</h1>
        <div className="text-4xl">🎯</div>
      </div>
      
      {streak > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/50 rounded-full px-4 py-2"
        >
          <span className="text-orange-300">🔥</span>
          <span className="text-orange-200 font-medium">
            {streak} Win Streak!
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}