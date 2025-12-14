// Header component for the home page
import { Link } from 'react-router-dom';

// Displays logo, title, and navigation button.
export default function Header() {
  return (
    <header className="container mx-auto px-4 pt-6">
      <nav className="flex justify-around items-center">
        <div className="flex items-center">
          <img src="/images/logo.png" alt="GameHub Logo" className="w-16 h-16 rounded-full" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-light-text">GAME ARCHADE</h1>
        </div>

        <Link to="/signup">
          <button className="bg-primary-blue hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300">
            Get Started
          </button>
        </Link>

      </nav>
    </header>
  );
}