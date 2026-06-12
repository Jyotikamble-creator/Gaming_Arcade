'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface HangmanStatsProps {
  score: number;
  wordsCompleted: number;
  wrongGuesses: number;
  maxGuesses: number;
  category: string | null;
}

const HangmanStats: React.FC<HangmanStatsProps> = ({ 
  score, 
  wordsCompleted, 
  wrongGuesses, 
  maxGuesses, 
  category 
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <motion.div 
        className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <div className="text-2xl font-bold text-white">{score}</div>
        <div className="text-white/70 text-sm">Score</div>
      </motion.div>
      
      <motion.div 
        className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <div className="text-2xl font-bold text-white">{wordsCompleted}</div>
        <div className="text-white/70 text-sm">Words Completed</div>
      </motion.div>
      
      <motion.div 
        className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <div className="text-2xl font-bold text-white">{wrongGuesses}/{maxGuesses}</div>
        <div className="text-white/70 text-sm">Wrong Guesses</div>
      </motion.div>
      
      <motion.div 
        className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <div className="text-lg font-bold text-white capitalize">{category || 'None'}</div>
        <div className="text-white/70 text-sm">Category</div>
      </motion.div>
    </div>
  );
};

export default HangmanStats;