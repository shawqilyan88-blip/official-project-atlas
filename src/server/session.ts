import 'server-only';

import { redirect } from 'next/navigation';
import { cache } from 'react';

import type { TenantContext } from '@/core/entities';
import { isFailure } from '@/core/result';
import {
  resolveTenantContext,
  type TenantResolution,
} from '@/modules/tenancy/application/resolve-tenant-context';
import { routes } from '@/shared/config/routes';

import { createServerContainer } from './container';

/**
 * Server-side session helpers.
 *
 * `cache()` deduplicates within a single request: a layout, a page, and three
 * components can each ask for the tenant context and the work happens once.
 * It is per-request memoisation, not a cross-request cache, so no session data
 * survives into another user's request.
 */
const getTenantResolution = cache(async (): Promise<TenantResolution> => {
  const container = await createServerContainer();
  const result = await resolveTenantContext(container);

  if (isFailure(result)) {
    // A failure here means the auth service or database is unreachable. Failing
    // closed — treating it as signed out — is the safe direction.
    console.error('[session] Failed to resolve tenant context', result.error);
    return { status: 'unauthenticated' };
  }

  return result.value;
});

/** The current resolution, without imposing any redirect policy. */
export async function getSession(): Promise<TenantResolution> {
  return getTenantResolution();
}

/**
 * Guarantees a fully resolved tenant context, or navigates away.
 *
 * Every protected page calls this. It re-verifies the session server-side
 * rather than trusting that the proxy ran, because a page can be reached in
 * ways the proxy matcher does not cover, and defence in depth is cheaper than
 * auditing every route.
 */
export async function requireTenantContext(): Promise<TenantContext> {
  const resolution = await getTenantResolution();

  if (resolution.status === 'ready') return resolution.context;
  if (resolution.status === 'needs-onboarding') redirect(routes.onboarding);

  // `redirect` throws internally, so control never returns past these calls.
  redirect(routes.signIn);
}

/**
 * Requires a signed-in user who has *not* yet created a workspace. Used by the
 * onboarding route so that an already-provisioned user cannot linger there.
 */
export async function requireOnboardingCandidate() {
  const resolution = await getTenantResolution();

  if (resolution.status === 'unauthenticated') redirect(routes.signIn);
  if (resolution.status === 'ready') redirect(routes.dashboard);

  return resolution.profile;
}
