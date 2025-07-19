import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { guess, assigned_user_id } = body;

    if (!guess || !assigned_user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the assigned user's profile to check the guess
    const { data: assignedProfile, error: profileError } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', assigned_user_id)
      .single();

    if (profileError || !assignedProfile) {
      return NextResponse.json({ error: 'Assigned user not found' }, { status: 404 });
    }

    // Check if the guess matches the display name (case insensitive)
    const correctName = assignedProfile.display_name.toLowerCase().trim();
    const userGuess = guess.toLowerCase().trim();
    
    const isCorrect = correctName === userGuess || 
                     correctName.includes(userGuess) || 
                     userGuess.includes(correctName);

    if (isCorrect) {
      // Record the game result
      const { error: insertError } = await supabase
        .from('game_results')
        .insert({
          guesser_id: user.id,
          assigned_user_id: assigned_user_id
        });

      if (insertError) {
        console.error('Error inserting game result:', insertError);
        // Still return success to user, but log the error
      }
      
      return NextResponse.json({
        correct: true,
        message: `🎉 Congratulations! You guessed correctly! It was ${assignedProfile.display_name}! 🕵️‍♂️`,
        actual_name: assignedProfile.display_name
      });
    } else {
      return NextResponse.json({
        correct: false,
        message: `❌ Wrong guess! "${guess}" is not correct. Keep chatting to learn more!`,
        actual_name: null
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}