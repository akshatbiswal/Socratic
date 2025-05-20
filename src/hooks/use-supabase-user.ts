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

        // Create a Supabase client with the Clerk session token
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_KEY!,
          {
            global: {
              headers: {
                Authorization: `Bearer ${await session.getToken()}`,
              },
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
          throw error;
        }

        setSupabaseUser(data);
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