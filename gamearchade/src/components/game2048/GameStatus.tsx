'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameStatusProps {
  gameWon: boolean;
  gameOver: boolean;
  score: number;
  onContinue?: () => void;
  onRestart?: () => void;
}

const GameStatus: React.FC<GameStatusProps> = ({
  gameWon,
  gameOver,
  score,
  onContinue,
  onRestart
}) => {
  return (
    <AnimatePresence>
      {(gameWon || gameOver) && (
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
            {gameWon ? (
              <>
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-white mb-2">You Won!</h2>
                <p className="text-white/80 mb-2">You reached the 2048 tile!</p>
                <p className="text-yellow-400 text-xl font-semibold mb-6">
                  Final Score: {score.toLocaleString()}
                </p>
                <div className="flex flex-col gap-3">
                  {onContinue && (
                    <motion.button
                      onClick={onContinue}
                      className="
                        px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600
                        text-white font-semibold rounded-lg
                        hover:from-green-600 hover:to-emerald-700
                        transition-all duration-200
                      "
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Continue Playing
                    </motion.button>
                  )}
                  {onRestart && (
                    <motion.button
                      onClick={onRestart}
                      className="
                        px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600
                        text-white font-semibold rounded-lg
                        hover:from-blue-600 hover:to-purple-700
                        transition-all duration-200
                      "
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      New Game
                    </motion.button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">😔</div>
                <h2 className="text-3xl font-bold text-white mb-2">Game Over</h2>
                <p className="text-white/80 mb-2">No more moves available!</p>
                <p className="text-yellow-400 text-xl font-semibold mb-6">
                  Final Score: {score.toLocaleString()}
                </p>
                {onRestart && (
                  <motion.button
                    onClick={onRestart}
                    className="
                      px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600
                      text-white font-semibold rounded-lg
                      hover:from-blue-600 hover:to-purple-700
                      transition-all duration-200
                    "
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Try Again
                  </motion.button>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameStatus;