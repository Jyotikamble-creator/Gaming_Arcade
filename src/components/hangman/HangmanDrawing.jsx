import React from 'react';

const HangmanDrawing = ({ wrongGuesses }) => {
  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/30">
      <h3 className="text-lg font-semibold text-white mb-4 text-center">Hangman</h3>
      
      <svg className="w-full h-64" viewBox="0 0 200 250">
        {/* Gallows */}
        <line x1="10" y1="230" x2="150" y2="230" stroke="#ffffff" strokeWidth="4" />
        <line x1="50" y1="230" x2="50" y2="20" stroke="#ffffff" strokeWidth="4" />
        <line x1="50" y1="20" x2="130" y2="20" stroke="#ffffff" strokeWidth="4" />
        <line x1="130" y1="20" x2="130" y2="50" stroke="#ffffff" strokeWidth="4" />
        
        {/* Head */}
        {wrongGuesses >= 1 && (
          <circle cx="130" cy="70" r="20" stroke="#ef4444" strokeWidth="4" fill="none" />
        )}
        
        {/* Body */}
        {wrongGuesses >= 2 && (
          <line x1="130" y1="90" x2="130" y2="150" stroke="#ef4444" strokeWidth="4" />
        )}
        
        {/* Left Arm */}
        {wrongGuesses >= 3 && (
          <line x1="130" y1="110" x2="100" y2="130" stroke="#ef4444" strokeWidth="4" />
        )}
        
        {/* Right Arm */}
        {wrongGuesses >= 4 && (
          <line x1="130" y1="110" x2="160" y2="130" stroke="#ef4444" strokeWidth="4" />
        )}
        
        {/* Left Leg */}
        {wrongGuesses >= 5 && (
          <line x1="130" y1="150" x2="110" y2="190" stroke="#ef4444" strokeWidth="4" />
        )}
        
        {/* Right Leg */}
        {wrongGuesses >= 6 && (
          <line x1="130" y1="150" x2="150" y2="190" stroke="#ef4444" strokeWidth="4" />
        )}
      </svg>
      
      <div className="text-center mt-4">
        <p className="text-gray-400 text-sm">Wrong Guesses: <span className="text-red-400 font-bold">{wrongGuesses}/6</span></p>
      </div>
    </div>
  );
};

export default HangmanDrawing;
