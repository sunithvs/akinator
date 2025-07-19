'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  points: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leaderboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    
    // Auto-refresh every minute
    const interval = setInterval(fetchLeaderboard, 60000);
    return () => clearInterval(interval);
  }, []);

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${position}`;
    }
  };

  const getRankColor = (position: number) => {
    switch (position) {
      case 1:
        return 'text-yellow-600 bg-yellow-50';
      case 2:
        return 'text-gray-600 bg-gray-50';
      case 3:
        return 'text-amber-600 bg-amber-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading leaderboard...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <p className="text-red-600 mb-6 text-lg">{error}</p>
                <Button onClick={fetchLeaderboard} className="bg-indigo-600 hover:bg-indigo-700">
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
                🏆 Leaderboard
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-6">
                See who&apos;s leading the guessing game!
              </p>
              <Button 
                onClick={fetchLeaderboard}
                variant="outline"
                className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
              >
                🔄 Refresh
              </Button>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden min-h-[400px]">
            {leaderboard.length === 0 ? (
              <div className="p-8 md:p-12 text-center flex items-center justify-center min-h-[400px]">
                <div>
                  <div className="text-4xl md:text-6xl mb-4">🎯</div>
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">No Games Yet!</h3>
                  <p className="text-gray-600 text-sm md:text-base">
                    Be the first to play and appear on the leaderboard.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {leaderboard.map((entry, index) => {
                  const position = index + 1;
                  const isTopThree = position <= 3;
                  
                  return (
                    <div
                      key={entry.user_id}
                      className={`p-4 md:p-6 transition-all duration-200 hover:bg-gray-50 ${
                        isTopThree ? 'bg-gradient-to-r from-white to-gray-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Rank */}
                          <div
                            className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-lg font-bold ${getRankColor(
                              position
                            )}`}
                          >
                            {getRankIcon(position)}
                          </div>
                          
                          {/* User Info */}
                          <div>
                            <h3 className="text-sm md:text-lg font-semibold text-gray-900">
                              {entry.display_name || 'Anonymous Player'}
                            </h3>
                            <p className="text-xs md:text-sm text-gray-500">
                              Rank #{position}
                            </p>
                          </div>
                        </div>
                        
                        {/* Points */}
                        <div className="text-right">
                          <div className="text-lg md:text-2xl font-bold text-indigo-600">
                            {entry.points}
                          </div>
                          <div className="text-xs md:text-sm text-gray-500">
                            {entry.points === 1 ? 'point' : 'points'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 