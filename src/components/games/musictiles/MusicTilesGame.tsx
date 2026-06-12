// Music Tiles Game Component
'use client';

import React from 'react';
import { MusicTile, MusicTilesConfig } from '@/types/games/music-tiles';

interface MusicTilesGameProps {
  tiles: MusicTile[];
  config: MusicTilesConfig;
  onLanePress: (lane: number) => void;
  isPlaying: boolean;
}

export default function MusicTilesGame({ tiles, config, onLanePress, isPlaying }: MusicTilesGameProps) {
  const { numLanes, hitZoneStart, hitZoneEnd, perfectZoneStart, perfectZoneEnd } = config;

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-gray-900/80 rounded-lg overflow-hidden" style={{ height: '500px' }}>
      {/* Game lanes */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: numLanes }).map((_, laneIndex) => (
          <div
            key={laneIndex}
            className="flex-1 border-r border-gray-700 last:border-r-0 relative"
            style={{ cursor: isPlaying ? 'pointer' : 'default' }}
          >
            {/* Lane background */}
            <div className="absolute inset-0 bg-linear-to-b from-gray-800/30 to-gray-800/10" />

            {/* Hit zone indicator */}
            <div
              className="absolute inset-x-0 bg-blue-500/20 border-y border-blue-500/40"
              style={{
                top: `${hitZoneStart}%`,
                height: `${hitZoneEnd - hitZoneStart}%`,
              }}
            />

            {/* Perfect zone indicator */}
            <div
              className="absolute inset-x-0 bg-yellow-500/20 border-y border-yellow-500/50"
              style={{
                top: `${perfectZoneStart}%`,
                height: `${perfectZoneEnd - perfectZoneStart}%`,
              }}
            />

            {/* Tiles in this lane */}
            {tiles
              .filter(tile => tile.lane === laneIndex && !tile.hit)
              .map(tile => (
                <div
                  key={tile.id}
                  className={`absolute inset-x-0 mx-1 rounded transition-all ${
                    tile.hit ? 'bg-green-500 scale-110' : 'bg-blue-500'
                  }`}
                  style={{
                    top: `${tile.position}%`,
                    height: '8%',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                  }}
                />
              ))}

            {/* Lane press button */}
            {isPlaying && (
              <button
                onClick={() => onLanePress(laneIndex)}
                className="absolute inset-0 hover:bg-white/5 active:bg-white/20 transition-colors focus:outline-none"
                aria-label={`Lane ${laneIndex + 1}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Hit zone label */}
      <div
        className="absolute inset-x-0 text-center text-xs text-gray-400 pointer-events-none"
        style={{ top: `${(hitZoneStart + hitZoneEnd) / 2}%` }}
      >
        Hit Zone
      </div>
    </div>
  );
}
