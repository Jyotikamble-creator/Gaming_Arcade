import React from 'react';

const MemoryCard = ({ isFlipped, isMatched, imageContent }) => {
  return (
    <div className={`w-24 h-28 relative preserve-3d cursor-pointer group transition-transform duration-500 ${isFlipped || isMatched ? 'rotate-y-180' : 'rotate-y-0'}`}>
      {/* Card Back (Face Down) */}
      <div
        className="absolute inset-0 w-full h-full backface-hidden rounded-lg shadow-xl border border-blue-500 flex items-center justify-center bg-gradient-to-br from-red-700 to-red-800"
      >
        <div className="w-8 h-8 text-blue-400">
          <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 12h20L12 2zM12 22l10-10H2l10 10z"/>
          </svg>
        </div>
      </div>

      {/* Card Face (Revealed) */}
      <div
        className={`absolute inset-0 w-full h-full backface-hidden rounded-lg shadow-xl border flex items-center justify-center rotate-y-180
          ${isMatched ? 'bg-gradient-to-br from-green-400 to-blue-500 border-green-300 animate-pulse ring-2 ring-yellow-400' : 'bg-gradient-to-br from-blue-400 to-purple-500 border-blue-300'}`}
      >
        <div className="w-full h-full p-2 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">
            {imageContent}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MemoryCard;