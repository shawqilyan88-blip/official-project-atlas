'use server';

import { redirect } from 'next/navigation';

import { OrganizationId, UserId } from '@/core/entities';
import { isFailure } from '@/core/result';
import { createServerContainer } from '@/server/container';
import { getSession } from '@/server/session';
import { routes } from '@/shared/config/routes';
import {
  type ActionState,
  fromAppError,
  validationErrorState,
} from '@/shared/lib/action-state';

import {
  createOrganizationSchema,
  switchOrganizationSchema,
  updateProfileSchema,
} from './domain/schemas';

/**
 * Tenancy Server Actions.
 *
 * Both actions independently re-establish who the caller is. A Server Action is
 * a public endpoint: it can be invoked directly, out of order, and without ever
 * rendering the page that normally precedes it.
 */

export async function createOrganizationAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession();
  if (session.status === 'unauthenticated') redirect(routes.signIn);

  const parsed = createOrganizationSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
  });

  if (!parsed.success) return validationErrorState(parsed.error);

  const { tenancy, activeOrganization } = await createServerContainer();

  const result = await tenancy.createOrganizationWithOwner({
    name: parsed.data.name,
    slug: parsed.data.slug,
  });

  if (isFailure(result)) return fromAppError(result.error);

  // Land the user in the workspace they just created rather than whichever one
  // sorts first.
  await activeOrganization.write(result.value.id);

  redirect(routes.dashboard);
}

export async function switchOrganizationAction(formData: FormData): Promise<void> {
  const parsed = switchOrganizationSchema.safeParse({
    organizationId: formData.get('organizationId'),
  });

  // A malformed id means a tampered or stale form. Return the user to their
  // current workspace rather than acting on it.
  if (!parsed.success) redirect(routes.dashboard);

  const session = await getSession();
  if (session.status === 'unauthenticated') redirect(routes.signIn);
  if (session.status === 'needs-onboarding') redirect(routes.onboarding);

  const target = OrganizationId(parsed.data.organizationId);

  // The authorisation check: the cookie is only written for an organization
  // this user demonstrably belongs to. Skipping this would let anyone switch
  // into any workspace by posting an arbitrary id — RLS would then return
  // empty results, producing a confusing broken shell instead of a clean denial.
  const isMember = session.context.memberships.some(
    (membership) => membership.organizationId === target,
  );

  if (!isMember) redirect(routes.dashboard);

  const { activeOrganization } = await createServerContainer();
  await activeOrganization.write(target);

  redirect(routes.dashboard);
}

export async function updateDisplayNameAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession();
  if (session.status === 'unauthenticated') redirect(routes.signIn);

  const parsed = updateProfileSchema.safeParse({ fullName: formData.get('fullName') });
  if (!parsed.success) return validationErrorState(parsed.error);

  const profileId =
    session.status === 'ready' ? session.context.profile.id : session.profile.id;

  const { tenancy } = await createServerContainer();
  const result = await tenancy.updateProfile(UserId(profileId), {
    fullName: parsed.data.fullName,
  });

  if (isFailure(result)) return fromAppError(result.error);

  return { status: 'success', data: undefined };
}
