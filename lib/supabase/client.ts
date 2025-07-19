import "client-only";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Get environment variables with fallbacks
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ycoidorskzniracflvbh.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inljb2lkb3Jza3puaXJhY2ZsdmJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MDU3MzgsImV4cCI6MjA2ODQ4MTczOH0.j_5LO08HPXLZtI8tbgNPYV2wjNbrSVYaT2Vstal-ZNI';

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
}
