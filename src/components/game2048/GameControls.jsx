// Component for game controls in 2048 game
import { RotateCcw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

// Component for game controls
const GameControls = ({ onMove, onRestart, gameOver }) => {
  const buttonClass = `
    w-14 h-14 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600
    hover:from-blue-600 hover:to-purple-700 text-white font-bold
    transition-all duration-200 transform hover:scale-105 active:scale-95
    shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
    flex items-center justify-center border-2 border-white/20
  `;

  // Render game controls
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Directional Controls Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Empty top-left */}
        <div></div>

        {/* Up button */}
        <button
          onClick={() => onMove('up')}
          disabled={gameOver}
          className={buttonClass}
        >
          <ChevronUp className="w-7 h-7" />
        </button>

        {/* Empty top-right */}
        <div></div>

        {/* Left button */}
        <button
          onClick={() => onMove('left')}
          disabled={gameOver}
          className={buttonClass}
        >
          <ChevronLeft className="w-7 h-7" />
        </button>

        {/* Center space */}
        <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center">
          <div className="w-3 h-3 bg-white/30 rounded-full"></div>
        </div>

        {/* Right button */}
        <button
          onClick={() => onMove('right')}
          disabled={gameOver}
          className={buttonClass}
        >
          <ChevronRight className="w-7 h-7" />
        </button>

        {/* Empty bottom-left */}
        <div></div>

        {/* Down button */}
        <button
          onClick={() => onMove('down')}
          disabled={gameOver}
          className={buttonClass}
        >
          <ChevronDown className="w-7 h-7" />
        </button>

        {/* Empty bottom-right */}
        <div></div>
      </div>

      {/* Restart Button */}
      <button
        onClick={onRestart}
        className="
          px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600
          hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg
          transition-all duration-200 transform hover:scale-105 active:scale-95
          shadow-lg flex items-center gap-3 border-2 border-white/20
        "
      >
        <RotateCcw className="w-6 h-6" />
        New Game
      </button>
    </div>
  );
};

export default GameControls;