import React from 'react';

export default function PuzzleDisplay({ puzzle, puzzleNumber, totalPuzzles }) {
  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 mb-6 border border-purple-500/30 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="text-purple-400 font-semibold">
          Puzzle {puzzleNumber} of {totalPuzzles}
        </div>
        <div className={`px-4 py-1 rounded-full text-sm font-bold ${
          puzzle.difficulty === 'easy' ? 'bg-green-600/30 text-green-300 border border-green-500/50' :
          puzzle.difficulty === 'medium' ? 'bg-yellow-600/30 text-yellow-300 border border-yellow-500/50' :
          'bg-red-600/30 text-red-300 border border-red-500/50'
        }`}>
          {puzzle.difficulty.toUpperCase()}
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
        <pre className="text-white text-lg leading-relaxed whitespace-pre-wrap font-mono">
          {puzzle.question}
        </pre>
      </div>
    </div>
  );
}
