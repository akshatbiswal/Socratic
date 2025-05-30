// src/components/supabase-user-sync.tsx
'use client';

import { useEffect } from 'react';
import { useUser, useSession } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

export function SupabaseUserSync() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { session } = useSession();

  useEffect(() => {
    // Only run once the user is loaded and we have a session
    if (!isUserLoaded || !user || !session) return;

    const syncUserData = async () => {
      try {
        // NEW APPROACH: Create Supabase client with accessToken callback
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_KEY!,
          {
            accessToken: async () => session?.getToken() ?? null,
          }
        );

        // Check if the user already exists in the database
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('clerk_id', user.id)
          .single();

        if (existingUser) {
          // Update the existing user data
          await supabase
            .from('users')
            .update({
              email: user.primaryEmailAddress?.emailAddress,
              username: user.username,
              first_name: user.firstName,
              last_name: user.lastName,
              image_url: user.imageUrl,
              updated_at: new Date().toISOString(),
            })
            .eq('clerk_id', user.id);
        } else {
          // Insert new user data
          await supabase.from('users').insert({
            clerk_id: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            username: user.username,
            first_name: user.firstName,
            last_name: user.lastName,
            image_url: user.imageUrl,
          });
        }
      } catch (error) {
        console.error('Error syncing user data to Supabase:', error);
      }
    };

    syncUserData();
  }, [isUserLoaded, user, session]);

  // This component doesn't render anything visible
  return null;
}