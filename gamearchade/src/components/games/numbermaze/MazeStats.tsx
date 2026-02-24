'use client';

import React from 'react';
import { Target, Clock, Zap, TrendingUp } from 'lucide-react';

interface MazeStatsProps {
  currentSum: number;
  targetNumber: number;
  moves: number;
  time: string;
  efficiency: number;
  gameStarted: boolean;
  className?: string;
}

const MazeStats: React.FC<MazeStatsProps> = ({
  currentSum,
  targetNumber,
  moves,
  time,
  efficiency,
  gameStarted,
  className
}) => {
  const difference = Math.abs(currentSum - targetNumber);
  const progress = targetNumber !== 0 ? Math.max(0, 100 - (difference / Math.abs(targetNumber)) * 100) : 0;

  return (
    <div className={`mb-8 ${className || ''}`}>
      {/* Progress to Target */}
      <div className="max-w-md mx-auto mb-6">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>Progress to Target</span>
          <span>{currentSum}/{targetNumber}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              Math.abs(difference) <= 5
                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <div className="text-center mt-2">
          <span className={`text-sm ${
            difference === 0 ? 'text-green-400' : 
            difference <= 5 ? 'text-yellow-400' : 'text-slate-400'
          }`}>
            {difference === 0 ? '🎯 Target Reached!' : `${difference} away from target`}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
        {/* Current Sum */}
        <div className="bg-slate-800/80 backdrop-blur-lg rounded-xl p-4 text-center border border-slate-700 shadow-lg">
          <div className="flex items-center justify-center mb-2">
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-sm text-slate-400 uppercase tracking-wider block">Current Sum</span>
          <div className={`text-2xl font-bold ${
            currentSum === targetNumber ? 'text-green-400' : 'text-white'
          }`}>
            {currentSum}
          </div>
        </div>

        {/* Target Number */}
        <div className="bg-slate-800/80 backdrop-blur-lg rounded-xl p-4 text-center border border-slate-700 shadow-lg">
          <div className="flex items-center justify-center mb-2">
            <Target className="w-5 h-5 text-red-400" />
          </div>
          <span className="text-sm text-slate-400 uppercase tracking-wider block">Target</span>
          <div className="text-2xl font-bold text-white">{targetNumber}</div>
        </div>

        {/* Moves */}
        <div className="bg-slate-800/80 backdrop-blur-lg rounded-xl p-4 text-center border border-slate-700 shadow-lg">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-sm text-slate-400 uppercase tracking-wider block">Moves</span>
          <div className="text-2xl font-bold text-white">{moves}</div>
        </div>

        {/* Time */}
        <div className="bg-slate-800/80 backdrop-blur-lg rounded-xl p-4 text-center border border-slate-700 shadow-lg">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-green-400" />
          </div>
          <span className="text-sm text-slate-400 uppercase tracking-wider block">Time</span>
          <div className="text-2xl font-bold text-white">{gameStarted ? time : '0:00'}</div>
        </div>
      </div>

      {/* Game Controls Help */}
      <div className="mt-6 text-center">
        <div className="bg-slate-800/60 backdrop-blur-lg rounded-lg p-3 inline-block border border-slate-700">
          <p className="text-sm text-slate-300">
            Use <span className="font-mono bg-slate-700 px-1 rounded">WASD</span> or{' '}
            <span className="font-mono bg-slate-700 px-1 rounded">Arrow Keys</span> to move
          </p>
        </div>
      </div>
    </div>
  );
};

export default MazeStats;