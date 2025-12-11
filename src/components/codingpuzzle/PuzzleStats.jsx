import React from 'react';

export default function PuzzleStats({ score, puzzlesSolved, totalPuzzles, streak, bestStreak }) {
  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-purple-500/30 shadow-2xl">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-400">{score}</div>
          <div className="text-gray-400 text-sm mt-1">Score</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-400">{puzzlesSolved}/{totalPuzzles}</div>
          <div className="text-gray-400 text-sm mt-1">Solved</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-400">{streak}</div>
          <div className="text-gray-400 text-sm mt-1">Streak</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400">{bestStreak}</div>
          <div className="text-gray-400 text-sm mt-1">Best Streak</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-400">
            {puzzlesSolved > 0 ? Math.round(score / puzzlesSolved) : 0}
          </div>
          <div className="text-gray-400 text-sm mt-1">Avg/Puzzle</div>
        </div>
      </div>
    </div>
  );
}
