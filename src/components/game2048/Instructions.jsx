import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const Instructions = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 shadow-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-white hover:text-blue-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          <span className="font-medium">How to Play</span>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isExpanded && (
        <div className="mt-4 text-gray-300 text-sm space-y-2">
          <p>• Use arrow keys or tap buttons to move tiles</p>
          <p>• When two tiles with the same number touch, they merge into one</p>
          <p>• Try to reach the 2048 tile!</p>
          <p>• The game ends when no more moves are possible</p>
          <div className="mt-3 p-3 bg-blue-500/20 rounded-lg">
            <p className="text-blue-300 font-medium">💡 Tip: Plan ahead and keep your high-value tiles in corners!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Instructions;