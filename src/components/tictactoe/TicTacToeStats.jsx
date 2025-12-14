// TicTacToeStats component to display game statistics
export default function TicTacToeStats({ isXNext, scores, gamesPlayed }) {
  // Render the Tic Tac Toe statistics component
  return (
    <div className="flex justify-center gap-6 mb-8">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
        <span className="text-sm font-medium text-gray-300">NEXT PLAYER</span>
        <div className={`text-2xl font-bold ${isXNext ? 'text-blue-400' : 'text-red-400'}`}>
          {isXNext ? 'X' : 'O'}
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
        <span className="text-sm font-medium text-gray-300">SCORE X</span>
        <div className="text-2xl font-bold text-blue-400">{scores.X}</div>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
        <span className="text-sm font-medium text-gray-300">SCORE O</span>
        <div className="text-2xl font-bold text-red-400">{scores.O}</div>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
        <span className="text-sm font-medium text-gray-300">GAMES</span>
        <div className="text-2xl font-bold text-white">{gamesPlayed}</div>
      </div>
    </div>
  );
}