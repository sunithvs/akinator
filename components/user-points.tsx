'use client';

import { useEffect, useState } from 'react';

interface UserPoints {
  points: number;
  display_name: string;
  breakdown: {
    as_guesser: number;
    as_assigned: number;
  };
}

export function UserPoints() {
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserPoints = async () => {
    try {
      const response = await fetch('/api/user/points');
      
      if (response.ok) {
        const data = await response.json();
        setUserPoints(data);
      } else if (response.status === 404) {
        // User profile not found
        setUserPoints(null);
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPoints();
    
    // Auto-refresh every minute
    const interval = setInterval(fetchUserPoints, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-600">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (!userPoints) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 md:space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-2 md:px-4 py-1 md:py-2 rounded-lg border border-blue-200">
      <div className="flex items-center space-x-1 md:space-x-2">
        <span className="text-lg md:text-xl">🏆</span>
        <div className="text-right">
          <div className="text-sm md:text-lg font-bold text-blue-700">
            {userPoints.points}
          </div>
          <div className="text-xs text-blue-600 leading-none hidden sm:block">
            {userPoints.points === 1 ? 'point' : 'points'}
          </div>
        </div>
      </div>
      
      {/* Tooltip on hover showing breakdown */}
      <div className="group relative hidden md:block">
        <div className="cursor-help text-blue-500 hover:text-blue-700">
          ℹ️
        </div>
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
          <div className="text-sm">
            <div className="font-semibold text-gray-800 mb-2">
              {userPoints.display_name}&apos;s Points
            </div>
            <div className="space-y-1 text-gray-600">
              <div className="flex justify-between">
                <span>🕵️ Correct guesses:</span>
                <span className="font-medium">{userPoints.breakdown.as_guesser}</span>
              </div>
              <div className="flex justify-between">
                <span>🎯 Times guessed:</span>
                <span className="font-medium">{userPoints.breakdown.as_assigned}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-semibold text-blue-700">
                <span>Total:</span>
                <span>{userPoints.points}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 