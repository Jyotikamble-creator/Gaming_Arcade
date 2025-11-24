import React from 'react';

const VictoryModal = ({ moves, minutes, seconds, onPlayAgain, onBackToAllGames }) => {
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  return (
    // Full screen overlay for the modal
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      
      {/* Modal Content Box */}
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border-2 border-gray-700 w-full max-w-sm transform scale-100 transition-transform duration-300">
        
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          {/* Placeholder for the "check-in-circle" icon */}
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-white text-center mb-3">
          Congratulations!
        </h2>
        
        <p className="text-center text-subtle-text mb-8">
          You completed the game in **{moves} moves** and **{timeString} minutes**.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md"
            onClick={onPlayAgain}
          >
            Play Again
          </button>
          <button 
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md"
            onClick={onBackToAllGames}
          >
            Back to All Games
          </button>
        </div>
      </div>
    </div>
  );
};

export default VictoryModal;