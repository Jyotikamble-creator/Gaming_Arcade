// This component displays the statistics for the Word Scramble game mode.
export default function WordScrambleStats({ attempts, correct, showAnswer }) {
  // Render the game statistics display
  return (
    <div className="flex justify-center gap-6 mb-8">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
        <span className="text-sm font-medium text-gray-300">ATTEMPTS</span>
        <div className="text-2xl font-bold text-white">{attempts}</div>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
        <span className="text-sm font-medium text-gray-300">STATUS</span>
        <div className="text-lg font-bold text-white">
          {correct ? 'Correct!' : showAnswer ? 'Revealed' : 'Guessing...'}
        </div>
      </div>
    </div>
  );
}