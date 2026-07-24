import { type NextRequest, NextResponse } from 'next/server';

import { isFailure } from '@/core/result';
import { createServerContainer } from '@/server/container';
import { routes, sanitiseRedirectPath } from '@/shared/config/routes';

/**
 * The PKCE redirect target.
 *
 * Supabase sends the user here after an email confirmation or an OAuth
 * handshake, carrying a single-use `code`. Exchanging it establishes the
 * session cookies; a Route Handler is used rather than a page because it can
 * write those cookies and issue a redirect in one response.
 *
 * Notice what this endpoint does *not* do: trust the `next` parameter. It
 * arrives from an email link, which is exactly the vector an attacker would use
 * to turn a legitimate confirmation URL into a redirect to their own site.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = request.nextUrl;

  const code = searchParams.get('code');
  const next = sanitiseRedirectPath(searchParams.get('next')) ?? routes.dashboard;

  // Supabase reports a refused or expired link with these parameters rather
  // than a code. Forward the reason so the error page can be specific.
  const errorDescription = searchParams.get('error_description');
  if (errorDescription !== null) {
    const destination = new URL(routes.authError, origin);
    destination.searchParams.set('reason', errorDescription);
    return NextResponse.redirect(destination);
  }

  if (code === null) {
    return NextResponse.redirect(new URL(routes.authError, origin));
  }

  const { auth } = await createServerContainer();
  const result = await auth.exchangeCodeForSession(code);

  if (isFailure(result)) {
    const destination = new URL(routes.authError, origin);
    destination.searchParams.set('reason', result.error.message);
    return NextResponse.redirect(destination);
  }

  // `origin` comes from the parsed request URL, so the destination is always
  // same-origin regardless of what the link contained.
  return NextResponse.redirect(new URL(next, origin));
}
