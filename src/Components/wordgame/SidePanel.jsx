import React from 'react';

const SidePanel = () => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 w-full">
      <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
      <p className="text-sm text-subtle-text mb-6">
        Guess the **5-letter word** in 6 tries. After each guess, the color of the tiles will change to show how close your guess was to the word.
      </p>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-md transition duration-200">
          Get a Hint
        </button>
        <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-md transition duration-200">
          New Game
        </button>
      </div>
    </div>
  );
};

export default SidePanel;