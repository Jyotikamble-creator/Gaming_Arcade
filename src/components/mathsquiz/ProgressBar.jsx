// ProgressBar component for Maths Quiz
const ProgressBar = ({ current, total }) => {
  const progressPercent = (current / total) * 100;
  // Render progress bar
  return (
    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden my-4">
      <div 
        className="h-full bg-blue-500 transition-all duration-300" 
        style={{ width: `${progressPercent}%` }}
        aria-valuenow={current}
        aria-valuemin="0"
        aria-valuemax={total}
      ></div>
    </div>
  );
};

export default ProgressBar;