// TowerStats component to display game statistics
import React from 'react';
import { TowerStatsProps } from '../../../../src/types/towerStacker';

export default function TowerStats({ score, level, perfectDrops, highestLevel }: TowerStatsProps): JSX.Element {
  return (
    <div className="bg-gray-800/50 rounded-lg p-6 mb-6 border border-gray-700">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-subtle-text text-sm mb-1">Score</p>
          <p className="text-2xl font-bold text-blue-400">{score}</p>
        </div>
        <div>
          <p className="text-subtle-text text-sm mb-1">Level</p>
          <p className="text-2xl font-bold text-green-400">{level}</p>
        </div>
        <div>
          <p className="text-subtle-text text-sm mb-1">Perfect Combo</p>
          <p className="text-2xl font-bold text-purple-400">{perfectDrops}</p>
        </div>
        <div>
          <p className="text-subtle-text text-sm mb-1">Best Level</p>
          <p className="text-2xl font-bold text-yellow-400">{highestLevel}</p>
        </div>
      </div>
    </div>
  );
}