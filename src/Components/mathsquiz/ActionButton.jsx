import React from 'react';

const ActionButtons = ({ onSkip, onSubmit }) => {
  return (
    <div className="flex justify-center space-x-4 mt-6">
      <button 
        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2.5 px-6 rounded-lg transition duration-200"
        onClick={onSkip}
      >
        Skip Question
      </button>
      <button 
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-8 rounded-lg transition duration-200"
        onClick={onSubmit}
      >
        Submit
      </button>
    </div>
  );
};

export default ActionButtons;