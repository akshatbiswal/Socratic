import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

// Create a Supabase client for server-side usage with Clerk integration using the NEW approach
export async function createClerkSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and key must be defined in environment variables');
  }
  
  // Get the auth helper from Clerk
  const { getToken } = await auth();
  
  // NEW APPROACH: Use accessToken callback instead of JWT templates
  return createClient(supabaseUrl, supabaseKey, {
    accessToken: async () => {
      const token = await getToken();
      return token ?? null;
    },
  });
} 