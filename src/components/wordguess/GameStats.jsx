// This component displays game statistics for the Word Guess game mode, including score and wrong guesses.
const GameStats = ({ score, wrongGuesses, maxWrong = 3 }) => {
  // Render the game statistics
  return (
    <div className="flex justify-center gap-6 mb-6">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-400">{score}</div>
        <div className="text-sm text-gray-400 uppercase tracking-wider">Score</div>
      </div>

      <div className="text-center">
        <div className={`text-2xl font-bold ${wrongGuesses >= maxWrong ? 'text-red-400' : 'text-yellow-400'}`}>
          {wrongGuesses}/{maxWrong}
        </div>
        <div className="text-sm text-gray-400 uppercase tracking-wider">Wrong</div>
      </div>
    </div>
  );
};

export default GameStats;