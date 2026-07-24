import { cookies } from 'next/headers';

import { OrganizationId, isUuid } from '@/core/entities';
import { isProduction } from '@/shared/config/env';
import type { ActiveOrganizationStore } from '@/modules/tenancy/application/ports';

const COOKIE_NAME = 'atlas.active_organization';
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

/**
 * Remembers which workspace the user was last in.
 *
 * This cookie is a *preference*, never a permission. Its value is attacker-
 * controlled — anyone can edit a cookie — so the resolver in
 * `resolve-tenant-context.ts` checks it against the user's actual memberships
 * and discards it if it does not match. Treating it as authoritative would be
 * a one-line cross-tenant data leak.
 *
 * `httpOnly` keeps it away from client scripts, and `lax` stops it riding
 * along on cross-site requests.
 */
export class CookieActiveOrganizationStore implements ActiveOrganizationStore {
  async read(): Promise<OrganizationId | null> {
    const store = await cookies();
    const value = store.get(COOKIE_NAME)?.value;

    // Reject anything that is not a UUID before it reaches a query.
    if (!value || !isUuid(value)) return null;
    return OrganizationId(value);
  }

  async write(organizationId: OrganizationId): Promise<void> {
    const store = await cookies();
    store.set(COOKIE_NAME, organizationId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction(),
      path: '/',
      maxAge: ONE_YEAR_IN_SECONDS,
    });
  }

  async clear(): Promise<void> {
    const store = await cookies();
    store.delete(COOKIE_NAME);
  }
}
