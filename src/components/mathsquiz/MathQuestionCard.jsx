// MathQuestionCard component for displaying a math question and answer options
const MathQuestionCard = ({ question, options, onAnswer, feedbackStatus, selectedAnswer, correctAnswer }) => {
  // Render math question card
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-8 text-center shadow-2xl border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">{question}</h2>
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {options.map((option, i) => (
          <button
            key={i}
            onClick={() => onAnswer(option)}
            disabled={feedbackStatus !== 'none'}
            className={`font-bold py-4 px-6 rounded-xl transition-all duration-300 ${feedbackStatus === 'none'
                ? 'bg-blue-600 hover:bg-blue-700 hover:scale-105 shadow-lg'
                : option === correctAnswer
                  ? 'bg-green-500 shadow-lg ring-2 ring-green-300'
                  : selectedAnswer === option
                    ? 'bg-red-500 shadow-lg ring-2 ring-red-300'
                    : 'bg-gray-600 shadow-lg'
              } text-white`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MathQuestionCard;