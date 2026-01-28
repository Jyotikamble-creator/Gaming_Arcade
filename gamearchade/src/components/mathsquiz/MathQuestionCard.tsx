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
    const baseStyle = "w-full p-4 rounded-lg font-medium transition-all duration-200 text-left";
    
    if (feedbackStatus === 'none') {
      return `${baseStyle} bg-slate-700 hover:bg-slate-600 text-white hover:scale-105`;
    }
    
    if (option === correctAnswer) {
      return `${baseStyle} bg-green-600 text-white`;
    }
    
    if (option === selectedAnswer && option !== correctAnswer) {
      return `${baseStyle} bg-red-600 text-white`;
    }
    
    return `${baseStyle} bg-slate-700 text-slate-400`;
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
      <div className="bg-slate-800/80 backdrop-blur-lg rounded-xl p-8 mb-8 text-center border border-slate-700 shadow-lg">
        <h2 className="text-3xl font-bold text-white mb-4">
          {question}
        </h2>
        <p className="text-slate-400">Choose the correct answer:</p>
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className={`mt-6 text-center p-4 rounded-lg ${
          feedbackStatus === 'correct' 
            ? 'bg-green-900/50 border border-green-600' 
            : 'bg-red-900/50 border border-red-600'
        }`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            {feedbackStatus === 'correct' ? (
              <Check size={24} className="text-green-400" />
            ) : (
              <X size={24} className="text-red-400" />
            )}
            <span className={`text-lg font-medium ${
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