'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ScoreDisplayProps {
  score: number;
  bestScore: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, bestScore }) => {
  return (
    <div className="flex justify-center gap-6 mb-6">
      <motion.div 
        className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 text-center min-w-[120px]"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <div className="text-white/70 text-sm font-medium mb-1">SCORE</div>
        <motion.div 
          className="text-white text-xl font-bold"
          key={score}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {score.toLocaleString()}
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 text-center min-w-[120px]"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <div className="text-white/70 text-sm font-medium mb-1">BEST</div>
        <div className="text-white text-xl font-bold">
          {bestScore.toLocaleString()}
        </div>
      </motion.div>
    </div>
  );
};

export default ScoreDisplay;