import React, { useState } from 'react';
import Header from '../components/Header';
import Card from '../components/Card';
import VictoryModal from '../components/VictoryModal';
import GameStats from '../components/GameStats';

// Simplified Card Data (4x4 grid = 8 pairs)
const initialCards = [
    { id: 1, imageId: 1, isFlipped: false, isMatched: false },
    { id: 2, imageId: 2, isFlipped: false, isMatched: false },
    { id: 3, imageId: 3, isFlipped: false, isMatched: false },
    { id: 4, imageId: 4, isFlipped: false, isMatched: false },
    { id: 5, imageId: 1, isFlipped: false, isMatched: true }, // Matched card example
    { id: 6, imageId: 2, isFlipped: false, isMatched: true }, // Matched card example
    { id: 7, imageId: 3, isFlipped: true, isMatched: false },  // Flipped card example
    { id: 8, imageId: 4, isFlipped: true, isMatched: false },  // Flipped card example
    // ... add 8 more cards for a 4x4 grid (16 cards total)
    // NOTE: For the sake of the blurred background, we'll only show the relevant few
];

const cardsToRender = initialCards.slice(0, 16); // Simulate a 4x4 grid

const MemoryGamePage = () => {
  const [cards, setCards] = useState(cardsToRender);
  const [moves, setMoves] = useState(42); // Example value from the image
  const [time, setTime] = useState('02:15'); // Example value
  const [showModal, setShowModal] = useState(true); // Set to true to display the victory screen

  const handleCardClick = (id) => {
    // Game logic for flipping cards goes here
    console.log(`Card ${id} clicked.`);
  };

  const handlePlayAgain = () => {
    console.log("Starting a new game.");
    // Logic to reset game state and hide modal
    setShowModal(false);
  };

  const handleBackToAllGames = () => {
    console.log("Navigating back to the home page.");
    // Logic for routing
  };

  return (
    <div className="min-h-screen bg-dark-bg text-light-text relative overflow-hidden">
      <Header />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-white mb-2">Memory Card Challenge</h1>
        <p className="text-subtle-text mb-8">Match all the pairs to win the game!</p>

        <div className="flex justify-between items-start">
            <GameStats moves={moves} time={time} />
            <button className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
                Restart Game
            </button>
        </div>
        
        {/* Game Board (4x4 Grid Example) */}
        <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto mt-4">
            {cards.map((card) => (
                <Card 
                    key={card.id} 
                    {...card} 
                    onClick={handleCardClick}
                />
            ))}
        </div>
      </main>

      {/* Victory Modal - Conditionally rendered */}
      {showModal && (
        <VictoryModal 
          moves={moves}
          minutes={2} // Passing discrete time values for modal
          seconds={15}
          onPlayAgain={handlePlayAgain}
          onBackToAllGames={handleBackToAllGames}
        />
      )}
      
      {/* Apply a blur effect to the background when the modal is shown */}
      {showModal && (
        <div className="absolute inset-0 bg-dark-bg z-40" style={{ filter: 'blur(3px)' }}></div>
      )}
    </div>
  );
};

export default MemoryGamePage;


import React from 'react';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import MemoryCard from '../components/MemoryCard';
import GameMetrics from '../components/GameMetrics';

// Example data structure for a 4x4 grid (16 cards)
const cardData = [
  { id: 1, content: 'A', isFlipped: false, isMatched: false },
  { id: 2, content: 'B', isFlipped: true, isMatched: false }, // Flipped
  { id: 3, content: 'C', isFlipped: false, isMatched: false },
  { id: 4, content: 'D', isFlipped: false, isMatched: false },
  { id: 5, content: 'E', isFlipped: false, isMatched: false },
  { id: 6, content: 'F', isFlipped: false, isMatched: false },
  { id: 7, content: 'G', isFlipped: false, isMatched: false },
  { id: 8, content: 'H', isFlipped: false, isMatched: false },
  { id: 9, content: 'A', isFlipped: false, isMatched: false },
  { id: 10, content: 'B', isFlipped: false, isMatched: false },
  { id: 11, content: 'C', isFlipped: false, isMatched: false },
  { id: 12, content: 'D', isFlipped: false, isMatched: false },
  { id: 13, content: 'E', isFlipped: true, isMatched: true }, // Matched/Revealed Example
  { id: 14, content: 'F', isFlipped: true, isMatched: true }, // Matched/Revealed Example
  { id: 15, content: 'G', isFlipped: false, isMatched: false },
  { id: 16, content: 'H', isFlipped: false, isMatched: false },
];

const breadcrumbPath = [
    { label: 'Games', link: '/' },
    { label: 'Memory Card', link: '/memorycard' },
];

const MemoryGamePage = () => {
  return (
    <div className="min-h-screen bg-dark-bg text-light-text">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        
        <Breadcrumbs path={breadcrumbPath} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left/Center Column: Game Board (takes up most space) */}
          <div className="lg:col-span-8 flex justify-center">
            {/* Game Board (4x4 Grid Container) */}
            <div className="grid grid-cols-6 gap-3 max-w-4xl">
              {cardData.slice(0, 6).map((card) => (
                <MemoryCard 
                  key={card.id} 
                  isFlipped={card.isFlipped}
                  isMatched={card.isMatched}
                  imageContent={card.content}
                />
              ))}
               {cardData.slice(12, 14).map((card) => (
                <MemoryCard 
                  key={card.id} 
                  isFlipped={card.isFlipped}
                  isMatched={card.isMatched}
                  imageContent={card.content}
                />
              ))}
            </div>
          </div>
          
          {/* Right Column: Game Info and Controls */}
          <div className="lg:col-span-4 bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700 h-fit">
            <h2 className="text-3xl font-extrabold text-white mb-2">Memory Card</h2>
            <p className="text-subtle-text mb-6">Flip the cards and match the pairs.</p>

            <GameMetrics moves={12} time="0:34" />
            
            <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-md transition duration-200 shadow-md">
                <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.836 10H20v-5m-1.582-7.143a9.002 9.002 0 00-16.035 4.793m16.035-4.793a9.002 9.002 0 01-16.035 4.793"></path></svg>
                Restart Game
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MemoryGamePage;