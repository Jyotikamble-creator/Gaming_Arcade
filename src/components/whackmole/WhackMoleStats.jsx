// This component displays the Whack-a-Mole game statistics including score, time left, and game status
const WhackMoleStats = ({ score, timeLeft, gameStatus }) => {
  // Render the stats display
  return (
    <div className="flex justify-center gap-6 mb-8">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
        <span className="text-sm font-medium text-gray-300">SCORE</span>
        <div className="text-2xl font-bold text-white">{score}</div>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
        <span className="text-sm font-medium text-gray-300">TIME LEFT</span>
        <div className="text-2xl font-bold text-white">{timeLeft}s</div>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
        <span className="text-sm font-medium text-gray-300">STATUS</span>
        <div className="text-lg font-bold text-white">{gameStatus}</div>
      </div>
    </div>
  );
};

export default WhackMoleStats;