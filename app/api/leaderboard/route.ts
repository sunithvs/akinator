import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Get the current user (for authentication)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all profiles with their display names
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .not('display_name', 'is', null);

    if (profilesError) {
      console.error('Profiles error:', profilesError);
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }

    // Get all game results
    const { data: gameResults, error: gameResultsError } = await supabase
      .from('game_results')
      .select('guesser_id, assigned_user_id');

    if (gameResultsError) {
      console.error('Game results error:', gameResultsError);
      return NextResponse.json({ error: 'Failed to fetch game results' }, { status: 500 });
    }

    // Calculate points for each user
    const userPoints: { [key: string]: number } = {};
    
    gameResults?.forEach(result => {
      // Award point to guesser
      userPoints[result.guesser_id] = (userPoints[result.guesser_id] || 0) + 1;
      // Award point to assigned user
      userPoints[result.assigned_user_id] = (userPoints[result.assigned_user_id] || 0) + 1;
    });

    // Create leaderboard with profile information
    const leaderboard = profiles
      ?.map(profile => ({
        user_id: profile.user_id,
        display_name: profile.display_name,
        points: userPoints[profile.user_id] || 0
      }))
      .sort((a, b) => b.points - a.points) // Sort by points descending
      .slice(0, 50); // Limit to top 50

    return NextResponse.json({ leaderboard });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 