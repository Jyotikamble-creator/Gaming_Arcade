// Modal displayed at the end of a Simon Says game, showing score and restart option.
interface SimonSaysGameOverModalProps {
  gameWon: boolean;
  round: number;
  onRestart: () => void;
}

const SimonSaysGameOverModal = ({ gameWon, round, onRestart }: SimonSaysGameOverModalProps): JSX.Element => {
  const score = gameWon ? 100 : (round - 1);

  // Render the modal
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
        <div className="text-6xl mb-4">{gameWon ? '🎉' : '😞'}</div>
        <h2 className="text-3xl font-bold mb-4">
          {gameWon ? 'Congratulations!' : 'Game Over'}
        </h2>
        <p className="text-gray-600 mb-2">
          {gameWon ? 'You completed all 10 rounds!' : `You reached round ${round}`}
        </p>
        <p className="text-4xl font-bold text-blue-600 mb-6">
          {score} points
        </p>
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

export default SimonSaysGameOverModal;