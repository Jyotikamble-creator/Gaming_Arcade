import React from 'react';
import { motion } from 'framer-motion';

interface GameStatsProps {
  score: number;
  attempts: number;
  hintsUsed: number;
  gameStarted: boolean;
}

export default function GameStats({ score, attempts, hintsUsed, gameStarted }: GameStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center border border-white/20">
        <div className="text-2xl font-bold text-white">{score}</div>
        <div className="text-white/70 text-sm">Score</div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center border border-white/20">
        <div className="text-2xl font-bold text-white">{attempts}</div>
        <div className="text-white/70 text-sm">Attempts</div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center border border-white/20">
        <div className="text-2xl font-bold text-white">{hintsUsed}</div>
        <div className="text-white/70 text-sm">Hints Used</div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center border border-white/20">
        <div className="text-2xl font-bold text-white">
          {gameStarted ? '🎮' : '⏸️'}
        </div>
        <div className="text-white/70 text-sm">Status</div>
      </div>
    </motion.div>
  );
}