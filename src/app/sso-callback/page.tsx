"use client"

import { useEffect } from "react"
import { useSignIn, useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function SSOCallback() {
  const { isLoaded: isSignInLoaded, signIn } = useSignIn()
  const { isLoaded: isSignUpLoaded, signUp } = useSignUp()
  const router = useRouter()
  
  useEffect(() => {
    if (!isSignInLoaded || !isSignUpLoaded) return

    // Handle the callback and redirect
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        if (!params.has('createdSessionId')) {
          // If we don't have a session ID, something went wrong
          router.push('/login')
          return
        }
        
        // Successfully authenticated, navigate to dashboard
        router.push('/dashboard')
      } catch (error) {
        console.error('Error handling SSO callback:', error)
        router.push('/login')
      }
    }
    
    handleCallback()
  }, [isSignInLoaded, isSignUpLoaded, router])
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Completing authentication...</h1>
        <p className="text-muted-foreground">Please wait while we redirect you.</p>
      </div>
    </div>
  )
} 