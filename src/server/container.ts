import 'server-only';

import { createServerSupabaseClient } from '@/infrastructure/supabase/server-client';
import type { AuthGateway } from '@/modules/auth/application/ports';
import { SupabaseAuthGateway } from '@/modules/auth/infrastructure/supabase-auth-gateway';
import type {
  ActiveOrganizationStore,
  TenancyRepository,
} from '@/modules/tenancy/application/ports';
import { CookieActiveOrganizationStore } from '@/modules/tenancy/infrastructure/active-organization-cookie';
import { SupabaseTenancyRepository } from '@/modules/tenancy/infrastructure/supabase-tenancy-repository';

/**
 * The composition root.
 *
 * This is the only module that knows both the ports and their Supabase
 * implementations. Everything else depends on interfaces, which is what keeps
 * the dependency arrows pointing inward — and what makes a use-case testable
 * by handing it a fake instead of standing up a database.
 *
 * Built per request, never cached: the underlying Supabase client carries the
 * caller's session cookies, so a shared container would leak one user's
 * identity into another user's request.
 */
export interface ServerContainer {
  readonly auth: AuthGateway;
  readonly tenancy: TenancyRepository;
  readonly activeOrganization: ActiveOrganizationStore;
}

export async function createServerContainer(): Promise<ServerContainer> {
  const client = await createServerSupabaseClient();

  return {
    auth: new SupabaseAuthGateway(client),
    tenancy: new SupabaseTenancyRepository(client),
    activeOrganization: new CookieActiveOrganizationStore(),
  };
}
