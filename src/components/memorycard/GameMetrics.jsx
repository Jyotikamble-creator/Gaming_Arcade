// GameMetrics component for Memory Card Game
const GameMetrics = ({ moves, time }) => {
  // Display moves and time taken
  return (
    <div className="space-y-4">
      <div className="flex justify-between pb-2 border-b border-gray-700">
        <span className="text-lg text-subtle-text">Moves</span>
        <span className="text-lg font-bold text-white">{moves}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-lg text-subtle-text">Time</span>
        <span className="text-lg font-bold text-white">{time}</span>
      </div>
    </div>
  );
};

export default GameMetrics;