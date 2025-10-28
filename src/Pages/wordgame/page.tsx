import React from 'react';
import Header from '../components/Header'; // Assuming Header is structured for reuse
import SidePanel from '../components/SidePanel';
import GameBoard from '../components/GameBoard';
import KeyBoard from '../components/KeyBoard';
import Leaderboard from '../components/Leaderboard';

const WordGamePage = () => {
  // Simple handler placeholder for keyboard interaction
  const handleKeyPress = (key) => {
    console.log(`Key pressed: ${key}`);
    // In a real app, this would update the game state
  };

  return (
    <div className="min-h-screen bg-dark-bg text-light-text">
      {/* Reusing the Header with WordGames title */}
      <Header /> 
      
      {/* Main Game Content Area */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: How to Play / Game Actions */}
          <div className="lg:col-span-3">
            <SidePanel />
          </div>

          {/* Center Column: Game Board and Keyboard */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="max-w-md w-full">
                <GameBoard />
            </div>
            <div className="mt-8 max-w-lg w-full">
                <KeyBoard onKeyPress={handleKeyPress} />
            </div>
          </div>

          {/* Right Panel: Leaderboard */}
          <div className="lg:col-span-3">
            <Leaderboard />
          </div>
        </div>
      </main>
    </div>
  );
};

export default WordGamePage;