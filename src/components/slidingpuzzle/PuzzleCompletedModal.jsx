// Modal displayed when the sliding puzzle is completed, showing performance stats and achievements.
export default function PuzzleCompletedModal({ moves, timeElapsed, onPlayAgain }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate performance rating based on moves and time
  const getPerformanceRating = () => {
    const timeBonus = Math.max(0, 300 - timeElapsed);
    const moveEfficiency = moves <= 100 ? 100 : Math.max(0, 200 - moves);
    const totalScore = timeBonus + moveEfficiency;

    if (totalScore >= 300) return { text: '🏆 Puzzle Master!', color: 'text-yellow-400', desc: 'Exceptional performance!' };
    if (totalScore >= 250) return { text: '⭐ Expert Solver!', color: 'text-green-400', desc: 'Outstanding skills!' };
    if (totalScore >= 200) return { text: '🎯 Great Job!', color: 'text-blue-400', desc: 'Well done!' };
    if (totalScore >= 150) return { text: '👍 Good Work!', color: 'text-purple-400', desc: 'Solid performance!' };
    return { text: '💪 Keep Practicing!', color: 'text-gray-400', desc: 'You\'re getting there!' };
  };

  const rating = getPerformanceRating();

  // Render the modal
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full border-2 border-green-500 shadow-2xl">
        <div className="text-center">
          {/* Performance Rating */}
          <div className="mb-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className={`text-4xl font-bold mb-2 ${rating.color}`}>
              {rating.text}
            </h2>
            <p className="text-subtle-text">{rating.desc}</p>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-6 mb-6 border border-gray-700">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-subtle-text text-sm mb-1">Moves Taken</p>
                <p className="text-2xl font-bold text-blue-400">{moves}</p>
              </div>
              <div>
                <p className="text-subtle-text text-sm mb-1">Time</p>
                <p className="text-2xl font-bold text-green-400">{formatTime(timeElapsed)}</p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-subtle-text text-sm mb-1">Average Moves/Minute</p>
              <p className="text-xl font-bold text-purple-400">
                {timeElapsed > 0 ? Math.round((moves / timeElapsed) * 60) : 0}
              </p>
            </div>
          </div>

          {/* Achievement badges */}
          <div className="bg-gray-900/30 rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-3 flex items-center justify-center">
              <span className="mr-2">🏅</span> Achievements
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {moves <= 100 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded px-2 py-1">
                  <span className="text-yellow-400">⚡ Speed Demon</span>
                </div>
              )}
              {timeElapsed <= 120 && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded px-2 py-1">
                  <span className="text-blue-400">⏱️ Quick Solver</span>
                </div>
              )}
              {moves <= 80 && (
                <div className="bg-green-500/10 border border-green-500/30 rounded px-2 py-1">
                  <span className="text-green-400">🎯 Minimalist</span>
                </div>
              )}
              {timeElapsed >= 300 && moves <= 150 && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded px-2 py-1">
                  <span className="text-purple-400">🧠 Strategist</span>
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gray-900/30 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-white font-semibold mb-2 flex items-center">
              <span className="mr-2">💡</span> Pro Tips:
            </h3>
            <ul className="text-subtle-text text-sm space-y-1">
              <li>• Plan your moves ahead to avoid dead ends</li>
              <li>• Work on one section at a time (corners first)</li>
              <li>• Use the empty space strategically</li>
              <li>• Fewer moves = higher score!</li>
            </ul>
          </div>

          <button
            onClick={onPlayAgain}
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors duration-200"
          >
            🎲 Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
