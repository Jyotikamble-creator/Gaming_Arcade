import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiProps {
  show: boolean;
}

export default function Confetti({ show }: ConfettiProps) {
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'][Math.floor(Math.random() * 6)],
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 1,
    x: Math.random() * 100,
    rotation: Math.random() * 360,
  }));

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confettiPieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                y: -20,
                x: `${piece.x}vw`,
                rotate: piece.rotation,
                opacity: 1,
              }}
              animate={{
                y: '110vh',
                rotate: piece.rotation + 180,
                opacity: 0,
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: 'easeIn',
              }}
              className="absolute w-3 h-3 rounded-sm"
              style={{ backgroundColor: piece.color }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}