import { createClient } from '@supabase/supabase-js';
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

// Create a custom hook for Supabase client with Clerk authentication
export const useClerkSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
  const { session } = useSession();
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and key must be defined in environment variables');
  }

  // Create using both methods for compatibility
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      fetch: async (url, options = {}) => {
        // Get the token with the supabase template
        const clerkToken = await session?.getToken({
          template: 'supabase',
        });

        // Insert the Clerk Supabase token into the headers
        const headers = new Headers(options?.headers);
        headers.set('Authorization', `Bearer ${clerkToken}`);

        // Now call the default fetch
        return fetch(url, {
          ...options,
          headers,
        });
      },
    },
    // Also include the accessToken method as a fallback
    auth: {
      persistSession: false
    },
    async accessToken() {
      const token = await session?.getToken({ template: 'supabase' });
      return token || null;
    },
  });
}; 