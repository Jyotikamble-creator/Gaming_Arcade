import React from 'react';
import Card from './components/Card';
// Assuming the hero image is in src/assets/hero-image.png
import heroImage from './assets/hero-image.png'; 

const games = [
  { icon: 'T', title: 'Word Guess', description: 'Guess the hidden word in six tries.' },
  { icon: '🧠', title: 'Memory Match', description: 'Test your memory by matching pairs.' }, // 🧠 represents the icon placeholder
  { icon: '➕', title: 'Math Quiz', description: 'Solve quick-fire math problems.' },
  { icon: '⌨️', title: 'Typing Test', description: 'Improve your typing speed and accuracy.' },
];

const HomePage = () => {
  return (
    <main>
      {/* 1. Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Image Side */}
          <div className="w-full h-80 lg:h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
             {/* The image in the design looks like a 3D blob, a placeholder gradient works well */}
             <span className="text-white text-3xl p-8">Abstract Image Placeholder</span>
          </div>

          {/* Text Side */}
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-light-text leading-tight mb-4">
              Welcome to Your <span className="text-primary-blue">Daily Dose</span> of Fun.
            </h1>
            <p className="text-xl text-subtle-text mb-8">
              Challenge your mind with our collection of simple and engaging web games.
            </p>
            <button className="bg-primary-blue hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300 transform hover:scale-105">
              Explore All Games
            </button>
          </div>
        </div>
      </section>

      <div className="h-px bg-gray-700 container mx-auto px-4"></div>

      {/* 2. Challenge Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-light-text mb-10">
          Choose Your Challenge
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game, index) => (
            <Card 
              key={index} 
              icon={game.icon} 
              title={game.title} 
              description={game.description} 
            />
          ))}
        </div>
      </section>
    </main>
  );
};

export default HomePage;