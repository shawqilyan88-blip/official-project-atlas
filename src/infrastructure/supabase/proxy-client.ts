import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { clientEnv } from '@/shared/config/env';

import type { Database } from './database.types';

export interface SessionRefreshResult {
  /**
   * The response carrying any rotated auth cookies. A caller that redirects
   * instead of returning this must copy the cookies across — see
   * `withRefreshedCookies`.
   */
  readonly response: NextResponse;
  /** The verified subject of the JWT, or `null` when there is no valid session. */
  readonly userId: string | null;
}

/**
 * Refreshes the Supabase session for an incoming request.
 *
 * The cookie dance below is precise and unforgiving. When Supabase rotates a
 * token it must be written to *both* the request (so that Server Components
 * rendered later in this same pass observe the new session) and the response
 * (so the browser stores it). Writing only one produces the notorious
 * intermittent-logout bug, which reproduces roughly never in development and
 * constantly under real traffic.
 *
 * Identity comes from `getClaims()`, which verifies the JWT signature against
 * the project's published keys. `getSession()` would be wrong here: it returns
 * whatever the cookie says without validating it, and a cookie is attacker-
 * controlled input.
 */
export async function refreshSession(
  request: NextRequest,
): Promise<SessionRefreshResult> {
  const env = clientEnv();

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          response = NextResponse.next({ request });

          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }

          // Supabase supplies no-store headers alongside rotated cookies.
          // Honouring them is not optional: a CDN that caches a response
          // carrying Set-Cookie will serve one user's session to another.
          for (const [key, value] of Object.entries(headers)) {
            response.headers.set(key, value);
          }
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const subject = data?.claims.sub;

  return {
    response,
    userId: typeof subject === 'string' && subject.length > 0 ? subject : null,
  };
}

/**
 * Carries refreshed auth cookies and cache headers onto a different response —
 * typically a redirect. Dropping them here would discard the rotated token and
 * force another refresh on the very next request.
 */
export function withRefreshedCookies(
  target: NextResponse,
  source: NextResponse,
): NextResponse {
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie);
  }

  for (const header of ['cache-control', 'expires', 'pragma']) {
    const value = source.headers.get(header);
    if (value) target.headers.set(header, value);
  }

  return target;
}
