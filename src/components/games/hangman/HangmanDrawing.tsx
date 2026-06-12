'use client';

import React from 'react';

interface HangmanDrawingProps {
  wrongGuesses: number;
}

const HangmanDrawing: React.FC<HangmanDrawingProps> = ({ wrongGuesses }) => {
  const drawingParts = [
    { id: 1, element: <line x1="20" y1="220" x2="150" y2="220" stroke="white" strokeWidth="4" /> }, // Base
    { id: 2, element: <line x1="50" y1="220" x2="50" y2="20" stroke="white" strokeWidth="4" /> }, // Pole
    { id: 3, element: <line x1="50" y1="20" x2="120" y2="20" stroke="white" strokeWidth="4" /> }, // Top
    { id: 4, element: <line x1="120" y1="20" x2="120" y2="50" stroke="white" strokeWidth="4" /> }, // Noose
    { id: 5, element: <circle cx="120" cy="65" r="15" stroke="white" strokeWidth="4" fill="none" /> }, // Head
    { id: 6, element: <line x1="120" y1="80" x2="120" y2="150" stroke="white" strokeWidth="4" /> }, // Body
    { id: 7, element: <line x1="120" y1="100" x2="90" y2="130" stroke="white" strokeWidth="4" /> }, // Left arm
    { id: 8, element: <line x1="120" y1="100" x2="150" y2="130" stroke="white" strokeWidth="4" /> }, // Right arm
    { id: 9, element: <line x1="120" y1="150" x2="90" y2="190" stroke="white" strokeWidth="4" /> }, // Left leg
    { id: 10, element: <line x1="120" y1="150" x2="150" y2="190" stroke="white" strokeWidth="4" /> }, // Right leg
  ];

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 flex justify-center items-center">
      <div className="relative">
        <svg width="170" height="240" className="mx-auto">
          {drawingParts.slice(0, Math.min(wrongGuesses, drawingParts.length)).map((part, index) => (
            <g key={part.id}>{part.element}</g>
          ))}
        </svg>
        
        {/* Wrong guesses counter */}
        <div className="text-center mt-4">
          <div className="text-white text-lg font-semibold">
            Wrong Guesses: {wrongGuesses}/6
          </div>
          <div className="text-white/60 text-sm mt-2">
            {6 - wrongGuesses} attempts remaining
          </div>
        </div>
      </div>
    </div>
  );
};

export default HangmanDrawing;