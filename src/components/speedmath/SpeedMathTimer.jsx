// Component to display the speed math timer with dynamic color and progress bar
const SpeedMathTimer = ({ timeLeft }) => {
  const getTimerColor = () => {
    if (timeLeft > 30) return 'text-green-400';
    if (timeLeft > 10) return 'text-yellow-400';
    return 'text-red-400 animate-pulse';
  };

  // Determine progress bar color based on time left
  const getProgressColor = () => {
    if (timeLeft > 30) return 'bg-green-500';
    if (timeLeft > 10) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const progressPercentage = (timeLeft / 60) * 100;

  // Render the timer component
  return (
    <div className="mb-6">
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 font-medium">Time Remaining</span>
          <span className={`text-4xl font-bold ${getTimerColor()}`}>
            {timeLeft}s
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full ${getProgressColor()} transition-all duration-1000 ease-linear`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default SpeedMathTimer;
