import React from 'react';

const Tile = ({ value, isNew = false, isMerged = false }) => {
  const getTileColor = (value) => {
    const colors = {
      2: 'bg-gray-100 text-gray-800',
      4: 'bg-gray-200 text-gray-800',
      8: 'bg-orange-200 text-white',
      16: 'bg-orange-300 text-white',
      32: 'bg-orange-400 text-white',
      64: 'bg-orange-500 text-white',
      128: 'bg-yellow-300 text-white',
      256: 'bg-yellow-400 text-white',
      512: 'bg-yellow-500 text-white',
      1024: 'bg-red-400 text-white',
      2048: 'bg-red-500 text-white',
    };
    return colors[value] || 'bg-red-600 text-white';
  };

  const getFontSize = (value) => {
    if (value < 100) return 'text-2xl';
    if (value < 1000) return 'text-xl';
    return 'text-lg';
  };

  return (
    <div
      className={`
        w-20 h-20 rounded-lg flex items-center justify-center font-bold
        ${value ? getTileColor(value) : 'bg-gray-300'}
        ${getFontSize(value)}
        ${isNew ? 'animate-pulse' : ''}
        ${isMerged ? 'animate-bounce' : ''}
        transition-all duration-200 ease-in-out
        shadow-lg
      `}
    >
      {value || ''}
    </div>
  );
};

export default Tile;