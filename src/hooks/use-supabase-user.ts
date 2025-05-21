'use client';

import { useState, useEffect } from 'react';
import { useUser, useSession } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

type SupabaseUser = {
  id: string;
  clerk_id: string;
  email: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export function useSupabaseUser() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { session } = useSession();
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only run once the user is loaded and we have a session
    if (!isUserLoaded || !user || !session) {
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Log for debugging
        console.log("Fetching user data for Clerk ID:", user.id);
        
        // Get token with the supabase template
        const clerkToken = await session.getToken({
          template: 'supabase',
        });

        if (!clerkToken) {
          throw new Error('Failed to get Clerk token with Supabase template');
        }

        // Create a Supabase client with both authentication methods
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_KEY!,
          {
            global: {
              fetch: async (url, options = {}) => {
                const headers = new Headers(options?.headers);
                headers.set('Authorization', `Bearer ${clerkToken}`);
                
                return fetch(url, {
                  ...options,
                  headers,
                });
              },
            },
            auth: {
              persistSession: false
            },
            async accessToken() {
              return clerkToken;
            },
          }
        );

        // Fetch the user data from Supabase
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('clerk_id', user.id)
          .single();

        if (error) {
          console.error("Supabase query error:", error);
          
          // Try to get more info about the error
          const authInfo = await supabase.auth.getSession();
          console.log("Auth info:", authInfo);
          
          throw error;
        }

        if (!data) {
          console.log("No user data found, might need to create user record");
          // You might want to create a user record here if integration is configured to not do it automatically
        } else {
          console.log("User data fetched successfully");
          setSupabaseUser(data);
        }
      } catch (err: any) {
        console.error('Error fetching Supabase user data:', err);
        setError(err.message || 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isUserLoaded, user, session]);

  return { supabaseUser, loading, error };
} 