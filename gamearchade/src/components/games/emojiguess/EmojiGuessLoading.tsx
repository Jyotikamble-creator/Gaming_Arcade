import React from 'react';
import { motion } from 'framer-motion';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function EmojiGuessLoading() {
  const emojis = ['🎯', '🎲', '🎮', '🤔', '🚀'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden flex items-center justify-center">
      <AnimatedBackground />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center"
      >
        <div className="mb-8">
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🤔
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Loading Emoji Puzzle...
          </h2>
          <p className="text-white/70">
            Get ready for some emoji fun!
          </p>
        </div>
        
        <div className="flex justify-center gap-2 mb-8">
          {emojis.map((emoji, index) => (
            <motion.div
              key={index}
              className="text-2xl"
              animate={{ 
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2
              }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>
        
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
      </motion.div>
    </div>
  );
}