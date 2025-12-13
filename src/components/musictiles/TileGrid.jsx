import React from 'react';

const TileGrid = ({ tiles, onTileClick }) => {
  return (
    <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
      {tiles.map((tile, index) => (
        <button
          key={index}
          className={`aspect-square rounded-lg border-2 transition-all duration-200 ${
            tile.active
              ? 'bg-blue-500 border-blue-600 shadow-lg shadow-blue-500/50 scale-105'
              : 'bg-gray-200 border-gray-300 hover:bg-gray-300'
          }`}
          onClick={() => onTileClick(index)}
        />
      ))}
    </div>
  );
};

export default TileGrid;