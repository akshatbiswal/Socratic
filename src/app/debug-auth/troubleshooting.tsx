'use client';

export default function TroubleshootingGuide() {
  return (
    <div className="p-8 bg-white rounded-lg shadow max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Clerk + Supabase Integration Troubleshooting Guide</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Essential Setup Checklist</h2>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong>Clerk Dashboard Setup:</strong> 
            <ul className="list-circle pl-6 mt-2">
              <li>Activate the Supabase integration in your Clerk Dashboard (Under Integrations → Supabase)</li>
              <li>Ensure you have the JWT template configured for Supabase</li>
              <li>Copy your Clerk domain (required for Supabase)</li>
            </ul>
          </li>
          <li>
            <strong>Supabase Dashboard Setup:</strong>
            <ul className="list-circle pl-6 mt-2">
              <li>Add Clerk as an auth provider in Authentication → Sign-in Methods → Auth providers</li>
              <li>Paste your Clerk domain from the Clerk Dashboard</li>
              <li>Verify Row Level Security (RLS) is enabled on your tables</li>
              <li>Check that you have proper RLS policies configured that use <code>auth.jwt()->>'sub'</code></li>
            </ul>
          </li>
          <li>
            <strong>Environment Variables:</strong>
            <ul className="list-circle pl-6 mt-2">
              <li>Ensure <code>NEXT_PUBLIC_SUPABASE_URL</code> is set correctly</li>
              <li>Ensure <code>NEXT_PUBLIC_SUPABASE_KEY</code> (anon key) is set correctly</li>
              <li>Ensure Clerk environment variables are set correctly</li>
            </ul>
          </li>
        </ul>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Common Issues & Solutions</h2>
        
        <div className="mb-4">
          <h3 className="font-bold">1. "Auth Error" or "Not Authenticated" from Supabase</h3>
          <p className="mb-2">This usually means the JWT token is missing or invalid:</p>
          <ul className="list-disc pl-6">
            <li>Verify you're passing the token with the 'supabase' template: <code>session.getToken({ template: 'supabase' })</code></li>
            <li>Check that you've activated the Supabase integration in your Clerk Dashboard</li>
            <li>Ensure your Supabase client is correctly configured to use the token</li>
            <li>Check browser console for any errors in token retrieval</li>
          </ul>
        </div>
        
        <div className="mb-4">
          <h3 className="font-bold">2. Sign-in Loop or Redirect Loop</h3>
          <p className="mb-2">Users get redirected back to sign-in page even after signing in:</p>
          <ul className="list-disc pl-6">
            <li>Check if Clerk session is being properly maintained (look for session in browser storage)</li>
            <li>Verify your auth middleware is configured correctly and isn't over-redirecting</li>
            <li>Ensure you're correctly using Clerk's hooks and components</li>
            <li>Check network requests to see if there are any 401/403 errors causing redirects</li>
          </ul>
        </div>
        
        <div className="mb-4">
          <h3 className="font-bold">3. RLS Policies Not Working</h3>
          <p className="mb-2">Supabase returns data that should be protected:</p>
          <ul className="list-disc pl-6">
            <li>Verify RLS is enabled on your tables</li>
            <li>Ensure your policies use <code>auth.jwt()->>'sub'</code> to get the Clerk user ID</li>
            <li>Test your policies in the Supabase SQL editor</li>
            <li>Check if the same user_id/clerk_id is being used consistently</li>
          </ul>
        </div>
        
        <div className="mb-4">
          <h3 className="font-bold">4. Missing User Records</h3>
          <p className="mb-2">Properly authenticated but no user record in Supabase:</p>
          <ul className="list-disc pl-6">
            <li>User records are not automatically created - you need to create them, typically after a user signs up</li>
            <li>Set up a webhook in Clerk to create a user record in Supabase when a user is created in Clerk</li>
            <li>Implement logic to create a user record if one doesn't exist</li>
          </ul>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Testing Your Integration</h2>
        <ol className="list-decimal pl-6 space-y-3">
          <li>Sign in and navigate to the /debug-auth page we created to see your session status</li>
          <li>Click the "Test Supabase Connection" button to test authentication</li>
          <li>Use browser DevTools to check for any errors in the console</li>
          <li>Use the Network tab to inspect the requests and responses when accessing Supabase</li>
          <li>Check the Supabase logs in their dashboard for any auth-related errors</li>
        </ol>
      </div>
      
      <div className="p-4 bg-blue-50 rounded">
        <h2 className="text-lg font-semibold mb-2">Additional Resources</h2>
        <ul className="list-disc pl-6">
          <li><a href="https://clerk.com/docs/integrations/databases/supabase" className="text-blue-600 hover:underline">Clerk Supabase Integration Docs</a></li>
          <li><a href="https://supabase.com/docs/guides/auth/row-level-security" className="text-blue-600 hover:underline">Supabase Row Level Security Docs</a></li>
          <li><a href="https://clerk.com/docs/integrations/webhooks" className="text-blue-600 hover:underline">Clerk Webhooks for Data Sync</a></li>
        </ul>
      </div>
    </div>
  );
} 