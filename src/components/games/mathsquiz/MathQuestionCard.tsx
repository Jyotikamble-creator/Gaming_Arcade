'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

interface MathQuestionCardProps {
  question: string;
  options: string[];
  onAnswer: (answer: string) => void;
  feedbackStatus: 'none' | 'correct' | 'incorrect';
  selectedAnswer: string | null;
  correctAnswer: string;
  className?: string;
}

const MathQuestionCard: React.FC<MathQuestionCardProps> = ({
  question,
  options,
  onAnswer,
  feedbackStatus,
  selectedAnswer,
  correctAnswer,
  className
}) => {
  const getButtonStyle = (option: string): string => {
    const baseStyle = "w-full p-5 rounded-lg font-semibold transition-all duration-200 text-left border-2";
    
    if (feedbackStatus === 'none') {
      return `${baseStyle} bg-slate-700 hover:bg-slate-600 text-white border-slate-600 hover:border-blue-500 hover:scale-105 cursor-pointer`;
    }
    
    if (option === correctAnswer) {
      return `${baseStyle} bg-green-600/90 text-white border-green-500 shadow-lg shadow-green-500/50`;
    }
    
    if (option === selectedAnswer && option !== correctAnswer) {
      return `${baseStyle} bg-red-600/90 text-white border-red-500 shadow-lg shadow-red-500/50`;
    }
    
    return `${baseStyle} bg-slate-700 text-slate-400 border-slate-600 opacity-50`;
  };

  const getIcon = (option: string): React.ReactNode => {
    if (feedbackStatus === 'none') return null;
    
    if (option === correctAnswer) {
      return <Check size={20} className="text-white" />;
    }
    
    if (option === selectedAnswer && option !== correctAnswer) {
      return <X size={20} className="text-white" />;
    }
    
    return null;
  };

  return (
    <div className={`max-w-2xl mx-auto ${className || ''}`}>
      {/* Question */}
      <div className="bg-slate-800/90 backdrop-blur-lg rounded-xl p-8 mb-8 text-center border-2 border-slate-700 shadow-2xl">
        <h2 className="text-4xl font-bold text-white mb-4">
          {question}
        </h2>
        <p className="text-slate-300 text-lg">Choose the correct answer:</p>
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswer(option)}
            disabled={feedbackStatus !== 'none'}
            className={getButtonStyle(option)}
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">{option}</span>
              {getIcon(option)}
            </div>
          </button>
        ))}
      </div>

      {/* Feedback Message */}
      {feedbackStatus !== 'none' && (
        <div className={`mt-6 text-center p-6 rounded-lg border-2 backdrop-blur-lg ${
          feedbackStatus === 'correct' 
            ? 'bg-green-900/40 border-green-500' 
            : 'bg-red-900/40 border-red-500'
        }`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            {feedbackStatus === 'correct' ? (
              <Check size={28} className="text-green-400" />
            ) : (
              <X size={28} className="text-red-400" />
            )}
            <span className={`text-2xl font-bold ${
              feedbackStatus === 'correct' ? 'text-green-400' : 'text-red-400'
            }`}>
              {feedbackStatus === 'correct' ? 'Correct!' : 'Incorrect!'}
            </span>
          </div>
          {feedbackStatus === 'incorrect' && (
            <p className="text-slate-300">
              The correct answer was: <span className="font-bold text-white">{correctAnswer}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MathQuestionCard;