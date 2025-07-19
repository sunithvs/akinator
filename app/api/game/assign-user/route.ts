import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all profiles except the current user
    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, display_name, description')
      .neq('user_id', user.id);

    if (profilesError) {
      console.error('Profiles error:', profilesError);
      return NextResponse.json({ error: 'Failed to get profiles' }, { status: 500 });
    }

    if (!allProfiles || allProfiles.length === 0) {
      return NextResponse.json({ error: 'No users available for assignment' }, { status: 404 });
    }

    // Get users that have already been assigned to this guesser
    const { data: previousAssignments, error: assignmentError } = await supabase
      .from('game_results')
      .select('assigned_user_id')
      .eq('guesser_id', user.id);

    if (assignmentError) {
      console.error('Assignment error:', assignmentError);
      return NextResponse.json({ error: 'Failed to get assignment history' }, { status: 500 });
    }

    const previouslyAssignedIds = previousAssignments?.map(a => a.assigned_user_id) || [];

    // Filter out previously assigned users
    const newUsers = allProfiles.filter(profile => !previouslyAssignedIds.includes(profile.user_id));

    let assignedProfile;

    if (newUsers.length > 0) {
      // Assign a random new user
      const randomIndex = Math.floor(Math.random() * newUsers.length);
      assignedProfile = newUsers[randomIndex];
    } else {
      // If no new users, assign a random user from all available
      const randomIndex = Math.floor(Math.random() * allProfiles.length);
      assignedProfile = allProfiles[randomIndex];
    }

    if (!assignedProfile) {
      return NextResponse.json({ error: 'Failed to get assigned user profile' }, { status: 500 });
    }

    return NextResponse.json({
      assigned_user: {
        id: assignedProfile.user_id,
        display_name: assignedProfile.display_name,
        description: assignedProfile.description
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}