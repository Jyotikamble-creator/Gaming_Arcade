import React, { useState } from 'react';
import TypedText from './TypedText';

const TypingArea = ({ sourceText, onRefresh }) => {
  const [typedInput, setTypedInput] = useState('The quick brown foc'); // Example text from image

  const handleChange = (e) => {
    setTypedInput(e.target.value);
    // In a real app, this would trigger WPM/Accuracy updates
  };

  return (
    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 w-full max-w-4xl mx-auto">
      
      {/* Source Text Display */}
      <div className="h-40 overflow-hidden mb-6">
        <TypedText sourceText={sourceText} typedInput={typedInput} />
      </div>

      {/* Input Field and Refresh Button */}
      <div className="flex space-x-4 items-center">
        <input 
          type="text"
          value={typedInput}
          onChange={handleChange}
          autoFocus
          className="flex-grow bg-transparent border-b-2 border-blue-500 text-white text-xl p-2 outline-none"
          placeholder="Start typing here..."
        />
        
        <button 
          className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-subtle-text hover:text-white transition duration-200"
          onClick={onRefresh}
          aria-label="Restart Test"
        >
          {/* Refresh/Reset Icon */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.836 10H20v-5m-1.582-7.143a9.002 9.002 0 00-16.035 4.793m16.035-4.793a9.002 9.002 0 01-16.035 4.793"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default TypingArea;