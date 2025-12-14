// QuestionCard component for Maths Quiz
import React, { useState } from 'react';
// Import TimerDisplay and ProgressBar components
import TimerDisplay from './TimerDisplay';
// Import ProgressBar component
import ProgressBar from './ProgressBar';

// QuestionCard component
const QuestionCard = ({ currentQ, totalQ, question, feedbackStatus }) => {
  const [answer, setAnswer] = useState('');

  // Example feedbackStatus: 'correct', 'incorrect', or 'none'
  const feedbackText = feedbackStatus === 'correct' ? 'Correct!' : feedbackStatus === 'incorrect' ? 'Incorrect, try again.' : '';
  const feedbackClass = feedbackStatus === 'correct' ? 'text-green-500' : 'text-red-500';
  // Render question card
  return (
    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 w-full max-w-lg mx-auto">

      {/* Top Bar: Question Count and Timer */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Question {currentQ} / {totalQ}
          </h3>
          <p className="text-sm text-subtle-text">
            Solve the problem below.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-subtle-text">Time Left:</span>
          <TimerDisplay minutes={1} seconds={25} /> {/* Hardcoded example time */}
        </div>
      </div>

      {/* Question Display */}
      <div className="text-center my-10">
        <p className="text-5xl font-extrabold text-white">
          {question}
        </p>
      </div>

      {/* Answer Input */}
      <div className="mb-4">
        <input
          type="number"
          placeholder="Your Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full bg-transparent border border-blue-500 text-white text-xl p-3 text-center rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 appearance-none"
          style={{ '::-webkit-inner-spin-button': { '-webkit-appearance': 'none' } }} // Removes default number input arrows
        />
      </div>

      {/* Feedback Message */}
      <p className={`text-center font-semibold text-sm h-6 ${feedbackClass}`}>
        {feedbackText}
      </p>

      {/* Progress Bar */}
      <ProgressBar current={currentQ} total={totalQ} />

    </div>
  );
};

export default QuestionCard;