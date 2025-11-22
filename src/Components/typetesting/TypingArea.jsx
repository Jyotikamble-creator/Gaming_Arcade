import React from 'react';

const TypingArea = ({ sourceText, typedInput, onChange, onRefresh, disabled }) => {
  return (
    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 w-full max-w-4xl mx-auto">
      
      {/* Source Text Display */}
      <div className="text-lg leading-relaxed text-gray-200 mb-4 font-mono">
        {sourceText.split('').map((char, i) => {
          let className = '';
          if (i < typedInput.length) {
            className = typedInput[i] === char ? 'text-green-600' : 'text-red-600';
          } else if (i === typedInput.length) {
            className = 'bg-blue-500 text-white';
          }
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
      />
    </div>
  );
};

export default TypingArea;