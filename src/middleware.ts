import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that are always accessible
const publicRoutes = [
  '/login(.*)',
  '/signup(.*)',
  '/sign-in(.*)',
  '/sso-callback(.*)'
];

// Define auth routes that should be accessible even when logged in
const authRoutes = [
  '/login(.*)',
  '/signup(.*)',
  '/sign-in(.*)',
  '/sso-callback(.*)'
];

export default clerkMiddleware(async (auth, req) => {
  const isPublicRoute = createRouteMatcher(publicRoutes)(req);
  const isAuthRoute = createRouteMatcher(authRoutes)(req);
  
  // Public routes are always accessible
  if (isPublicRoute) {
    return;
  }
  
  // Protected routes require authentication
  if (!isAuthRoute) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};