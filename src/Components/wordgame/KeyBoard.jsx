import React from 'react';

// Example keyboard status (in a real app, this would come from state)
const keyStatus = {
    'Q': 'incorrect', 'W': 'incorrect', 'E': 'wrong_spot', 'R': 'incorrect', 'T': 'incorrect', 'Y': 'incorrect', 'U': 'incorrect', 'I': 'incorrect', 'O': 'incorrect', 'P': 'wrong_spot',
    'A': 'incorrect', 'S': 'incorrect', 'D': 'incorrect', 'F': 'incorrect', 'G': 'incorrect', 'H': 'incorrect', 'J': 'incorrect', 'K': 'incorrect', 'L': 'wrong_spot',
    'Z': 'incorrect', 'X': 'incorrect', 'C': 'incorrect', 'V': 'incorrect', 'B': 'incorrect', 'N': 'incorrect', 'M': 'incorrect',
};

const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
];

const getKeyClass = (key) => {
  const status = keyStatus[key] || 'default';
  
  switch (status) {
    case 'correct':
      return 'bg-green-600 hover:bg-green-700 text-white';
    case 'wrong_spot':
      return 'bg-yellow-600 hover:bg-yellow-700 text-white';
    case 'incorrect':
      return 'bg-gray-700 hover:bg-gray-600 text-white';
    case 'win': // Special case for the "You Win!" key
      return 'bg-green-500 hover:bg-green-600 text-white col-span-2 w-full';
    default:
      return 'bg-gray-600 hover:bg-gray-500 text-white'; // Untouched key
  }
};

const KeyBoard = ({ onKeyPress }) => {
  return (
    <div className="mt-8">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className={`flex justify-center mb-1 ${rowIndex === 1 ? 'mx-6' : ''}`}>
          {row.map((key) => {
            const isSpecialKey = key === 'ENTER' || key === 'BACK';
            const keyContent = key === 'BACK' ? '⌫' : key;
            const customClass = key === 'ENTER' ? 'w-20' : key === 'BACK' ? 'w-16' : 'w-10';

            // Special handling for the "You Win!" state from the image
            if (key === 'Z' && keyStatus['Z'] === 'win') {
                return <div key="win" className={getKeyClass('win') + ' py-3 rounded-md text-sm font-bold flex items-center justify-center mr-1'}>You Win!</div>
            }

            return (
              <button
                key={key}
                className={`flex items-center justify-center h-12 text-sm font-bold mx-0.5 rounded-md uppercase transition duration-150 ${customClass} ${getKeyClass(key)}`}
                onClick={() => onKeyPress(key)}
              >
                {keyContent}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default KeyBoard;