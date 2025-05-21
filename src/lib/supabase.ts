import { createClient, Session } from '@supabase/supabase-js';
//import { Session } from '@clerk/nextjs/server';
import { useSession } from '@clerk/nextjs';
// Create a standard Supabase client
export const createStandardClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and key must be defined in environment variables');
  }

  return createClient(supabaseUrl, supabaseKey);
};

// Create a Supabase client with Clerk authentication
export const createClerkSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
  const { session } = useSession(); 
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and key must be defined in environment variables');
  }

  return createClient(supabaseUrl, supabaseKey, {
    async accessToken() {
      return session?.getToken() ?? null;
    },
  });
}; 