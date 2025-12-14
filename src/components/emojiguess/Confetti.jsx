// A React component that displays confetti animation when triggered.
import React, { useEffect, useState } from 'react';

// Confetti component that shows confetti animation when 'show' is true.
const Confetti = ({ show }) => {
  const [particles, setParticles] = useState([]);

  // Generate confetti particles when 'show' changes to true.
  useEffect(() => {
    if (show) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        rotation: Math.random() * 360,
        color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'][Math.floor(Math.random() * 8)],
        size: Math.random() * 8 + 4,
        speed: Math.random() * 3 + 2,
        rotationSpeed: Math.random() * 10 - 5
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => setParticles([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show) return null;

  // Render confetti particles.
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            transform: `rotate(${particle.rotation}deg)`,
            animation: `confetti-fall ${particle.speed}s linear forwards`
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;