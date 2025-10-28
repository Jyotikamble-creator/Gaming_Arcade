import React from 'react';
// Assuming Header and Footer are available
// import Header from './Header';
// import Footer from './Footer';

const Layout = ({ children }) => {
    return (
        // The main container ensuring a dark background and minimum height
        <div className="min-h-screen flex flex-col bg-dark-bg text-light-text">
            {/* If a reusable header is needed across pages, uncomment: */}
            {/* <Header /> */} 
            
            {/* Main content area, stretches to fill space */}
            <main className="flex-grow">
                {children}
            </main>
            
            {/* If a reusable footer is needed, uncomment: */}
            {/* <Footer /> */} 
        </div>
    );
};

export default Layout;