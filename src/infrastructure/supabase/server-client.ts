import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { clientEnv } from '@/shared/config/env';

import type { AtlasSupabaseClient } from './browser-client';
import type { Database } from './database.types';

/**
 * A request-scoped Supabase client for Server Components, Server Actions, and
 * Route Handlers.
 *
 * A new client per request, never a module-level singleton: a shared instance
 * would carry one user's session cookies into another user's request. That is
 * the single most damaging mistake available in SSR auth, so the factory shape
 * here exists specifically to make it awkward to get wrong.
 */
export async function createServerSupabaseClient(): Promise<AtlasSupabaseClient> {
  // `cookies()` first, deliberately. Awaiting it marks the route dynamic before
  // anything else can throw, so a missing environment variable surfaces as a
  // clear runtime error rather than a confusing static-generation failure.
  const cookieStore = await cookies();
  const env = clientEnv();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Components are forbidden from writing cookies. This is
            // expected and safe to swallow *only* because the proxy
            // (src/proxy.ts) refreshes the session on every request and writes
            // the rotated tokens there. Without that proxy this catch would
            // silently discard refreshed tokens and log users out at random.
          }
        },
      },
    },
  );
}
