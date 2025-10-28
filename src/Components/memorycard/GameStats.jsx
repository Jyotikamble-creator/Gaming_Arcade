import React from 'react';

const GameStats = ({ moves, time }) => {
  return (
    <div className="flex space-x-12 mb-8 items-center">
      
      {/* Moves Counter */}
      <div>
        <h3 className="text-4xl font-extrabold text-blue-400">{moves}</h3>
        <p className="text-sm uppercase tracking-wider text-subtle-text">Moves</p>
      </div>

      {/* Time Counter */}
      <div>
        <h3 className="text-4xl font-extrabold text-blue-400">{time}</h3>
        <p className="text-sm uppercase tracking-wider text-subtle-text">Time</p>
      </div>

    </div>
  );
};

export default GameStats;