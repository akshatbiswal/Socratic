"use client"

import { useEffect } from "react"
import { useSignIn, useSignUp, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { createStandardClient } from "@/lib/supabase"

export default function SSOCallback() {
  const { isLoaded: isSignInLoaded, signIn } = useSignIn()
  const { isLoaded: isSignUpLoaded, signUp } = useSignUp()
  const { session, user, signOut, setActive } = useClerk()
  const router = useRouter()
  
  useEffect(() => {
    if (!isSignInLoaded || !isSignUpLoaded) return

    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const action = params.get('action')
        
        console.log('SSO Callback - Full URL:', window.location.href)
        console.log('SSO Callback - Action:', action)
        console.log('SSO Callback - Session exists:', !!session)
        console.log('SSO Callback - User exists:', !!user)
        
        // Check for explicit OAuth errors in URL parameters first
        const urlError = params.get('error')
        const errorDescription = params.get('error_description')
        
        if (urlError) {
          console.log('OAuth URL error detected:', { urlError, errorDescription, action })
          
          // Handle real OAuth failures
          if (action === 'login') {
            router.push('/signup?error=no_account')
          } else {
            router.push('/login?error=oauth_failed')
          }
          return
        }
        
        // If no session exists, this indicates one of two scenarios:
        // 1. OAuth failed completely
        // 2. User tried to signup with existing account (Clerk doesn't create session)
        if (!session || !user) {
          console.log('No session or user found after OAuth callback')
          
          if (action === 'signup') {
            // Most likely case: user tried to signup with existing account
            // Redirect to login with helpful message
            console.log('Signup without session - likely existing account, redirecting to login')
            router.push('/login?message=account_exists')
          } else {
            // Login without session is a real error
            router.push('/login?error=oauth_failed')
          }
          return
        }
        
        // If we have a session, proceed with success flow
        console.log('OAuth successful! User authenticated:', user.id)
        
        try {
          // Verify user exists in database for login, or create for signup
          const supabase = createStandardClient()
          const { data: existingUser, error: dbError } = await supabase
            .from('users')
            .select('*')
            .eq('clerk_id', user.id)
            .single()
          
          console.log('Database check:', { 
            existingUser: !!existingUser, 
            dbError: dbError?.code || 'none'
          })
          
          if (action === 'signup' && existingUser && !dbError) {
            // Edge case: OAuth succeeded but user already exists in DB
            // This shouldn't happen often but handle it gracefully
            console.log('Signup successful but user already in DB - proceeding to dashboard')
          } else if (action === 'login' && (!existingUser || dbError?.code === 'PGRST116')) {
            // User successfully logged in via OAuth but not in our database
            console.log('Login successful but user not in DB - redirecting to signup')
            await signOut()
            router.push('/signup?error=no_account')
            return
          }
          
          // Success - proceed to dashboard
          await setActive({ session: session.id })
          router.push('/dashboard')
          
        } catch (dbError) {
          console.error('Database error:', dbError)
          // Don't fail the auth flow for database issues
          await setActive({ session: session.id })
          router.push('/dashboard')
        }
        
      } catch (error: any) {
        console.error('Unexpected error in SSO callback:', error)
        router.push('/login?error=oauth_failed')
      }
    }
    
    handleCallback()
  }, [isSignInLoaded, isSignUpLoaded, router, signIn, signUp, session, user, signOut, setActive])
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Completing authentication...</h1>
        <p className="text-muted-foreground">Please wait while we redirect you.</p>
      </div>
    </div>
  )
} 