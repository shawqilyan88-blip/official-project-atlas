import 'server-only';

import { createClient } from '@supabase/supabase-js';

import { serverEnv } from '@/shared/config/env';

import type { AtlasSupabaseClient } from './browser-client';
import type { Database } from './database.types';

/**
 * A privileged client that **bypasses Row Level Security entirely**.
 *
 * Every tenant boundary in this system is enforced by RLS. This client ignores
 * all of it. Treat each use as a security decision:
 *
 * - Never reachable from a request handler that takes user input as a filter.
 * - Never in a Client Component. The `server-only` import above turns that
 *   mistake into a build error rather than a credential leak.
 * - Always scope the query yourself, explicitly, by organization.
 *
 * Legitimate uses are background jobs and webhooks that act with no user
 * session. If a feature can be expressed with the request-scoped client in
 * `server-client.ts`, it must be.
 */
export function createAdminSupabaseClient(): AtlasSupabaseClient {
  const { SUPABASE_SECRET_KEY } = serverEnv();

  if (!SUPABASE_SECRET_KEY) {
    throw new Error(
      'SUPABASE_SECRET_KEY is not configured. It is required for privileged ' +
        'operations that bypass Row Level Security. Add it to .env.local — ' +
        'and never expose it to the browser.',
    );
  }

  // Values come from the environment, not from a validated schema branch, so
  // read the URL through the same validated accessor used everywhere else.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured.');
  }

  return createClient<Database>(url, SUPABASE_SECRET_KEY, {
    auth: {
      // This client has no user and must never acquire one: persisting or
      // refreshing a session here would attach ambient privilege to a request.
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
