import React from 'react';

const Footer = () => {
  return (
    <footer className="container mx-auto px-4 py-8 border-t border-gray-700 mt-16 text-subtle-text">
      <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0">
        
        {/* Links */}
        <div className="space-x-8">
          <a href="#" className="hover:text-primary-blue transition duration-200">About</a>
          <a href="#" className="hover:text-primary-blue transition duration-200">Contact</a>
        </div>
        
        {/* Social Icons (Placeholder: replace with actual SVG/Icon Library components) */}
        <div className="flex space-x-6 text-xl">
          <a href="#" aria-label="Facebook" className="hover:text-primary-blue transition duration-200">
            <i className="fab fa-facebook-f">f</i> 
          </a>
          <a href="#" aria-label="Twitter" className="hover:text-primary-blue transition duration-200">
            <i className="fab fa-twitter">t</i>
          </a>
          <a href="#" aria-label="Instagram" className="hover:text-primary-blue transition duration-200">
            <i className="fab fa-instagram">i</i>
          </a>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="text-center text-sm mt-8">
        &copy; 2024 GameHub. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;