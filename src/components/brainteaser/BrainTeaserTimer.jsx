// Component to display a timer for Brain Teaser game
// Displays the time remaining and a progress bar
export default function BrainTeaserTimer({ timeLeft, totalTime }) {
  
  const percentage = (timeLeft / totalTime) * 100;
  // Determine color based on time left
  const getColor = () => {
    if (percentage > 60) return 'bg-green-500';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Determine text color based on time left
  const getTextColor = () => {
    if (percentage > 60) return 'text-green-400';
    if (percentage > 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Render the timer
  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-purple-500/30 shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-300 font-semibold">Time Remaining</span>
        <span className={`text-3xl font-bold ${getTextColor()}`}>
          {timeLeft}s
        </span>
      </div>

      <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-300 ease-linear`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
