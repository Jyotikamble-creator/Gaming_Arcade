// Component to display game status (win/lose) for 2048 game
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// GameStatus component to show win or game over status
const GameStatus = ({ gameWon, gameOver, onContinue }) => {
  if (!gameWon && !gameOver) return null;

  // Determine if it's a win or game over
  const isWin = gameWon && !gameOver;

  // Render game status
  return (
    // Background overlay
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={`
        bg-white rounded-2xl p-8 text-center shadow-2xl transform transition-all duration-300
        ${isWin ? 'border-4 border-yellow-400' : 'border-4 border-red-400'}
      `}>
        <div className="mb-4">
          {isWin ? (
            <CheckCircle className="w-16 h-16 text-yellow-500 mx-auto animate-bounce" />
          ) : (
            <XCircle className="w-16 h-16 text-red-500 mx-auto animate-pulse" />
          )}
        </div>

        <h2 className={`text-3xl font-bold mb-4 ${isWin ? 'text-yellow-600' : 'text-red-600'}`}>
          {isWin ? '🎉 You Win!' : '💔 Game Over'}
        </h2>

        <p className="text-gray-600 mb-6 text-lg">
          {isWin
            ? 'Congratulations! You reached 2048!'
            : 'No more moves available. Try again!'
          }
        </p>
        {isWin && (
          <div className="mb-6">
            <button
              onClick={onContinue}
              className="
                px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-600
                hover:from-yellow-600 hover:to-orange-700 text-white font-bold
                transition-all duration-200 transform hover:scale-105
                shadow-lg mr-4
              "
            >
              Keep Playing
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <AlertCircle className="w-4 h-4" />
          <span>Click "New Game" to restart</span>
        </div>
      </div>
    </div>
  );
};

export default GameStatus;