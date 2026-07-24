'use client';

import { useEffect } from 'react';

import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';

/**
 * The application error boundary.
 *
 * Next.js strips the real message from `error` in production and substitutes a
 * `digest` that correlates to the server log — which is exactly right: an
 * unhandled error's text routinely contains query fragments and stack traces
 * that should never reach a browser. Rendering the digest gives support
 * something precise to search for without exposing anything.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[boundary] Unhandled application error', error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-12">
      <Card elevated>
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            An unexpected error interrupted that request. Trying again often resolves it.
          </p>

          {error.digest !== undefined && (
            <p className="font-mono text-xs text-muted-foreground">
              Reference: {error.digest}
            </p>
          )}

          <Button onClick={reset} block>
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
