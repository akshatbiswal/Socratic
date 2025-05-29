import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

// Create a Supabase client for server-side usage with Clerk integration
export async function createClerkSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and key must be defined in environment variables');
  }
  
  // Get the auth helper from Clerk
  const { getToken } = await auth();
  
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      fetch: async (url, options = {}) => {
        // Get the custom Supabase token from Clerk
        const clerkToken = await getToken({
          template: 'supabase',
        });
        
        // Insert the Clerk Supabase token into the headers
        const headers = new Headers(options?.headers);
        if (clerkToken) {
          headers.set('Authorization', `Bearer ${clerkToken}`);
        }
        
        // Now call the default fetch
        return fetch(url, {
          ...options,
          headers,
        });
      },
    },
  });
} 