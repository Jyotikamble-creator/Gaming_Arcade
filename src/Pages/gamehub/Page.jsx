import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GameCard from '../components/GameCard';

// Reusing the game data defined above
const games = [
    { title: "Word Guess", description: "Guess the hidden word before you run out of tries.", image: "/assets/game_images/word-guess.png" },
    { title: "Memory Card", description: "Put your memory to the test and match all the pairs.", image: "/assets/game_images/memory-card.png" },
    { title: "Math Quiz", description: "Solve math problems against the clock. How fast are you?", image: "/assets/game_images/math-quiz.png" },
    { title: "Typing Test", description: "Find out your words-per-minute with this typing challenge.", image: "/assets/game_images/typing-test.png" },
    { title: "Snake Classic", description: "The timeless classic: eat, grow, and avoid the walls!", image: "/assets/game_images/snake.png" },
    { title: "Tic-Tac-Toe", description: "Challenge a friend or our AI to a game of X's and O's.", image: "/assets/game_images/tictactoe.png" },
    { title: "Jigsaw Puzzle", description: "Relax and piece together beautiful high-resolution images.", image: "/assets/game_images/jigsaw.png" },
    { title: "Block Tower", description: "Stack the blocks as high as you can without toppling them.", image: "/assets/game_images/block-tower.png" },
];

const GamesHubPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-dark-bg text-light-text">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-16">
        
        {/* Hero Text */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-white mb-3">Explore Our Games</h1>
          <p className="text-xl text-subtle-text">
            Challenge yourself with our collection of fun and engaging games.
          </p>
        </div>
        
        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {games.map((game, index) => (
            <GameCard 
              key={index}
              title={game.title}
              description={game.description}
              image={game.image}
            />
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default GamesHubPage;