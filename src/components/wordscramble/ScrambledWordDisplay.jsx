// This component displays the scrambled word in the Word Scramble game mode.

const ScrambledWordDisplay = ({ scrambled }) => {
  // Render the scrambled word display
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-6 text-center shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-4">Scrambled Word:</h2>
      <div className="text-4xl font-mono font-bold text-yellow-400 mb-6 tracking-wider">
        {/* Display each letter in the scrambled word */}
        {scrambled.split('').map((letter, i) => (
          <span key={i} className="inline-block mx-1 p-2 bg-gray-700 rounded-lg">
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ScrambledWordDisplay;