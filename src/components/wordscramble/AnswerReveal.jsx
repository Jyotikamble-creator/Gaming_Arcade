// This component reveals the correct answer in the Word Scramble game mode.
const AnswerReveal = ({ word }) => {
  // Render the answer reveal display
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 text-center shadow-2xl">
      <h3 className="text-xl font-bold text-white mb-2">The Word Was:</h3>
      <div className="text-3xl font-mono font-bold text-green-400">
        {word}
      </div>
    </div>
  );
};

export default AnswerReveal;