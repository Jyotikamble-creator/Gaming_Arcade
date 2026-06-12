import React from 'react';
import { motion } from 'framer-motion';

interface GuessInputProps {
  guess: string;
  setGuess: (guess: string) => void;
  onSubmit: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
}

export default function GuessInput({ 
  guess, 
  setGuess, 
  onSubmit, 
  onKeyPress, 
  disabled = false 
}: GuessInputProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <label className="block text-white/80 text-sm font-medium mb-3">
          Your Guess:
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyPress={onKeyPress}
            disabled={disabled}
            className="flex-1 bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Enter your guess..."
          />
          <button
            onClick={onSubmit}
            disabled={disabled || !guess.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Guess
          </button>
        </div>
      </div>
    </motion.div>
  );
}