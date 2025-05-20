'use client';

import { ClerkProvider as BaseClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useTheme } from 'next-themes';

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  
  return (
    <BaseClerkProvider
      appearance={{
        baseTheme: theme === 'dark' ? dark : undefined,
        variables: {
          colorPrimary: 'hsl(262.1 83.3% 57.8%)',
        },
      }}
    >
      {children}
    </BaseClerkProvider>
  );
} 