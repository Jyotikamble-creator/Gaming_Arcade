import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameAchievements {
  firstWin: boolean;
  streak5: boolean;
  streak10: boolean;
  perfectGame: boolean;
}

interface EmojiGuessAchievementsProps {
  achievements: GameAchievements;
}

export default function EmojiGuessAchievements({ achievements }: EmojiGuessAchievementsProps) {
  const achievementList = [
    {
      key: 'firstWin',
      icon: '🏆',
      title: 'First Win',
      description: 'Correct your first emoji puzzle',
      unlocked: achievements.firstWin,
    },
    {
      key: 'streak5',
      icon: '🔥',
      title: 'On Fire',
      description: 'Win 5 puzzles in a row',
      unlocked: achievements.streak5,
    },
    {
      key: 'streak10',
      icon: '💫',
      title: 'Unstoppable',
      description: 'Win 10 puzzles in a row',
      unlocked: achievements.streak10,
    },
    {
      key: 'perfectGame',
      icon: '⭐',
      title: 'Perfect Game',
      description: 'Win without using any hints',
      unlocked: achievements.perfectGame,
    },
  ];

  const unlockedAchievements = achievementList.filter(achievement => achievement.unlocked);

  if (unlockedAchievements.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <h3 className="text-white text-lg font-semibold mb-3 text-center">
        🏆 Achievements Unlocked
      </h3>
      <div className="flex flex-wrap justify-center gap-2">
        <AnimatePresence>
          {unlockedAchievements.map((achievement) => (
            <motion.div
              key={achievement.key}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 10 }}
              className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/50 rounded-lg p-3 text-center min-w-[120px]"
            >
              <div className="text-2xl mb-1">{achievement.icon}</div>
              <div className="text-yellow-200 text-sm font-medium">
                {achievement.title}
              </div>
              <div className="text-yellow-300/70 text-xs">
                {achievement.description}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}