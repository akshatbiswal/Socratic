'use client';

import { useState, useEffect, useRef } from 'react';
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
  
  // Track if we've ever successfully loaded data
  const hasDataRef = useRef(false);
  // Track the last successful clerk_id to detect user changes
  const lastClerkIdRef = useRef<string | null>(null);
  // Prevent concurrent fetches
  const fetchingRef = useRef(false);

  useEffect(() => {
    // Only run once the user is loaded and we have a session
    if (!isUserLoaded || !user || !session) {
      setLoading(false);
      return;
    }

    // If this is a different user, reset the cache and show loading
    if (lastClerkIdRef.current !== user.id) {
      hasDataRef.current = false;
      lastClerkIdRef.current = user.id;
      setSupabaseUser(null);
      setLoading(true);
    }

    // If we already have data for this user and are just refreshing, don't show loading
    // This prevents the flickering on tab switch
    const shouldShowLoading = !hasDataRef.current;

    // Prevent concurrent fetches
    if (fetchingRef.current) {
      return;
    }

    const fetchUserData = async () => {
      try {
        fetchingRef.current = true;
        if (shouldShowLoading) {
          setLoading(true);
        }
        setError(null);

        // Log for debugging
        console.log("Fetching user data for Clerk ID:", user.id);
        
        // Create Supabase client with accessToken callback
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_KEY!,
          {
            accessToken: async () => {
              const token = await session.getToken();
              return token;
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
          console.error("Supabase query error:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          
          throw error;
        }

        if (!data) {
          console.log("No user data found, might need to create user record");
          // You might want to create a user record here if integration is configured to not do it automatically
        } else {
          console.log("User data fetched successfully");
          setSupabaseUser(data);
          hasDataRef.current = true;
        }
      } catch (err: any) {
        console.error('Error fetching Supabase user data:', err);
        setError(err.message || 'Failed to fetch user data');
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };

    fetchUserData();
  }, [isUserLoaded, user, session]);

  return { supabaseUser, loading, error };
} 