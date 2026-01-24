// Header component for the home page
import Link from 'next/link';
import Image from 'next/image';

// Displays logo, title, and navigation button.
export default function Header() {
  return (
    <header className="container mx-auto px-4 pt-6">
      <nav className="flex justify-around items-center">
        <div className="flex items-center">
          <Image 
            src="/images/logo.png" 
            alt="GameHub Logo" 
            width={64} 
            height={64} 
            className="rounded-full" 
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-50">GAME ARCHADE</h1>
        </div>

        <Link href="/pages/signup/signup">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300">
            Get Started
          </button>
        </Link>
      </nav>
    </header>
  );
}
