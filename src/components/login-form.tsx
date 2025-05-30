"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { useClerk, useSignIn } from "@clerk/nextjs"
import { useRouter, useSearchParams } from "next/navigation"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { isLoaded, signIn, setActive } = useSignIn()
  const { signOut } = useClerk()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isLoaded) {
      return
    }

    try {
      setIsLoading(true)
      setError("")
      
      const result = await signIn.create({
        identifier: email,
        password,
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.push("/dashboard")
      } else {
        console.error("Something went wrong", result)
        setError("Something went wrong. Please try again.")
      }
    } catch (err: any) {
      console.error("Error during sign in:", err)
      
      // Check for specific Clerk error codes
      if (err.errors?.[0]?.code === "form_identifier_not_found") {
        // Redirect to signup page with error message
        router.push("/signup?error=no_account")
        return
      }
      
      setError(err.errors?.[0]?.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: "oauth_google" | "oauth_facebook" | "oauth_microsoft") => {
    if (!isLoaded) return
    
    try {
      setIsLoading(true)
      setError("")
      
      // Sign out current user first to avoid the "already signed in" error
      await signOut()
      
      // Use signIn.authenticateWithRedirect for login (not signup)
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback?action=login",
        redirectUrlComplete: "/dashboard"
      })
    } catch (err: any) {
      console.error("OAuth error:", err)
      
      // Check for identifier not found error
      if (err.errors?.[0]?.code === "form_identifier_not_found") {
        router.push("/signup?error=no_account")
        return
      }
      
      setError(err.errors?.[0]?.message || "Something went wrong with authentication.")
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome Back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your Socratic account
                </p>
                
                {/* Display messages based on URL parameters */}
                {searchParams.get('message') === 'account_exists' && (
                  <p className="text-sm text-green-600 mt-2 bg-green-50 border border-green-200 rounded-md p-3">
                    You already have an account. Please login or sign up with a new email.
                  </p>
                )}
                {searchParams.get('message') === 'already_signed_in' && (
                  <p className="text-sm text-green-600 mt-2 bg-green-50 border border-green-200 rounded-md p-3">
                    You&apos;re already signed in. Please login to continue or sign out to create a new account.
                  </p>
                )}
                {(searchParams.get('error') === 'oauth_failed' || searchParams.get('error') === 'oauth_no_account') && (
                  <p className="text-sm text-red-600 mt-2 bg-red-50 border border-red-200 rounded-md p-3">
                    {searchParams.get('error') === 'oauth_no_account' 
                      ? "That account is not created on Socratic. Please sign up or login with another email."
                      : "Authentication failed. Please try again or use a different method."
                    }
                  </p>
                )}
              </div>
              {error && (
                <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
                  {error}
                </div>
              )}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              {/* CAPTCHA Widget - Required for Clerk bot protection */}
              <div id="clerk-captcha"></div>
              
              <Button type="submit" className="w-full" disabled={isLoading || !isLoaded}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  type="button" 
                  className="w-full"
                  onClick={() => handleOAuthSignIn("oauth_microsoft")}
                  disabled={isLoading}
                >
                  <Image 
                    src="/microsoft.svg" 
                    alt="Microsoft logo" 
                    width={24} 
                    height={24} 
                  />
                  <span className="sr-only">Login with Microsoft</span>
                </Button>
                <Button 
                  variant="outline" 
                  type="button" 
                  className="w-full"
                  onClick={() => handleOAuthSignIn("oauth_google")}
                  disabled={isLoading}
                >
                  <Image 
                    src="/google.svg" 
                    alt="Google logo" 
                    width={24} 
                    height={24} 
                  />
                  <span className="sr-only">Login with Google</span>
                </Button>
                <Button 
                  variant="outline" 
                  type="button" 
                  className="w-full"
                  onClick={() => handleOAuthSignIn("oauth_facebook")}
                  disabled={isLoading}
                >
                  <Image 
                    src="/meta.svg" 
                    alt="Meta logo" 
                    width={24} 
                    height={24} 
                  />
                  <span className="sr-only">Login with Meta</span>
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <Image
              src="/Images/pietro-de-grandi-mountain-image.jpg"
              alt="Mountain landscape"
              fill
              className="object-cover dark:brightness-[0.2] dark:grayscale"
              priority
            />
            <div className="absolute bottom-2 left-2 text-[10px] text-white/80">
              Photo by{" "}
              <a
                href="https://unsplash.com/@peter_mc_greats?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Pietro De Grandi
              </a>{" "}
              on{" "}
              <a
                href="https://unsplash.com/photos/white-mountain-near-body-of-water-Q5dMq3cKqec?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Unsplash
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking Login, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
