"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Home, 
  Trophy, 
  User, 
  Settings, 
  HelpCircle,
  LogOut,
  Gamepad2
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/dashboard'
  },
  {
    id: 'games',
    label: 'Games',
    icon: Gamepad2,
    path: '/dashboard'
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    icon: Trophy,
    path: '/pages/leaderboard'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/pages/profile'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/pages/settings'
  },
  {
    id: 'help',
    label: 'Help',
    icon: HelpCircle,
    path: '/pages/help'
  }
];

export default function Sidebar() {
  const [activeItem, setActiveItem] = React.useState('dashboard');

  return (
    <div className="w-64 bg-gray-900/80 backdrop-blur-xl border-r border-gray-700/50 min-h-screen">
      <div className="p-6">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">GA</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">GameArchade</h1>
            <p className="text-gray-400 text-xs">Gaming Platform</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={item.path}
                onClick={() => setActiveItem(item.id)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeItem === item.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Quick Stats */}
        <div className="mt-8 p-4 bg-gray-800/40 rounded-lg border border-gray-700/30">
          <h3 className="text-gray-300 text-sm font-semibold mb-3">Quick Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Games Played</span>
              <span className="text-white font-medium">42</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Best Score</span>
              <span className="text-yellow-400 font-medium">1,250</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Rank</span>
              <span className="text-green-400 font-medium">#15</span>
            </div>
          </div>
        </div>

        {/* User Actions */}
        <div className="mt-8 pt-6 border-t border-gray-700/50">
          <Link
            href="/pages/auth"
            className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-red-400 transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sign Out</span>
          </Link>
        </div>
      </div>
    </div>
  );
}