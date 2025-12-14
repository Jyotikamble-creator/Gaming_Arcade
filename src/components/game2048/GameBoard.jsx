// Component to render the 2048 game board with tiles
import Tile from './Tile';

// The GameBoard component renders a 4x4 grid of tiles for the 2048 game.
const GameBoard = ({ board, newTiles = [], mergedTiles = [] }) => {
  return (
    <div className="bg-gray-400 p-4 rounded-xl shadow-2xl">
      <div className="grid grid-cols-4 gap-3">
        {board.flat().map((value, index) => {
          // Determine the row and column of the tile
          const row = Math.floor(index / 4);
          const col = index % 4;
          const isNew = newTiles.some(([r, c]) => r === row && c === col);
          const isMerged = mergedTiles.some(([r, c]) => r === row && c === col);
          // Render a Tile component for each tile
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