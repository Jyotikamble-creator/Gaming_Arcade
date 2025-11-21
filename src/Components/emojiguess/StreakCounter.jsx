import React from 'react';
import { Flame, Trophy } from 'lucide-react';

const StreakCounter = ({ streak }) => {
  if (streak === 0) return null;

  const getStreakColor = (streak) => {
    if (streak >= 10) return 'text-red-500';
    if (streak >= 5) return 'text-orange-500';
    return 'text-yellow-500';
  };

  const getStreakIcon = (streak) => {
    if (streak >= 10) return <Trophy className="w-6 h-6" />;
    return <Flame className="w-6 h-6" />;
  };

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold shadow-lg animate-pulse ${streak >= 5 ? 'animate-bounce' : ''}`}>
      {getStreakIcon(streak)}
      <span className="text-lg">{streak}</span>
      <span className="text-sm">STREAK!</span>
    </div>
  );
};

export default StreakCounter;