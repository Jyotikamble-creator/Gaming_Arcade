"use client";

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'white' | 'blue' | 'purple' | 'green';
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'white', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12', 
    xl: 'w-16 h-16'
  };
  
  const colorClasses = {
    white: 'border-white',
    blue: 'border-blue-500',
    purple: 'border-purple-500',
    green: 'border-green-500'
  };
  
  return (
    <div className={`inline-block ${className}`}>
      <div 
        className={`animate-spin rounded-full border-2 border-t-transparent ${
          sizeClasses[size]
        } ${
          colorClasses[color]
        }`}
        style={{ borderTopColor: 'transparent' }}
      />
    </div>
  );
}