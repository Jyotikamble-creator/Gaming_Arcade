'use client';

import React from 'react';
import { Clock } from 'lucide-react';

interface TimerDisplayProps {
  minutes: number;
  seconds: number;
  className?: string;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ minutes, seconds, className }) => {
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const isLowTime = minutes === 0 && seconds <= 10;

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Clock 
        size={20} 
        className={`${isLowTime ? 'text-red-400' : 'text-slate-400'} transition-colors`} 
      />
      <div className={`text-2xl font-bold ${isLowTime ? 'text-red-400 animate-pulse' : 'text-white'} transition-colors`}>
        {timeString}
      </div>
    </div>
  );
};

export default TimerDisplay;