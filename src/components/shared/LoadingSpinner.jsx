import React from 'react';

/**
 * Loading spinner component
 */
const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-light-text">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;