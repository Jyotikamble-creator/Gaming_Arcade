"use client";

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface BrainTeaserTimerProps {
  isRunning: boolean;
  onTimeUpdate: (time: number) => void;
}

export default function BrainTeaserTimer({
  isRunning,
  onTimeUpdate
}: BrainTeaserTimerProps) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setTime(prev => {
          const newTime = prev + 1;
          onTimeUpdate(newTime);
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, onTimeUpdate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-card-bg rounded-xl p-4 border border-gray-700">
      <div className="flex items-center gap-3">
        <Clock className="w-5 h-5 text-primary-blue" />
        <div>
          <p className="text-subtle-text text-sm">Time</p>
          <p className="text-light-text text-xl font-bold">{formatTime(time)}</p>
        </div>
      </div>
    </div>
  );
}