import React from 'react';

const SimonSaysGrid = ({ colors, activeColor, isShowingSequence, gameOver, gameWon, onPress }) => {
  const getColorClasses = (color) => {
    const baseClasses = 'w-20 h-20 rounded-full font-bold text-white text-lg transition-all duration-200 transform hover:scale-105 shadow-lg';
    const colorMap = {
      red: 'bg-red-500 hover:bg-red-600',
      blue: 'bg-blue-500 hover:bg-blue-600',
      green: 'bg-green-500 hover:bg-green-600',
      yellow: 'bg-yellow-500 hover:bg-yellow-600',
      purple: 'bg-purple-500 hover:bg-purple-600',
      orange: 'bg-orange-500 hover:bg-orange-600',
      pink: 'bg-pink-500 hover:bg-pink-600',
      cyan: 'bg-cyan-500 hover:bg-cyan-600'
    };

    let classes = `${baseClasses} ${colorMap[color] || 'bg-gray-500'}`;

    if(activeColor === color){
      classes += ' ring-4 ring-white scale-110 brightness-125';
    }

    if(isShowingSequence || gameOver || gameWon){
      classes += ' cursor-not-allowed opacity-75';
    }

    return classes;
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-6 shadow-2xl">
      <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto">
        {colors.map(c => (
          <button
            key={c}
            onClick={() => onPress(c)}
            disabled={isShowingSequence || gameOver || gameWon}
            className={getColorClasses(c)}
          >
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SimonSaysGrid;