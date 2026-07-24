import { type Profile, type TenantContext, UserId } from '@/core/entities';
import type { AppError } from '@/core/errors';
import { isFailure, type Result, success } from '@/core/result';
import type { AuthGateway } from '@/modules/auth/application/ports';

import type { ActiveOrganizationStore, TenancyRepository } from './ports';

/**
 * The three states a request can be in. Modelling them as a union rather than
 * returning a nullable context means the caller cannot forget the onboarding
 * case — the compiler makes them handle it.
 */
export type TenantResolution =
  | { readonly status: 'unauthenticated' }
  | { readonly status: 'needs-onboarding'; readonly profile: Profile }
  | { readonly status: 'ready'; readonly context: TenantContext };

export interface ResolveTenantContextDependencies {
  readonly auth: AuthGateway;
  readonly tenancy: TenancyRepository;
  readonly activeOrganization: ActiveOrganizationStore;
}

/**
 * Establishes who is asking and which workspace they are acting in.
 *
 * Runs on every protected request, so the ordering matters:
 *
 * 1. Verify identity against the auth server — not against a cookie.
 * 2. Load the user's real memberships.
 * 3. Only then consider the preferred-workspace cookie, and only as a *hint*.
 *    If it names an organization the user is not a member of, it is silently
 *    discarded rather than honoured. This is the check that keeps a forged
 *    cookie from selecting somebody else's tenant.
 */
export async function resolveTenantContext(
  dependencies: ResolveTenantContextDependencies,
): Promise<Result<TenantResolution, AppError>> {
  const { auth, tenancy, activeOrganization } = dependencies;

  const userResult = await auth.getCurrentUser();
  if (isFailure(userResult)) return userResult;

  const user = userResult.value;
  if (!user) return success({ status: 'unauthenticated' });

  const userId = UserId(user.id);

  const [profileResult, membershipsResult] = await Promise.all([
    tenancy.findProfileById(userId),
    tenancy.listMembershipsForUser(userId),
  ]);

  if (isFailure(profileResult)) return profileResult;
  if (isFailure(membershipsResult)) return membershipsResult;

  const profile = profileResult.value;
  if (!profile) {
    // The auth user exists but the profile trigger has not landed yet. Treat
    // it as unauthenticated rather than crashing; the next request resolves.
    return success({ status: 'unauthenticated' });
  }

  const memberships = membershipsResult.value;
  if (memberships.length === 0) {
    return success({ status: 'needs-onboarding', profile });
  }

  const preferredId = await activeOrganization.read();
  const preferred = preferredId
    ? memberships.find((membership) => membership.organizationId === preferredId)
    : undefined;

  // Falls back to the oldest membership, which is the user's original
  // workspace and the least surprising default.
  const active = preferred ?? memberships[0];
  if (!active) return success({ status: 'needs-onboarding', profile });

  return success({
    status: 'ready',
    context: {
      profile,
      organization: active.organization,
      role: active.role,
      memberships,
    },
  });
}
