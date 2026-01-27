import React from 'react';
import { motion } from 'framer-motion';

interface EmojiGuessControlsProps {
  onNewPuzzle: () => void;
  onTryAgain: () => void;
  isLoading: boolean;
  attempts: number;
  message: string;
}

export default function EmojiGuessControls({ 
  onNewPuzzle, 
  onTryAgain, 
  isLoading, 
  attempts, 
  message 
}: EmojiGuessControlsProps) {
  const showNewPuzzleButton = message.includes('Correct') || (attempts >= 3 && message.includes('Wrong'));
  const showTryAgainButton = attempts > 0 && !showNewPuzzleButton;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center gap-4"
    >
      {showNewPuzzleButton && (
        <button
          onClick={onNewPuzzle}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Loading...
            </>
          ) : (
            <>
              🎯 New Puzzle
            </>
          )}
        </button>
      )}
      
      {showTryAgainButton && (
        <button
          onClick={onTryAgain}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          🔄 Try Again
        </button>
      )}
    </motion.div>
  );
}