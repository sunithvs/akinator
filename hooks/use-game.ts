import { useState, useEffect } from 'react';

interface AssignedUser {
  id: string;
  display_name: string;
  description: string;
}

interface GameState {
  assigned_user: AssignedUser | null;
  loading: boolean;
  error: string | null;
}

export function useGame() {
  const [gameState, setGameState] = useState<GameState>({
    assigned_user: null,
    loading: false,
    error: null
  });

  const assignNewUser = async () => {
    setGameState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch('/api/game/assign-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign user');
      }

      const data = await response.json();
      
      setGameState({
        assigned_user: data.assigned_user,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error assigning user:', error);
      setGameState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to assign user'
      }));
    }
  };

  const resetGame = () => {
    setGameState({
      assigned_user: null,
      loading: false,
      error: null
    });
  };

  return {
    ...gameState,
    assignNewUser,
    resetGame
  };
}