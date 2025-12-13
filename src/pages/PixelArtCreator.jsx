import React, { useState, useCallback } from 'react';
import PixelGrid from '../components/pixelartcreator/PixelGrid';
import ColorPicker from '../components/pixelartcreator/ColorPicker';
import Tools from '../components/pixelartcreator/Tools';
import { saveScore } from '../api/scoreApi';

const PixelArtCreator = () => {
  const [grid, setGrid] = useState(Array(16).fill().map(() => Array(16).fill('#ffffff')));
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [tool, setTool] = useState('paint');

  const handlePixelClick = useCallback((row, col) => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(r => [...r]);
      if (tool === 'paint') {
        newGrid[row][col] = selectedColor;
      } else if (tool === 'erase') {
        newGrid[row][col] = '#ffffff';
      }
      return newGrid;
    });
  }, [selectedColor, tool]);

  const handleClear = () => {
    setGrid(Array(16).fill().map(() => Array(16).fill('#ffffff')));
  };

  const handleSave = async () => {
    // Calculate score based on filled pixels
    const filledPixels = grid.flat().filter(color => color !== '#ffffff').length;
    const score = filledPixels * 10; // Simple scoring

    try {
      await saveScore('pixel-art-creator', score, { filledPixels });
      alert(`Art saved! Score: ${score}`);
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  return (
    <div className="min-h-screen text-light-text p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">Pixel Art Creator</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <PixelGrid grid={grid} onPixelClick={handlePixelClick} />
            </div>
            <div className="lg:w-64 space-y-4">
              <ColorPicker selectedColor={selectedColor} onColorChange={setSelectedColor} />
              <Tools tool={tool} onToolChange={setTool} onClear={handleClear} onSave={handleSave} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PixelArtCreator;