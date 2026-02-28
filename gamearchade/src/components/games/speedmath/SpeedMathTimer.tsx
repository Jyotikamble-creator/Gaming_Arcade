import React from 'react';

interface Props {
  timeLeft: number;
}

const SpeedMathTimer: React.FC<Props> = ({ timeLeft }) => {
  const getTimerColor = () => {
    if (timeLeft > 30) return 'text-green-400';
    if (timeLeft > 10) return 'text-yellow-400';
    return 'text-red-400 animate-pulse';
  };

  const getProgressColor = () => {
    if (timeLeft > 30) return 'bg-green-500';
    if (timeLeft > 10) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const progressPercentage = (timeLeft / 60) * 100;

  return (
    <div className="mb-6">
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 font-medium">Time Remaining</span>
          <span className={`text-4xl font-bold ${getTimerColor()}`}>{timeLeft}s</span>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full ${getProgressColor()} transition-all duration-1000 ease-linear`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default SpeedMathTimer;