import React from 'react';

// Example data structure for the board tiles (simulating one complete guess and five empty rows)
const initialBoard = [
  ['A', 'P', 'P', 'L', 'E'], // Guess 1
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
];

// Status map for the example guess (APPLE: Assuming the word was TOWER)
const statusMap = [
    'wrong_spot', // A is not in TOWER
    'correct',    // P is not in TOWER
    'wrong_spot', // P is not in TOWER
    'wrong_spot', // L is not in TOWER
    'correct',    // E is in TOWER
];

// Helper function to get Tailwind class based on tile status
const getTileClass = (char, status) => {
  if (char === '') return 'bg-gray-800 border-gray-600';
  
  switch (status) {
    case 'correct':
      return 'bg-green-600 border-green-600 text-white';
    case 'wrong_spot':
      return 'bg-yellow-600 border-yellow-600 text-white';
    case 'incorrect':
      return 'bg-gray-700 border-gray-700 text-white';
    default:
      return 'bg-gray-800 border-gray-600'; // Default for currently typing/active
  }
};

const GameBoard = ({ board = initialBoard, guessStatus = [statusMap, Array(5).fill('default'), ...] }) => {
  return (
    <div className="flex flex-col space-y-2">
      <h2 className="text-4xl font-extrabold text-white mb-6 text-center">WordGuess</h2>
      <div className="space-y-2">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex space-x-2 justify-center">
            {row.map((char, colIndex) => {
              // Apply specific status for the first row, default for others
              const status = rowIndex === 0 ? statusMap[colIndex] : 'default';
              const tileClass = getTileClass(char, status);

              return (
                <div
                  key={colIndex}
                  className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-3xl font-bold uppercase rounded-md border-2 
                    ${tileClass} ${char !== '' ? 'scale-105' : ''} transition-all duration-300`}
                >
                  {char}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;