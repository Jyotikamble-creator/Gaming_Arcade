"use client";

import React from 'react';
import { motion } from 'framer-motion';
import type { MinesweeperGame } from '@/types/games/minesweeper';
import { formatMinesweeperTime } from '@/utility/games/minesweeper';

interface MinesweeperStatsProps {
  gameTime: number;
  game: MinesweeperGame | null;
}

const MinesweeperStats: React.FC<MinesweeperStatsProps> = ({ gameTime, game }) => {
  if (!game) return null;

  const { config, flagsUsed, minesRemaining, cellsRevealed, status } = game;
  const totalCells = config.rows * config.cols;
  const safeCells = totalCells - config.mines;
  const progress = (cellsRevealed / safeCells) * 100;

  const stats = [
    {
      label: 'Time',
      value: formatMinesweeperTime(gameTime),
      icon: '⏱️',
      color: 'text-blue-400'
    },
    {
      label: 'Mines',
      value: `${minesRemaining} / ${config.mines}`,
      icon: '💣',
      color: 'text-red-400'
    },
    {
      label: 'Flags',
      value: flagsUsed.toString(),
      icon: '🚩',
      color: 'text-yellow-400'
    },
    {
      label: 'Progress',
      value: `${Math.round(progress)}%`,
      icon: '📊',
      color: 'text-green-400'
    },
    {
      label: 'Board',
      value: `${config.rows}×${config.cols}`,
      icon: '📏',
      color: 'text-purple-400'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="
            bg-white/10 backdrop-blur-lg rounded-lg p-4
            border border-white/20 hover:border-white/40
            transition-all duration-200 hover:scale-105
          "
        >
          <div className="text-center">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className={`text-lg font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-white/60 text-sm">
              {stat.label}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default MinesweeperStats;