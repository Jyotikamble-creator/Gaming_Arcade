"use client";

// Header component for the home page
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Displays logo, title, and navigation button.
export default function Header() {
  const router = useRouter();

  // Always navigate to the auth page first; `auth` page will
  // redirect authenticated users to their dashboard.
  const handleGetStarted = () => {
    router.push('/pages/auth');
  };

  return (
    <header className="container mx-auto px-4 pt-6">
      <nav className="flex justify-around items-center">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">GA</span>
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-light-text">GAME ARCHADE</h1>
        </div>

        <button onClick={handleGetStarted} className="bg-primary-blue hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300">
          Get Started
        </button>
      </nav>
    </header>
  );
}
