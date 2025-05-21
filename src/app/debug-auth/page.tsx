'use client';

import { useState, useEffect } from 'react';
import { useUser, useSession } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import TroubleshootingGuide from './troubleshooting';

export default function DebugAuth() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { session } = useSession();
  const [supabaseStatus, setSupabaseStatus] = useState<string>('Waiting...');
  const [token, setToken] = useState<string | null>(null);
  const [supabaseResponse, setSupabaseResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  // Function to test the Supabase connection
  const testSupabaseConnection = async () => {
    try {
      setSupabaseStatus('Testing connection...');
      
      if (!session) {
        setError('No Clerk session available');
        return;
      }

      // Get the token with supabase template
      const clerkToken = await session.getToken({ template: 'supabase' });
      setToken(clerkToken ? `${clerkToken.substring(0, 20)}...` : 'No token');

      // Create a Supabase client
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
        }
      );

      // Try to fetch some data that requires authentication
      const { data, error: supabaseError } = await supabase.from('users').select('*').limit(1);
      
      if (supabaseError) {
        setError(`Supabase error: ${supabaseError.message}`);
        setSupabaseStatus('Failed');
      } else {
        setSupabaseResponse(data);
        setSupabaseStatus('Connected successfully');
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`);
      setSupabaseStatus('Failed with exception');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Clerk Status</h2>
        <p>User loaded: {isUserLoaded ? 'Yes' : 'No'}</p>
        <p>User authenticated: {user ? 'Yes' : 'No'}</p>
        <p>User ID: {user?.id || 'Not available'}</p>
        <p>Session available: {session ? 'Yes' : 'No'}</p>
      </div>

      <div className="mb-6">
        <button 
          onClick={testSupabaseConnection}
          className="px-4 py-2 bg-blue-500 text-white rounded"
          disabled={!session}
        >
          Test Supabase Connection
        </button>
        <button 
          onClick={() => setShowTroubleshooting(!showTroubleshooting)}
          className="ml-4 px-4 py-2 bg-gray-500 text-white rounded"
        >
          {showTroubleshooting ? 'Hide' : 'Show'} Troubleshooting Guide
        </button>
      </div>

      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Supabase Status</h2>
        <p>Status: {supabaseStatus}</p>
        {token && <p>Token: {token}</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        
        {supabaseResponse && (
          <div className="mt-4">
            <h3 className="font-medium">Response Data:</h3>
            <pre className="bg-gray-100 p-2 mt-2 overflow-auto">
              {JSON.stringify(supabaseResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="p-4 border rounded bg-yellow-50">
        <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
        <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not Set'}</p>
        <p>NEXT_PUBLIC_SUPABASE_KEY: {process.env.NEXT_PUBLIC_SUPABASE_KEY ? '✅ Set' : '❌ Not Set'}</p>
      </div>
      
      {showTroubleshooting && <TroubleshootingGuide />}
    </div>
  );
} 