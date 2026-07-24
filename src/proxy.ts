import { NextResponse, type NextRequest } from 'next/server';

import {
  refreshSession,
  withRefreshedCookies,
} from '@/infrastructure/supabase/proxy-client';
import {
  isAuthOnlyRoute,
  isPublicRoute,
  routes,
  signInUrlWithRedirect,
} from '@/shared/config/routes';

/**
 * Request proxy — session refresh and route gating.
 *
 * (Next.js 16 renamed the `middleware` convention to `proxy`; the file name and
 * the exported function name are both part of that contract.)
 *
 * This is a **user-experience** guard, not the security boundary. It sends
 * signed-out visitors somewhere sensible instead of showing them an empty
 * shell. Actual data protection lives in Row Level Security, which holds even
 * if this file is bypassed entirely — and it can be, by anything that talks to
 * the database directly. Every page and Server Action therefore re-verifies the
 * session itself rather than trusting that this ran.
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Always refresh first: even a public page needs the rotated token written
  // back, or the session quietly expires while the user reads the landing page.
  const { response, userId } = await refreshSession(request);
  const isAuthenticated = userId !== null;

  if (!isAuthenticated && !isPublicRoute(pathname)) {
    const destination = new URL(
      signInUrlWithRedirect(pathname + request.nextUrl.search),
      request.url,
    );
    return withRefreshedCookies(NextResponse.redirect(destination), response);
  }

  if (isAuthenticated && isAuthOnlyRoute(pathname)) {
    const destination = new URL(routes.dashboard, request.url);
    return withRefreshedCookies(NextResponse.redirect(destination), response);
  }

  return response;
}

export const config = {
  /**
   * Skip anything that cannot carry a session: static assets, image
   * optimisation, metadata files. Running auth on those wastes a network round
   * trip per asset and, on image routes, can attach Set-Cookie to a cacheable
   * response.
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2|ttf)$).*)',
  ],
};
