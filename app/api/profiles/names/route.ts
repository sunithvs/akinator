import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get search query from URL params
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    // Fetch display names from profiles table
    let profilesQuery = supabase
      .from('profiles')
      .select('display_name')
      .not('display_name', 'is', null);

    // If there's a search query, filter by it
    if (query.trim()) {
      profilesQuery = profilesQuery.ilike('display_name', `%${query}%`);
    }

    const { data: profiles, error: profilesError } = await profilesQuery
      .limit(10)
      .order('display_name');

    if (profilesError) {
      console.error('Profiles error:', profilesError);
      return NextResponse.json({ error: 'Failed to fetch names' }, { status: 500 });
    }

    // Extract just the display names and filter out null values
    const names = profiles
      ?.map(profile => profile.display_name)
      .filter(name => name !== null) || [];

    return NextResponse.json({ names });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 