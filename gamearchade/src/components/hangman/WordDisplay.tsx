'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface WordDisplayProps {
  word: string;
  guessedLetters: string[];
}

const WordDisplay: React.FC<WordDisplayProps> = ({ word, guessedLetters }) => {
  const getLetterClass = (letter: string): string => {
    const isGuessed = guessedLetters.includes(letter);
    return `
      inline-block w-12 h-12 mx-1 border-b-4 border-white/30 
      text-center text-xl font-bold text-white
      transition-all duration-300
      ${isGuessed ? 'border-white' : ''}
    `;
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4 text-center">Word to Guess</h3>
      
      <div className="flex flex-wrap justify-center items-center gap-2 mb-4">
        {word.split('').map((letter, index) => {
          const isGuessed = guessedLetters.includes(letter);
          const isSpace = letter === ' ';
          
          if (isSpace) {
            return (
              <div key={index} className="w-4 h-12 mx-1" />
            );
          }

          return (
            <motion.div
              key={index}
              className={getLetterClass(letter)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-center h-full">
                {isGuessed ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {letter.toUpperCase()}
                  </motion.span>
                ) : (
                  <span className="opacity-0">_</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Word length indicator */}
      <div className="text-center text-white/60 text-sm">
        {word.length} letters
      </div>
    </div>
  );
};

export default WordDisplay;