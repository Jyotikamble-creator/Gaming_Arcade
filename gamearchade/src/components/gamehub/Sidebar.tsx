"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import {
  Home,
  Trophy,
  User,
  Settings,
  LogOut,
  Gamepad2,
  X
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: string;
}

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
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

];

export default function Sidebar({
  isMobileOpen = false,
  onCloseMobile
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const isItemActive = (path: string): boolean => {
    if (!pathname) return false;
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    onCloseMobile?.();
    router.replace('/pages/auth');
    router.refresh();
  };

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 h-dvh w-72 overflow-y-auto bg-gray-900/90 backdrop-blur-xl border-r border-gray-700/50 transform transition-transform duration-300 md:static md:z-auto md:h-auto md:w-64 md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
      <div className="p-6">
        <div className="mb-4 flex items-center justify-end md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onCloseMobile}
            className="rounded-lg p-2 text-gray-300 hover:bg-gray-800/50 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Logo/Brand */}
        <div className="flex items-center space-x-3 mb-8">
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
                onClick={onCloseMobile}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isItemActive(item.path)
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

        {/* User Actions */}
        <div className="mt-8 pt-6 border-t border-gray-700/50">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center space-x-3 px-4 py-2 text-gray-300 hover:text-red-400 transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>

      </div>
      </aside>
    </>
  );
}