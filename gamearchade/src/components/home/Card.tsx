// This component represents the main content section of the home page.
// It provides an overview of available games and navigation options.

interface Game {
  icon: string;
  title: string;
  description: string;
}

const games: Game[] = [
  {
    icon: '🎯',
    title: 'Word Guess',
    description: 'Guess the hidden word in six tries.',
  },
  {
    icon: '🧠',
    title: 'Memory Match',
    description: 'Test your memory by matching pairs.',
  },
  {
    icon: '➕',
    title: 'Math Quiz',
    description: 'Solve quick-fire math problems.',
  },
  {
    icon: '⌨️',
    title: 'Typing Test',
    description: 'Improve your typing speed and accuracy.',
  },
];

export default function Card() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Welcome Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-slate-50 mb-4">
          Welcome to <span className="text-blue-500">Game Arcade</span>
        </h1>
        <p className="text-xl text-slate-400 mb-8">
          Discover fun and engaging games to challenge your mind and enjoy your time!
        </p>
        <div className="flex justify-center gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300">
            Explore Games
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300">
            Get Started
          </button>
        </div>
      </div>

      {/* Popular Games Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-slate-50 text-center mb-8">Popular Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game, index) => (
            <div 
              key={index}
              className="bg-slate-800 p-6 rounded-lg shadow-xl text-center hover:shadow-2xl transition duration-300"
            >
              <div className="text-4xl mb-4">{game.icon}</div>
              <h3 className="text-xl font-semibold text-slate-50 mb-2">{game.title}</h3>
              <p className="text-slate-400">{game.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
