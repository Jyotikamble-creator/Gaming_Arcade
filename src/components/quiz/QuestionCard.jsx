// Component to display a quiz question with multiple choice answers
const QuestionCard = ({ question, options, onAnswer, showResult, selectedAnswer, correctAnswer }) => {
  // Render question card
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-6 text-center shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6">{question}</h2>
      {/* Render answer options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {options.map((option, idx) => {
          let buttonClasses = 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg';

          if (showResult) {
            if (option === correctAnswer) {
              buttonClasses = 'bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg';
            } else if (option === selectedAnswer && option !== correctAnswer) {
              buttonClasses = 'bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg';
            } else {
              buttonClasses = 'bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg opacity-50';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => !showResult && onAnswer(option)}
              disabled={showResult}
              className={buttonClasses}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionCard;