import React from 'react';

const Header = () => {
  return (
    <header className="container mx-auto px-4 pt-6">
      <nav className="flex justify-between items-center">
        {/* Logo/Title */}
        <div className="flex items-center space-x-2">
          {/* Using a simple icon/shape placeholder for GameHub logo */}
          <svg className="w-6 h-6 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3a1 1 0 00-1-1H7a1 1 0 00-1 1v3a1 1 0 01-1 1H3a1 1 0 01-1-1v-3a1 1 0 011-1h3a1 1 0 001-1V9a1 1 0 00-1-1H3a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 011 1v1a1 1 0 001 1h3a1 1 0 001-1V4z"></path></svg>
          <span className="text-xl font-bold text-light-text">GameHub</span>
        </div>

        {/* Navigation Links */}
        <div className="space-x-8 hidden md:flex">
          <a href="#" className="hover:text-primary-blue transition duration-200">Home</a>
          <a href="#" className="hover:text-primary-blue transition duration-200">Word</a>
          <a href="#" className="hover:text-primary-blue transition duration-200">Memory</a>
          <a href="#" className="hover:text-primary-blue transition duration-200">Math</a>
        </div>
      </nav>
    </header>
  );
};

export default Header;