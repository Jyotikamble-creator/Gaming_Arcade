// Music Tiles Game Stats Display
import React from 'react';
import { MusicTilesStats } from '@/types/games/music-tiles';

interface MusicTilesStatsProps {
  stats: MusicTilesStats;
  timeElapsed: number;
  timeLimit: number;
}

export default function MusicTilesStatsDisplay({ stats, timeElapsed, timeLimit }: MusicTilesStatsProps) {
  const timeRemaining = Math.max(0, timeLimit - timeElapsed);

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'S': return 'text-yellow-400';
      case 'A': return 'text-green-400';
      case 'B': return 'text-blue-400';
      case 'C': return 'text-purple-400';
      case 'D': return 'text-orange-400';
      default: return 'text-red-400';
    }
  };

  const getComboColor = (combo: number) => {
    if (combo >= 50) return 'text-yellow-400';
    if (combo >= 30) return 'text-orange-400';
    if (combo >= 20) return 'text-green-400';
    if (combo >= 10) return 'text-blue-400';
    return 'text-white';
  };

  return (
    <div className="bg-gray-800/60 rounded-lg p-4 mb-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-sm text-gray-400">Score</div>
          <div className="text-2xl font-bold text-white">{stats.score.toLocaleString()}</div>
        </div>

        <div>
          <div className="text-sm text-gray-400">Combo</div>
          <div className={`text-2xl font-bold ${getComboColor(stats.combo)}`}>
            {stats.combo}x
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-400">Accuracy</div>
          <div className="text-2xl font-bold text-white">{stats.accuracy}%</div>
        </div>

        <div>
          <div className="text-sm text-gray-400">Time</div>
          <div className="text-2xl font-bold text-white">{timeRemaining}s</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="text-gray-400">Hits</div>
          <div className="text-green-400 font-semibold">{stats.hits}</div>
        </div>

        <div>
          <div className="text-gray-400">Perfect</div>
          <div className="text-yellow-400 font-semibold">{stats.perfectHits}</div>
        </div>

        <div>
          <div className="text-gray-400">Misses</div>
          <div className="text-red-400 font-semibold">{stats.misses}</div>
        </div>
      </div>

      {stats.maxCombo > 0 && (
        <div className="mt-3 text-center">
          <span className="text-sm text-gray-400">Max Combo: </span>
          <span className="text-yellow-400 font-semibold">{stats.maxCombo}x</span>
          <span className="ml-4 text-sm text-gray-400">Grade: </span>
          <span className={`font-bold text-lg ${getPerformanceColor(stats.performance)}`}>
            {stats.performance}
          </span>
        </div>
      )}
    </div>
  );
}
