import React from 'react';

const Tools = ({ tool, onToolChange, onClear, onSave }) => {
  return (
    <div className="bg-gray-100 p-4 rounded space-y-2">
      <h3 className="text-lg font-semibold">Tools</h3>
      <div className="flex gap-2">
        <button
          className={`px-3 py-1 rounded ${tool === 'paint' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => onToolChange('paint')}
        >
          Paint
        </button>
        <button
          className={`px-3 py-1 rounded ${tool === 'erase' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => onToolChange('erase')}
        >
          Erase
        </button>
      </div>
      <button
        className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        onClick={onClear}
      >
        Clear Canvas
      </button>
      <button
        className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        onClick={onSave}
      >
        Save Art
      </button>
    </div>
  );
};

export default Tools;