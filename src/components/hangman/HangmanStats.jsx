import React from 'react';

const HangmanStats = ({ score, wordsCompleted, wrongGuesses, maxGuesses, category }) => {
  const getCategoryEmoji = () => {
    const emojis = {
      animals: '🦁',
      countries: '🌍',
      fruits: '🍎',
      technology: '💻',
      sports: '⚽',
      nature: '🌲'
    };
    return emojis[category] || '📚';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 text-center shadow-lg">
        <div className="text-gray-200 text-sm font-medium mb-1">SCORE</div>
        <div className="text-3xl font-bold text-white">{score}</div>
      </div>
      
      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4 text-center shadow-lg">
        <div className="text-gray-200 text-sm font-medium mb-1">WORDS</div>
        <div className="text-3xl font-bold text-white">{wordsCompleted}</div>
      </div>
      
      <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-4 text-center shadow-lg">
        <div className="text-gray-200 text-sm font-medium mb-1">WRONG</div>
        <div className="text-3xl font-bold text-white">{wrongGuesses}/{maxGuesses}</div>
      </div>
      
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4 text-center shadow-lg">
        <div className="text-gray-200 text-sm font-medium mb-1">CATEGORY</div>
        <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          {getCategoryEmoji()} {category}
        </div>
      </div>
    </div>
  );
};

export default HangmanStats;
