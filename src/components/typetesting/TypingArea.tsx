// TypingArea component displays the source text with real-time feedback on typing accuracy
import React from 'react';
import { TypingAreaProps } from '../../types/typingTest';
import { getCharacterStyle } from '../../utils/typingTestUtils';

export default function TypingArea({ 
  sourceText, 
  typedInput, 
  onChange, 
  onRefresh, 
  disabled 
}: TypingAreaProps): JSX.Element {
  return (
    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 w-full max-w-4xl mx-auto">
      {/* Source Text Display */}
      <div className="text-lg leading-relaxed text-gray-200 mb-4 font-mono">
        {sourceText.split('').map((char, i) => {
          const isCorrect = i < typedInput.length && typedInput[i] === char;
          const className = getCharacterStyle(i, typedInput.length, isCorrect);
          
          return (
            <span key={i} className={className}>
              {char}
            </span>
          );
        })}
      </div>

      {/* Input Field */}
      <textarea
        value={typedInput}
        onChange={onChange}
        rows={6}
        disabled={disabled}
        className="w-full bg-transparent border border-gray-600 rounded-lg p-4 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        placeholder="Start typing here..."
        aria-label="Type the text shown above"
      />
      
      {/* Refresh Button (if provided) */}
      {onRefresh && (
        <div className="mt-4 text-center">
          <button
            onClick={onRefresh}
            className="text-blue-400 hover:text-blue-300 text-sm underline"
          >
            Refresh Text
          </button>
        </div>
      )}
    </div>
  );
}