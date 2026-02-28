import React from 'react';

interface Problem {
  question: string;
  answer: number;
  operation: string;
}

interface Props {
  problem: Problem;
  userAnswer: string;
  setUserAnswer: (v: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  feedback?: string;
}

const SpeedMathProblem: React.FC<Props> = ({
  problem,
  userAnswer,
  setUserAnswer,
  onSubmit,
  onSkip,
  onKeyPress,
  feedback
}) => {
  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
      <div className="text-center mb-8">
        <div className="text-6xl md:text-7xl font-bold text-white mb-4 tracking-wider">
          {problem.question} = ?
        </div>
        <div className="h-6">
          {feedback && (
            <div
              className={`text-lg font-semibold ${
                feedback.includes('Correct')
                  ? 'text-green-400'
                  : feedback.includes('Wrong')
                  ? 'text-red-400'
                  : 'text-yellow-400'
              }`}
            >
              {feedback}
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Type your answer..."
          autoFocus
          className="w-full bg-gray-700/50 border-2 border-purple-500/50 text-white text-3xl text-center p-4 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-500"
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={onSkip}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
        >
          Skip
        </button>
        <button
          onClick={onSubmit}
          disabled={!userAnswer.trim()}
          className="flex-1 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
        >
          Submit ✓
        </button>
      </div>

      <div className="text-center mt-4 text-gray-400 text-sm">
        Press <kbd className="px-2 py-1 bg-gray-700 rounded">Enter</kbd> to submit
      </div>
    </div>
  );
};

export default SpeedMathProblem;