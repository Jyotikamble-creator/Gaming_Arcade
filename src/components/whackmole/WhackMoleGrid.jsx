// This component renders the Whack-a-Mole game grid with interactive mole holes
const WhackMoleGrid = ({ grid, active, gameStarted, gameEnded, onWhack }) => {
  // Render the grid of mole holes
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-6 shadow-2xl">
      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
        {/* Render each mole hole */}
        {grid.map(i => (
          <div
            key={i}
            onClick={() => onWhack(i)}
            className={`aspect-square rounded-xl border-4 border-gray-600 flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-105 ${i === active && gameStarted && !gameEnded
                ? 'bg-orange-500 border-orange-400 shadow-lg shadow-orange-500/50'
                : 'bg-gray-700 hover:bg-gray-600'
              }`}
          >
            {i === active && gameStarted && !gameEnded && (
              <div className="text-4xl animate-bounce">🐭</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhackMoleGrid;