/**
 * Every path in the application, defined once.
 *
 * Hard-coded route strings scattered through components are how a rename turns
 * into a broken link nobody notices for a week. Route groups such as
 * `(marketing)` and `(app)` do not appear in URLs, so these constants are the
 * only reliable description of the real URL surface.
 */

export const routes = {
  home: '/',
  // Landing-page anchors. These previously carried a `pricing` key pointing at
  // `/#pricing`, while the section it targeted was headed "How it works" and no
  // pricing content existed anywhere — a mislabelled anchor and a nav item that
  // promised something the page did not have.
  platform: '/#platform',
  howItWorks: '/#how-it-works',
  security: '/#security',

  signIn: '/sign-in',
  signUp: '/sign-up',
  checkEmail: '/check-email',
  authCallback: '/auth/callback',
  authError: '/auth/auth-code-error',

  onboarding: '/onboarding',

  dashboard: '/dashboard',
  buyers: '/buyers',
  suppliers: '/suppliers',
  conversations: '/conversations',
  deals: '/deals',
  outreach: '/outreach',
  settings: '/settings',
  settingsMembers: '/settings/members',
} as const;

export type AppRoute = (typeof routes)[keyof typeof routes];

/** Routes reachable without a session. Everything else requires one. */
export const PUBLIC_ROUTES: readonly string[] = [
  routes.home,
  routes.signIn,
  routes.signUp,
  routes.checkEmail,
  routes.authCallback,
  routes.authError,
] as const;

/** Routes an authenticated user should be bounced away from. */
export const AUTH_ONLY_ROUTES: readonly string[] = [
  routes.signIn,
  routes.signUp,
] as const;

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isAuthOnlyRoute(pathname: string): boolean {
  return AUTH_ONLY_ROUTES.some((route) => pathname === route);
}

/**
 * Builds a sign-in URL that remembers where the user was headed.
 *
 * Only same-origin relative paths survive: an absolute URL here would turn the
 * redirect into an open-redirect vulnerability, handing attackers a link that
 * looks like ours but lands on theirs.
 */
export function signInUrlWithRedirect(intendedPath: string): string {
  const safePath = sanitiseRedirectPath(intendedPath);
  if (!safePath || safePath === routes.dashboard) return routes.signIn;
  return `${routes.signIn}?redirectTo=${encodeURIComponent(safePath)}`;
}

/**
 * Accepts only single-slash-prefixed relative paths. Rejects `//evil.com`
 * (protocol-relative), `https://evil.com`, and backslash variants that some
 * browsers normalise into a host.
 */
export function sanitiseRedirectPath(
  candidate: string | null | undefined,
): string | null {
  if (!candidate) return null;
  if (!candidate.startsWith('/')) return null;
  if (candidate.startsWith('//') || candidate.startsWith('/\\')) return null;
  if (candidate.includes('\\')) return null;
  return candidate;
}
