import React from 'react';
import Tile from './Tile';

const GameBoard = ({ board, newTiles = [], mergedTiles = [] }) => {
  return (
    <div className="bg-gray-400 p-4 rounded-xl shadow-2xl">
      <div className="grid grid-cols-4 gap-3">
        {board.flat().map((value, index) => {
          const row = Math.floor(index / 4);
          const col = index % 4;
          const isNew = newTiles.some(([r, c]) => r === row && c === col);
          const isMerged = mergedTiles.some(([r, c]) => r === row && c === col);

          return (
            <Tile
              key={index}
              value={value}
              isNew={isNew}
              isMerged={isMerged}
            />
          );
        })}
      </div>
    </div>
  );
};

export default GameBoard;