'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HangmanWinModalProps {
  word: string;
  wrongGuesses: number;
  maxGuesses: number;
  score: number;
  wordsCompleted: number;
  onNextWord: () => void;
  onBackToMenu: () => void;
}

const HangmanWinModal: React.FC<HangmanWinModalProps> = ({
  word,
  wrongGuesses,
  maxGuesses,
  score,
  wordsCompleted,
  onNextWord,
  onBackToMenu
}) => {
  const accuracy = Math.round(((maxGuesses - wrongGuesses) / maxGuesses) * 100);

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
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-white mb-4">Congratulations!</h2>
          <p className="text-white/80 mb-4">You guessed the word correctly!</p>
          
          <div className="bg-white/10 rounded-xl p-4 mb-6">
            <div className="text-2xl font-bold text-green-400 mb-2">
              {word.toUpperCase()}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-white/60">Accuracy</div>
                <div className="text-white font-semibold">{accuracy}%</div>
              </div>
              <div>
                <div className="text-white/60">Total Score</div>
                <div className="text-white font-semibold">{score}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <motion.button
              onClick={onNextWord}
              className="
                px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600
                text-white font-semibold rounded-lg
                hover:from-green-600 hover:to-emerald-700
                transition-all duration-200
              "
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Next Word
            </motion.button>
            
            <motion.button
              onClick={onBackToMenu}
              className="
                px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600
                text-white font-semibold rounded-lg
                hover:from-blue-600 hover:to-purple-700
                transition-all duration-200
              "
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Menu
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HangmanWinModal;