// WhackMoleStats component to display game statistics
import React from 'react';
import { WhackMoleStatsProps } from '@/types/games/whack-a-mole';
import { formatGameDuration } from '@/utility/games/whack-a-mole';

const WhackMoleStats: React.FC<WhackMoleStatsProps> = ({ 
  score, 
  timeLeft, 
  gameStatus,
  accuracy 
}) => {
  return (
    <div className="flex justify-center gap-4 mb-8 flex-wrap">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center min-w-[100px]">
        <span className="text-sm font-medium text-gray-300 block">SCORE</span>
        <div className="text-2xl font-bold text-yellow-400">{score}</div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center min-w-[100px]">
        <span className="text-sm font-medium text-gray-300 block">TIME</span>
        <div className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
          {formatGameDuration(timeLeft)}
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center min-w-[100px]">
        <span className="text-sm font-medium text-gray-300 block">STATUS</span>
        <div className={`text-lg font-bold ${
          gameStatus === 'playing' ? 'text-green-400' : 
          gameStatus === 'gameOver' ? 'text-red-400' : 
          'text-blue-400'
        }`}>
          {gameStatus === 'ready' && 'Ready'}
          {gameStatus === 'playing' && 'Playing'}
          {gameStatus === 'gameOver' && 'Game Over'}
        </div>
      </div>
      
      {accuracy !== undefined && accuracy > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center min-w-[100px]">
          <span className="text-sm font-medium text-gray-300 block">ACCURACY</span>
          <div className={`text-xl font-bold ${
            accuracy >= 80 ? 'text-green-400' :
            accuracy >= 60 ? 'text-yellow-400' :
            'text-orange-400'
          }`}>
            {Math.round(accuracy)}%
          </div>
        </div>
      )}
    </div>
  );
};

export default WhackMoleStats;
