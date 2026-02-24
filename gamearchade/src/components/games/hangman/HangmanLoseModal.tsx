'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HangmanLoseModalProps {
  word: string;
  score: number;
  wordsCompleted: number;
  onTryAgain: () => void;
}

const HangmanLoseModal: React.FC<HangmanLoseModalProps> = ({
  word,
  score,
  wordsCompleted,
  onTryAgain
}) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-4 text-center border border-white/20"
        >
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-3xl font-bold text-white mb-4">Game Over</h2>
          <p className="text-white/80 mb-4">You ran out of attempts!</p>
          
          <div className="bg-white/10 rounded-xl p-4 mb-6">
            <div className="mb-4">
              <div className="text-white/60 text-sm">The word was:</div>
              <div className="text-2xl font-bold text-red-400">
                {word.toUpperCase()}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-white/60">Final Score</div>
                <div className="text-white font-semibold">{score}</div>
              </div>
              <div>
                <div className="text-white/60">Words Completed</div>
                <div className="text-white font-semibold">{wordsCompleted}</div>
              </div>
            </div>
          </div>

          <motion.button
            onClick={onTryAgain}
            className="
              px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600
              text-white font-semibold rounded-lg w-full
              hover:from-blue-600 hover:to-purple-700
              transition-all duration-200
            "
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HangmanLoseModal;