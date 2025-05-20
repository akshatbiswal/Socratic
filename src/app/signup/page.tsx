"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useClerk, useSignUp, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const { signOut } = useClerk()
  const { isLoaded: isUserLoaded, isSignedIn } = useUser()
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Redirect already signed in users to dashboard
  useEffect(() => {
    if (isUserLoaded && isSignedIn) {
      // If user is already signed in, add a helpful error message
      setError("You are already signed in. If you want to create a new account, please sign out first or use the login page.")
    }
  }, [isUserLoaded, isSignedIn])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isLoaded) {
      return
    }

    // Check if already signed in
    if (isSignedIn) {
      setError("You are already signed in. If you want to create a new account, please sign out first or use the login page.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      setIsLoading(true)
      setError("")
      
      const result = await signUp.create({
        firstName,
        emailAddress: email,
        password,
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.push("/dashboard")
      } else {
        // Handle other statuses
        if (result.status === "missing_requirements") {
          // Additional verification is needed
          await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
          router.push('/verify-email') // You would need to create this page
        } else {
          console.error("Something went wrong", result)
          setError("Something went wrong. Please try again.")
        }
      }
    } catch (err: any) {
      console.error("Error during sign up:", err)
      setError(err.errors?.[0]?.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignUp = async (provider: "oauth_google" | "oauth_facebook" | "oauth_microsoft") => {
    if (!isLoaded) return
    
    try {
      setIsLoading(true)
      setError("")
      
      // Check if already signed in
      if (isSignedIn) {
        setError("You are already signed in with an account. If you want to sign up with a different account, please sign out first or use the login page.")
        setIsLoading(false)
        return
      }
      
      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard"
      })
    } catch (err: any) {
      console.error("OAuth error:", err)
      setError(err.errors?.[0]?.message || "Something went wrong with authentication.")
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <form className="p-6 md:p-8" onSubmit={onSubmit}>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <h1 className="text-2xl font-bold">Create Account</h1>
                    <p className="text-muted-foreground text-balance">
                      Sign up to create your Socratic account
                    </p>
                  </div>
                  {error && (
                    <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
                      {error}
                      {isSignedIn && (
                        <div className="mt-2">
                          <Link href="/login" className="underline font-medium">
                            Go to login page
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="grid gap-3">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isLoading || isSignedIn}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading || isSignedIn}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading || isSignedIn}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      required 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading || isSignedIn}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading || !isLoaded || isSignedIn}>
                    {isLoading ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> Please wait
                      </>
                    ) : (
                      "Create Account"
                    )}
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
                      onClick={() => handleOAuthSignUp("oauth_microsoft")}
                      disabled={isLoading || isSignedIn}
                    >
                      <Image 
                        src="/microsoft.svg" 
                        alt="Microsoft logo" 
                        width={24} 
                        height={24} 
                      />
                      <span className="sr-only">Sign up with Microsoft</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      type="button" 
                      className="w-full"
                      onClick={() => handleOAuthSignUp("oauth_google")}
                      disabled={isLoading || isSignedIn}
                    >
                      <Image 
                        src="/google.svg" 
                        alt="Google logo" 
                        width={24} 
                        height={24} 
                      />
                      <span className="sr-only">Sign up with Google</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      type="button" 
                      className="w-full"
                      onClick={() => handleOAuthSignUp("oauth_facebook")}
                      disabled={isLoading || isSignedIn}
                    >
                      <Image 
                        src="/meta.svg" 
                        alt="Meta logo" 
                        width={24} 
                        height={24} 
                      />
                      <span className="sr-only">Sign up with Meta</span>
                    </Button>
                  </div>
                  <div className="text-center text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="underline underline-offset-4">
                      Login
                    </Link>
                  </div>
                </div>
              </form>
              <div className="bg-muted relative hidden md:block">
                <Image
                  src="/Images/tim-stief-mountain-image.jpg"
                  alt="Mountain landscape"
                  fill
                  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                  priority
                />
                <div className="absolute bottom-2 left-2 text-[10px] text-white/80">
                  Photo by{" "}
                  <a
                    href="https://unsplash.com/@timstief?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Tim Stief
                  </a>{" "}
                  on{" "}
                  <a
                    href="https://unsplash.com/photos/body-of-water-and-snow-covered-mountains-during-daytime-YFFGkE3y4F8?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
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
            By clicking Create Account, you agree to our <a href="#">Terms of Service</a>{" "}
            and <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  )
} 
