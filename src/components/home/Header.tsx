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
    // BYPASSING AUTH - DIRECTLY GO TO DASHBOARD
    router.push('/dashboard');
  };

  return (
    <header className="container mx-auto px-4 pt-6">
      <nav className="flex justify-around items-center">
        <div className="flex items-center">
          <img src="/images/logo.png" alt="GameHub Logo" className="w-16 h-16 rounded-full" />
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
