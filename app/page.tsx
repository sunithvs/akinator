'use client';

import { useEffect } from 'react';
import { useGame } from '@/hooks/use-game';
import { Button } from '@/components/ui/button';
import { ChatInterface } from '@/components/chat/chat-interface';

export default function HomePage() {
  const { assigned_user, loading, error, assignNewUser } = useGame();

  // Automatically assign a user when the component mounts
  useEffect(() => {
    if (!assigned_user && !loading) {
      assignNewUser();
    }
  }, [assigned_user, loading, assignNewUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-6"></div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Finding Your Target...</h2>
                <p className="text-gray-600 text-lg">We&apos;re selecting someone exciting for you to guess!</p>
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
                <div className="text-red-500 text-6xl mb-6">⚠️</div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Oops! Something went wrong</h2>
                <p className="text-red-600 mb-6 text-lg">{error}</p>
                <Button 
                  onClick={assignNewUser}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg"
                >
                  🔄 Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!assigned_user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-6">🎭</div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">No Players Available</h2>
                <p className="text-gray-600 mb-6 text-lg">
                  There are no users available to guess right now. Try again in a moment!
                </p>
                <Button 
                  onClick={assignNewUser}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg"
                >
                  🔄 Refresh
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
          {/* Welcome Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                🕵️ Guess Who Challenge!
              </h1>
              <p className="text-lg md:text-xl text-gray-600">
                Chat with an AI that&apos;s pretending to be someone. Can you figure out who they are?
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-4">
                <div className="text-2xl md:text-3xl">🎯</div>
                <div>
                  <h2 className="font-semibold text-blue-800 mb-2 text-base md:text-lg">Your Mission:</h2>
                  <p className="text-blue-700 leading-relaxed text-sm md:text-base">
                    Someone is waiting for you to discover their identity. Ask questions, learn about their interests, 
                    and use the clues to make your guess. The more you chat, the more you&apos;ll learn!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden min-h-[600px]">
            <ChatInterface 
              assigned_user={assigned_user}
              onCorrectGuess={() => {
                // When user guesses correctly, assign a new user
                assignNewUser();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
