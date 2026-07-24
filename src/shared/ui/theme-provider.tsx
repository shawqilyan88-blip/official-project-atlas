'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type * as React from 'react';

/**
 * Theme root.
 *
 * `next-themes` injects a small blocking script that sets the theme class
 * before first paint. Without it a dark-mode user sees a white flash on every
 * cold load, because the server cannot know the preference — it lives in
 * localStorage and the OS setting, neither of which is available at render
 * time. Pairing this with `suppressHydrationWarning` on <html> is required:
 * that script legitimately mutates the element before React hydrates.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      // Cuts the transition flicker while every token swaps at once.
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
