'use client';

import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, className }) => {
  const percentage = (current / total) * 100;

  return (
    <div className={`w-full ${className || ''}`}>
      <div className="flex justify-between text-sm text-slate-400 mb-3">
        <span className="font-semibold uppercase tracking-wide">Progress</span>
        <span className="text-white font-semibold">{current}/{total}</span>
      </div>
      <div className="w-full bg-slate-700/50 border border-slate-600 rounded-full h-4 overflow-hidden shadow-lg">
        <div 
          className="h-full bg-linear-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out shadow-lg"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;