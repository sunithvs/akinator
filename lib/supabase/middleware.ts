import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getUserRole } from "@/lib/get-user-role";
import { createClient } from "@/lib/supabase/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Get environment variables with fallbacks
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ycoidorskzniracflvbh.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inljb2lkb3Jza3puaXJhY2ZsdmJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MDU3MzgsImV4cCI6MjA2ODQ4MTczOH0.j_5LO08HPXLZtI8tbgNPYV2wjNbrSVYaT2Vstal-ZNI';

  // Create a Supabase client
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get the current user from Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get the user's role using the custom getUserRole function
  const role = await getUserRole();

  // Redirect non-admin users trying to access admin pages to the home page
  if (
    user &&
    role !== "admin" &&
    request.nextUrl.pathname.startsWith("/admin")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Redirect unauthenticated users to sign-in page
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/signin") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Check if authenticated user has a profile
  if (user && !request.nextUrl.pathname.startsWith("/profile/create") && !request.nextUrl.pathname.startsWith("/auth")) {
    const serverSupabase = createClient();
    const { data: profile } = await serverSupabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (!profile && !request.nextUrl.pathname.startsWith("/signin")) {
      const url = request.nextUrl.clone();
      url.pathname = "/profile/create";
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users attempting to access the sign-in page to the home page
  if (user && request.nextUrl.pathname.startsWith("/signin")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
