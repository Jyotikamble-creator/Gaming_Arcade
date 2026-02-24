'use client';

import React from 'react';
import { Clock, Target, Trophy, Zap } from 'lucide-react';

interface GameStatsProps {
  moves: number;
  matched: number;
  total: number;
  time: number;
  isGameWon: boolean;
  className?: string;
}

const GameStats: React.FC<GameStatsProps> = ({ 
  moves, 
  matched, 
  total, 
  time, 
  isGameWon,
  className 
}) => {
  const pairs = total / 2;
  const progress = total > 0 ? (matched / total) * 100 : 0;
  const accuracy = moves > 0 ? Math.round((matched / 2 / moves) * 100) : 0;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`mb-8 ${className || ''}`}>
      {/* Progress Bar */}
      <div className="max-w-md mx-auto mb-6">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>Progress</span>
          <span>{matched / 2}/{pairs} pairs</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isGameWon 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
        {/* Moves */}
        <div className="bg-slate-800/80 backdrop-blur-lg rounded-xl p-4 text-center border border-slate-700 shadow-lg">
          <div className="flex items-center justify-center mb-2">
            <Target className="w-5 h-5 text-blue-400" />
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
          <div className="text-2xl font-bold text-white">{formatTime(time)}</div>
        </div>

        {/* Pairs */}
        <div className="bg-slate-800/80 backdrop-blur-lg rounded-xl p-4 text-center border border-slate-700 shadow-lg">
          <div className="flex items-center justify-center mb-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          <span className="text-sm text-slate-400 uppercase tracking-wider block">Pairs</span>
          <div className="text-2xl font-bold text-white">{matched / 2}/{pairs}</div>
        </div>

        {/* Accuracy */}
        <div className="bg-slate-800/80 backdrop-blur-lg rounded-xl p-4 text-center border border-slate-700 shadow-lg">
          <div className="flex items-center justify-center mb-2">
            <Zap className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-sm text-slate-400 uppercase tracking-wider block">Accuracy</span>
          <div className="text-2xl font-bold text-white">{accuracy}%</div>
        </div>
      </div>
    </div>
  );
};

export default GameStats;