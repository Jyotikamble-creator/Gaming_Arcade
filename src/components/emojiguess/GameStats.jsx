// A React component that displays game statistics for the Emoji Guess game,
const GameStats = ({ score, attempts, hintsUsed, gameStarted }) => {
  if (!gameStarted) return null;
// including score, attempts, and hints used.
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-card-bg rounded-lg p-4 border border-gray-700 text-center">
        <div className="flex items-center justify-center mb-2">
          <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <span className="text-sm font-medium text-subtle-text">Score</span>
        </div>
        <div className="text-2xl font-bold text-yellow-500">{score}</div>
      </div>

      <div className="bg-card-bg rounded-lg p-4 border border-gray-700 text-center">
        <div className="flex items-center justify-center mb-2">
          <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-sm font-medium text-subtle-text">Attempts</span>
        </div>
        <div className="text-2xl font-bold text-blue-500">{attempts}</div>
      </div>

      <div className="bg-card-bg rounded-lg p-4 border border-gray-700 text-center">
        <div className="flex items-center justify-center mb-2">
          <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-subtle-text">Hints Used</span>
        </div>
        <div className="text-2xl font-bold text-green-500">{hintsUsed}</div>
      </div>
    </div>
  );
};

export default GameStats;