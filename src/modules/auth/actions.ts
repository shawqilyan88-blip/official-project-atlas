'use server';

import { redirect } from 'next/navigation';

import { isFailure } from '@/core/result';
import { createServerContainer } from '@/server/container';
import { clientEnv } from '@/shared/config/env';
import { routes, sanitiseRedirectPath } from '@/shared/config/routes';
import {
  type ActionState,
  fromAppError,
  successState,
  validationErrorState,
} from '@/shared/lib/action-state';

import { signInSchema, signUpSchema } from './domain/schemas';

/**
 * Authentication Server Actions.
 *
 * Every action re-validates its input server-side. The client form runs the
 * same schema for fast feedback, but a Server Action is a public HTTP endpoint
 * — anything can POST to it, and client-side validation is a convenience for
 * honest users, never a control.
 *
 * Rate limiting is handled upstream by Supabase Auth (per-IP and per-address
 * limits on sign-in, signup, and email sends), which is why there is no
 * throttle here. See docs/DECISIONS.md.
 */

export async function signInAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    redirectTo: formData.get('redirectTo') ?? undefined,
  });

  if (!parsed.success) return validationErrorState(parsed.error);

  const { auth } = await createServerContainer();
  const result = await auth.signInWithPassword(parsed.data.email, parsed.data.password);

  if (isFailure(result)) return fromAppError(result.error);

  // Only same-origin relative paths are honoured, so a crafted `redirectTo`
  // cannot bounce a freshly authenticated user to an attacker's page.
  const destination = sanitiseRedirectPath(parsed.data.redirectTo) ?? routes.dashboard;

  // `redirect` throws a control-flow signal that Next.js catches. It must be
  // called outside any try/catch, or the framework never sees it.
  redirect(destination);
}

export async function signUpAction(
  _previousState: ActionState<{ email: string }>,
  formData: FormData,
): Promise<ActionState<{ email: string }>> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) return validationErrorState(parsed.error);

  const { auth } = await createServerContainer();
  const { NEXT_PUBLIC_SITE_URL } = clientEnv();

  const result = await auth.signUpWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
    fullName: parsed.data.fullName,
    emailRedirectTo: `${NEXT_PUBLIC_SITE_URL}${routes.authCallback}`,
  });

  if (isFailure(result)) return fromAppError(result.error);

  if (result.value.requiresEmailConfirmation) {
    return successState({ email: parsed.data.email });
  }

  // Confirmations are disabled, so the user is already signed in. Onboarding
  // takes it from here and creates their first workspace.
  redirect(routes.onboarding);
}

/**
 * Signing out always ends at the sign-in page.
 *
 * Returns `void` because it is bound directly to a `<form action>`. If the
 * provider call fails there is nothing useful to tell the user and nothing for
 * them to do about it — leaving them stranded in a half-signed-out shell would
 * be worse than proceeding, so the local session is cleared regardless.
 */
export async function signOutAction(): Promise<void> {
  const { auth, activeOrganization } = await createServerContainer();

  const result = await auth.signOut();
  if (isFailure(result)) {
    console.error('[auth] Sign-out failed; clearing local session anyway', result.error);
  }

  // Drop the workspace preference too, so the next person to use this browser
  // does not see a stale workspace name in the switcher.
  await activeOrganization.clear();

  redirect(routes.signIn);
}
