import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Count occurrences in game_results where user is either guesser or assigned user
    const { data: asGuesser, error: guesserError } = await supabase
      .from('game_results')
      .select('id', { count: 'exact' })
      .eq('guesser_id', user.id);

    const { data: asAssigned, error: assignedError } = await supabase
      .from('game_results')
      .select('id', { count: 'exact' })
      .eq('assigned_user_id', user.id);

    if (guesserError || assignedError) {
      console.error('Game results error:', guesserError || assignedError);
      return NextResponse.json({ error: 'Failed to fetch points' }, { status: 500 });
    }

    const guesserCount = asGuesser?.length || 0;
    const assignedCount = asAssigned?.length || 0;
    const totalPoints = guesserCount + assignedCount;

    return NextResponse.json({ 
      points: totalPoints,
      display_name: profile.display_name,
      breakdown: {
        as_guesser: guesserCount,
        as_assigned: assignedCount
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 