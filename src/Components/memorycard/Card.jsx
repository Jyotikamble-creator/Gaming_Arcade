import React from 'react';

const MemoryCard = ({ isFlipped, isMatched, imageContent }) => {
  
  // Class toggles for flip animation (simplified for static UI)
  const isRevealed = isFlipped || isMatched;
  
  return (
    <div className="w-24 h-28 relative perspective-1000">
      {/* Card Back (Face Down) */}
      <div 
        className={`absolute inset-0 backface-hidden rounded-lg shadow-xl border border-blue-500 flex items-center justify-center 
          bg-gray-700 transition-transform duration-500 
          ${isRevealed ? 'transform rotate-y-90' : 'transform rotate-y-0'}`}
      >
        <svg className="w-10 h-10 text-blue-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 12h20L12 2zM12 22l10-10H2l10 10z"></path></svg>
      </div>

      {/* Card Face (Revealed) */}
      <div 
        className={`absolute inset-0 backface-hidden rounded-lg shadow-xl border border-gray-600 flex items-center justify-center 
          bg-white transition-transform duration-500 
          ${isRevealed ? 'transform rotate-y-0' : 'transform rotate-y-90'}`}
      >
        {/* Content Placeholder: Use a div to simulate the image */}
        <div className="w-full h-full p-2">
            <div className={`w-full h-full flex items-center justify-center rounded ${isMatched ? 'bg-green-100' : 'bg-gray-100'}`}>
                {/*  */}
                <span className="text-xl text-gray-800">{imageContent}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryCard;