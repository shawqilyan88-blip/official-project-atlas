'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

import { clientEnv } from '@/shared/config/env';

import type { Database } from './database.types';

export type AtlasSupabaseClient = SupabaseClient<Database>;

let client: AtlasSupabaseClient | undefined;

/**
 * The browser Supabase client.
 *
 * Memoised because every call to `createBrowserClient` starts its own token
 * refresh timer and auth-state listener; creating one per component render
 * produces duplicate refreshes and occasional spurious sign-outs.
 *
 * Only ever holds the publishable key, so it is bound by Row Level Security
 * exactly like any other untrusted caller.
 */
export function getBrowserSupabaseClient(): AtlasSupabaseClient {
  const env = clientEnv();

  client ??= createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  return client;
}
