'use server';

import { createServerContainer } from '@/server/container';
import { getSession } from '@/server/session';

/**
 * Records the browser's timezone.
 *
 * This is the smallest possible instance of the About You idea: Atlas learning
 * one thing about the user without being asked. It is gated on an authenticated
 * session so an anonymous request cannot write preference cookies, and the value
 * is validated inside the store before it is trusted.
 */
export async function captureTimezoneAction(timezone: string): Promise<void> {
  const session = await getSession();
  if (session.status === 'unauthenticated') return;

  const { personalization } = await createServerContainer();
  await personalization.rememberTimezone(timezone);
}
