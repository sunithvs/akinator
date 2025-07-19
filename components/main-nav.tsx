'use client';

import { useState } from 'react';
import Link from "next/link";
import { UserAccountNav } from "@/components/user-account-nav";
import { UserPoints } from "@/components/user-points";
import { Button } from "@/components/ui/button";

export function MainNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="flex h-16 md:h-20 items-center justify-between border-b border-gray-200 px-4 bg-white shadow-sm relative">
      <div className="flex items-center space-x-4 md:space-x-8">
        <Link href="/" className="flex items-center space-x-2">
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            🕵️ GuessMaster
          </h1>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-blue-600 flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-blue-50"
          >
            <span>🎯</span>
            <span>Game</span>
          </Link>
          <Link
            href="/leaderboard"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600 flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-blue-50"
          >
            <span>🏆</span>
            <span>Leaderboard</span>
          </Link>
        </div>
      </div>
      
      {/* Desktop User Section */}
      <div className="hidden md:flex items-center space-x-4">
        <UserPoints />
        <UserAccountNav />
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center space-x-2">
        <UserPoints />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg md:hidden z-50">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/"
              className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gray-50 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span>🎯</span>
              <span>Game</span>
            </Link>
            <Link
              href="/leaderboard"
              className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gray-50 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span>🏆</span>
              <span>Leaderboard</span>
            </Link>
            <div className="pt-3 border-t border-gray-200">
              <UserAccountNav />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
