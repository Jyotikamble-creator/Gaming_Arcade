import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const games = [
  { name: 'Word Guess', path: '/word-guess' },
  { name: 'Memory Card', path: '/memory-card' },
  { name: 'Math Quiz', path: '/math-quiz' },
  { name: 'Typing Test', path: '/typing-test' },
  { name: '2048', path: '/2048' },
  { name: 'Word Scramble', path: '/word-scramble' },
  { name: 'Quiz', path: '/quiz' },
  { name: 'Emoji Guess', path: '/emoji-guess' },
  { name: 'Whack Mole', path: '/whack-a-mole' },
  { name: 'Simon Says', path: '/simon-says' },
  { name: 'Tic Tac Toe', path: '/tic-tac-toe' },
  { name: 'Sudoku', path: '/sudoku' },
  { name: 'Word Builder', path: '/word-builder' },
  { name: 'Speed Math', path: '/speed-math' },
  { name: 'Hangman', path: '/hangman' },
  { name: 'Coding Puzzle', path: '/coding-puzzle' },
  { name: 'Reaction Time', path: '/reaction-time' },
];

const Sidebar = () => {
  const nav = useNavigate();

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    nav('/');
  }

  return (
    <div className="w-64 bg-gray-800 p-4 border-r border-gray-700">
      <h2 className="text-xl font-bold mb-6 text-white">Game Hub</h2>
      <nav>
        <ul className="space-y-2">
          {games.map((game, i) => (
            <li key={i}>
              <Link
                to={game.path}
                className="block py-2 px-3 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
              >
                {game.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-8 pt-4 border-t border-gray-700 space-y-3">
        <Link
          to="/profile"
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 text-center"
        >
          👤 My Profile
        </Link>
        <button
          onClick={logout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;