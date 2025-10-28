import React from 'react';

const LeaderboardItem = ({ rank, name, score, image, isHighlighted = false }) => {
    return (
        <div className={`flex items-center p-2 rounded-lg transition duration-150 
            ${isHighlighted ? 'bg-gray-700 border border-blue-500' : 'hover:bg-gray-700'}`}
        >
            <span className="text-lg font-bold w-6 text-white">{rank}.</span>
            
            {/* User Image Placeholder */}
            <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-400 mx-3 flex items-center justify-center text-sm font-semibold text-white">
                {image} 
            </div>
            
            <div className="flex justify-between items-center flex-grow">
                <span className="font-medium text-light-text">{name}</span>
                <span className="text-sm text-subtle-text">{score}</span>
            </div>
        </div>
    );
};

export default LeaderboardItem;