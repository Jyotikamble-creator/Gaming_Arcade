'use client';

import React from 'react';
import { SkipForward } from 'lucide-react';

interface ActionButtonProps {
  onSkip: () => void;
  disabled?: boolean;
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onSkip, disabled = false, className }) => {
  return (
    <div className={`text-center ${className || ''}`}>
      <button
        onClick={onSkip}
        disabled={disabled}
        className={`
          inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
          ${disabled 
            ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
            : 'bg-slate-700 hover:bg-slate-600 text-white hover:scale-105'
          }
        `}
      >
        <SkipForward size={20} />
        Skip Question
      </button>
    </div>
  );
};

export default ActionButton;