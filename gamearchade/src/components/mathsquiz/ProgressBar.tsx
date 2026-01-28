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
      <div className="flex justify-between text-sm text-slate-400 mb-2">
        <span>Progress</span>
        <span>{current}/{total}</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;