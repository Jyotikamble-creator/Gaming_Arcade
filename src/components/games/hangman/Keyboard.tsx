'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface KeyboardProps {
  guessedLetters: string[];
  onGuess: (letter: string) => void;
  word: string;
}

const Keyboard: React.FC<KeyboardProps> = ({ guessedLetters, onGuess, word }) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  const getKeyClass = (letter: string): string => {
    const isGuessed = guessedLetters.includes(letter.toLowerCase());
    const isCorrect = word.includes(letter.toLowerCase());
    
    let baseClass = `
      w-10 h-10 m-1 rounded-lg font-bold text-sm
      transition-all duration-200 shadow-lg
      disabled:cursor-not-allowed
    `;
    
    if (isGuessed) {
      if (isCorrect) {
        baseClass += ' bg-green-500 text-white border-green-600';
      } else {
        baseClass += ' bg-red-500 text-white border-red-600';
      }
    } else {
      baseClass += ' bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50';
    }
    
    return baseClass;
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4 text-center">Keyboard</h3>
      
      <div className="flex flex-wrap justify-center max-w-2xl mx-auto">
        {alphabet.map((letter, index) => {
          const isGuessed = guessedLetters.includes(letter.toLowerCase());
          
          return (
            <motion.button
              key={letter}
              onClick={() => onGuess(letter.toLowerCase())}
              disabled={isGuessed}
              className={getKeyClass(letter)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              whileHover={!isGuessed ? { scale: 1.1 } : {}}
              whileTap={!isGuessed ? { scale: 0.95 } : {}}
            >
              {letter}
            </motion.button>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-white/70">Correct</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-white/70">Wrong</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-white/20 rounded"></div>
          <span className="text-white/70">Available</span>
        </div>
      </div>
    </div>
  );
};

export default Keyboard;