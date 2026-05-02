'use client';

import React from 'react';
import AnimatedBackground from '@/components/AnimatedBackground';
import SettingsPage from '@/components/settings/SettingsPage';

export default function SettingsRoute() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10">
        <SettingsPage />
      </div>
    </div>
  );
}
