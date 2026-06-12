"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  backLink?: string;
}

export default function DashboardLayout({ 
  children, 
  title,
  showBackButton = true,
  backLink = '/dashboard'
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header Bar */}
      <header className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-700/50 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Link
                href={backLink}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </Link>
            )}
            
            {title && (
              <>
                <div className="w-px h-6 bg-gray-600"></div>
                <h1 className="text-xl font-semibold text-white">{title}</h1>
              </>
            )}
          </div>
          
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="relative">
        {children}
      </main>
    </div>
  );
}