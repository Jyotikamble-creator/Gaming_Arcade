import React from 'react';
import { motion } from 'framer-motion';
import AnimatedBackground from '../AnimatedBackground';

interface EmojiGuessErrorProps {
  message: string;
  onRetry: () => void;
}

export default function EmojiGuessError({ message, onRetry }: EmojiGuessErrorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden flex items-center justify-center">
      <AnimatedBackground />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center max-w-md mx-auto px-6"
      >
        <motion.div
          className="text-6xl mb-6"
          animate={{ 
            rotate: [0, -10, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          😢
        </motion.div>
        
        <h2 className="text-2xl font-bold text-white mb-4">
          Oops! Something went wrong
        </h2>
        
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
          <p className="text-red-200">
            {message || 'Failed to load the emoji puzzle'}
          </p>
        </div>
        
        <button
          onClick={onRetry}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 mx-auto"
        >
          🔄 Try Again
        </button>
        
        <p className="text-white/60 text-sm mt-4">
          Don't worry, we'll get you back to guessing emojis!
        </p>
      </motion.div>
    </div>
  );
}