import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HintSystemProps {
  showHint: boolean;
  answer: string;
  hintsUsed: number;
  onUseHint: () => void;
  maxHints: number;
}

export default function HintSystem({ 
  showHint, 
  answer, 
  hintsUsed, 
  onUseHint, 
  maxHints 
}: HintSystemProps) {
  const getHint = () => {
    if (hintsUsed === 0) {
      return `The answer has ${answer.length} letters`;
    } else if (hintsUsed === 1) {
      return `The answer starts with "${answer.charAt(0).toUpperCase()}"`;
    }
    return answer;
  };

  return (
    <div className="max-w-md mx-auto">
      {hintsUsed < maxHints && (
        <div className="text-center mb-4">
          <button
            onClick={onUseHint}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            💡 Use Hint ({maxHints - hintsUsed} left)
          </button>
          <p className="text-white/60 text-sm mt-2">
            Using hints reduces your score by 5 points
          </p>
        </div>
      )}
      
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 text-center"
          >
            <div className="text-yellow-200 font-medium">
              💡 Hint: {getHint()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}