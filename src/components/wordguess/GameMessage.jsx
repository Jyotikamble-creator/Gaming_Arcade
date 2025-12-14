// This component displays game messages for the Word Guess game mode, indicating win/loss status and revealing the correct word if necessary.
const GameMessage = ({ message, word, showWord }) => {
  if (!message) return null;
// determine if it's a win or game over
  const isWin = message.toLowerCase().includes('win');
  const isGameOver = message.toLowerCase().includes('game over');

  // render the message with appropriate styling
  return (
    <div className={`text-center p-4 rounded-lg mb-6 ${
      isWin
        ? 'bg-green-900/50 border border-green-700'
        : isGameOver
          ? 'bg-red-900/50 border border-red-700'
          : 'bg-blue-900/50 border border-blue-700'
    }`}>
      <div className={`text-xl font-bold mb-2 ${
        isWin ? 'text-green-400' : isGameOver ? 'text-red-400' : 'text-blue-400'
      }`}>
        {message}
      </div>
      {showWord && word && (
        <div className="text-lg text-gray-300">
          The word was: <span className="font-mono font-bold text-white">{word}</span>
        </div>
      )}
    </div>
  );
};

export default GameMessage;