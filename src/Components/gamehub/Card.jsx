import React from 'react';

const GameCard = ({ title, description, image }) => {
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col transition duration-300 hover:shadow-2xl hover:scale-[1.02] border border-gray-700">
      
      {/* Image Container */}
      <div className="w-full h-40 overflow-hidden">
        {/* Placeholder for the actual image */}
        <img 
            src={image} 
            alt={`Image for ${title}`} 
            className="w-full h-full object-cover" 
            // In a real app, use a proper import or CDN. Using a div for now to represent the image area.
            onError={(e) => { e.target.style.display = 'none'; }} // Hide if placeholder image fails
        />
        <div className="w-full h-full flex items-center justify-center bg-gray-700 text-sm text-subtle-text">
                    </div>
      </div>
      
      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-subtle-text flex-grow mb-4">{description}</p>
        
        {/* Play Button */}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition duration-200">
          Play
        </button>
      </div>
    </div>
  );
};

export default GameCard;