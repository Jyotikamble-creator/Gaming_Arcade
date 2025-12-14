// This component displays a modal when the Whack-a-Mole game is over, showing the final score and a button to restart the game.
const WhackMoleGameOverModal = ({ score, onRestart }) => {
  // Render the modal
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-green-600 mb-4">Game Over!</h2>
        <p className="text-gray-600 mb-2">Your final score:</p>
        <p className="text-4xl font-bold text-blue-600 mb-6">{score} points</p>
        <button
          onClick={onRestart}
          className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default WhackMoleGameOverModal;