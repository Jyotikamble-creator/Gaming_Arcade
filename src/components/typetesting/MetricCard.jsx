// MetricCard component to display a metric with label, value, and optional unit
const MetricCard = ({ label, value, unit }) => {
  // Render the metric card
  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 h-32 flex flex-col justify-center">
      <p className="text-sm font-semibold text-subtle-text uppercase">{label}</p>
      <div className="flex items-end mt-2">
        <span className="text-5xl font-extrabold text-blue-500 leading-none">
          {value}
        </span>
        {unit && (
          <span className="text-xl font-bold text-blue-500 ml-1 leading-none">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;