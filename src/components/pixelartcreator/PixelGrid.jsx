import React, { useState } from 'react';

const PixelGrid = ({ grid, onPixelClick }) => {
  const [isDrawing, setIsDrawing] = useState(false);

  const handleMouseDown = (row, col) => {
    setIsDrawing(true);
    onPixelClick(row, col);
  };

  const handleMouseEnter = (row, col) => {
    if (isDrawing) {
      onPixelClick(row, col);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  return (
    <div
      className="grid grid-cols-16 gap-0 bg-white p-2 rounded select-none"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {grid.map((row, rowIndex) =>
        row.map((color, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className="w-6 h-6 cursor-pointer hover:opacity-80"
            style={{ backgroundColor: color }}
            onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
            onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  );
};

export default PixelGrid;