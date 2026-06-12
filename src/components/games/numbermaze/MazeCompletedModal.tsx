'use client';

import React from 'react';
import { Trophy, Clock, Target, TrendingUp, RotateCcw, ArrowLeft } from 'lucide-react';

interface MazeCompletedModalProps {
  moves: number;
  time: number;
  score: number;
  targetNumber: number;
  efficiency: number;
  onPlayAgain: () => void;
  onBackToDashboard?: () => void;
  className?: string;
}

const MazeCompletedModal: React.FC<MazeCompletedModalProps> = ({
  moves,
  time,
  score,
  targetNumber,
  efficiency,
  onPlayAgain,
  onBackToDashboard,
  className
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceRating = (): { rating: string; color: string; message: string } => {
    if (efficiency >= 90) {
      return { rating: 'Excellent!', color: 'text-green-400', message: 'Outstanding navigation skills!' };
    } else if (efficiency >= 75) {
      return { rating: 'Great!', color: 'text-blue-400', message: 'Well done, efficient pathfinding!' };
    } else if (efficiency >= 60) {
      return { rating: 'Good!', color: 'text-yellow-400', message: 'Nice work, room for improvement!' };
    } else {
      return { rating: 'Keep Trying!', color: 'text-orange-400', message: 'Practice makes perfect!' };
    }
  };

  const { rating, color, message } = getPerformanceRating();

  return (
    <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 ${className || ''}`}>
      <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-md w-full animate-bounce-in">
        {/* Success Header */}
        <div className="mb-6">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-green-600 mb-2">🎉 Maze Solved!</h2>
          <p className="text-slate-600">You reached the target number!</p>
        </div>

        {/* Performance Rating */}
        <div className="mb-6">
          <div className={`text-2xl font-bold ${color} mb-2`}>{rating}</div>
          <p className="text-slate-600 text-sm">{message}</p>
        </div>

        {/* Stats Grid */}
        <div className="bg-slate-100 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Score */}
            <div className="text-center">
              <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
              <div className="text-sm text-slate-500">Score</div>
              <div className="text-2xl font-bold text-slate-800">{score}</div>
            </div>

            {/* Time */}
            <div className="text-center">
              <Clock className="w-6 h-6 text-blue-500 mx-auto mb-1" />
              <div className="text-sm text-slate-500">Time</div>
              <div className="text-2xl font-bold text-slate-800">{formatTime(time)}</div>
            </div>

            {/* Moves */}
            <div className="text-center">
              <TrendingUp className="w-6 h-6 text-purple-500 mx-auto mb-1" />
              <div className="text-sm text-slate-500">Moves</div>
              <div className="text-2xl font-bold text-slate-800">{moves}</div>
            </div>

            {/* Target */}
            <div className="text-center">
              <Target className="w-6 h-6 text-green-500 mx-auto mb-1" />
              <div className="text-sm text-slate-500">Target</div>
              <div className="text-2xl font-bold text-slate-800">{targetNumber}</div>
            </div>
          </div>

          {/* Efficiency Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Efficiency</span>
              <span>{Math.round(efficiency)}%</span>
            </div>
            <div className="w-full bg-slate-300 rounded-full h-2">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  efficiency >= 90 ? 'bg-green-500' :
                  efficiency >= 75 ? 'bg-blue-500' :
                  efficiency >= 60 ? 'bg-yellow-500' : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min(100, efficiency)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
          >
            <RotateCcw size={20} />
            Play Again
          </button>
          
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
            >
              <ArrowLeft size={20} />
              Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MazeCompletedModal;