import React from 'react';

const TimerDisplay = ({ minutes, seconds }) => {
  return (
    <div className="flex items-center space-x-1">
      <span className="text-xl font-mono px-2 py-1 bg-gray-700 rounded-md text-white">
        {minutes.toString().padStart(2, '0')}
      </span>
      <span className="text-xl text-subtle-text">:</span>
      <span className="text-xl font-mono px-2 py-1 bg-gray-700 rounded-md text-white">
        {seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
};

export default TimerDisplay;