import { z } from 'zod';

/**
 * Validated environment configuration.
 *
 * Two separate schemas, on purpose:
 *
 * - `clientEnv` holds only `NEXT_PUBLIC_*` values and is safe in any bundle.
 * - `serverEnv` holds secrets and throws if it is ever evaluated in a browser.
 *
 * Every `process.env.X` below is written out literally rather than looked up
 * dynamically, because Next.js inlines these at build time by static analysis —
 * `process.env[name]` would silently produce `undefined` in the client bundle.
 */

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .url({ error: 'NEXT_PUBLIC_SUPABASE_URL must be a valid URL.' })
    .refine((value) => value.startsWith('https://') || value.includes('localhost'), {
      error: 'Supabase URL must use HTTPS outside of local development.',
    }),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20, {
    error: 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY looks too short to be valid.',
  }),
  NEXT_PUBLIC_SITE_URL: z
    .url({ error: 'NEXT_PUBLIC_SITE_URL must be a valid absolute URL.' })
    .default('http://localhost:3000'),
});

/**
 * An optional secret that tolerates a blank value. In a `.env` file an unset key
 * is written `KEY=`, which arrives as `''` — not `undefined` — so a plain
 * `.optional()` would reject it as "too short". Blank means "not set" here.
 */
const optionalSecret = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().min(20).optional(),
);

const serverSchema = z.object({
  /**
   * Optional in Sprint 1. Present only where a privileged operation genuinely
   * needs to bypass RLS; the code that reads it must justify why.
   */
  SUPABASE_SECRET_KEY: optionalSecret,
  /**
   * Anthropic API key for AI document extraction (Sprint 3.2). Optional: when
   * absent, extraction reports "not configured" rather than failing — the app
   * never fabricates extracted values. Server-only; never NEXT_PUBLIC_.
   */
  ANTHROPIC_API_KEY: optionalSecret,
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export type ClientEnv = z.infer<typeof clientSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

function formatIssues(issues: readonly z.core.$ZodIssue[]): string {
  return issues
    .map((issue) => `  • ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
}

function parseClientEnv(): ClientEnv {
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });

  if (!parsed.success) {
    throw new Error(
      'Invalid public environment configuration.\n' +
        `${formatIssues(parsed.error.issues)}\n\n` +
        'Copy .env.example to .env.local and fill in the values from your ' +
        'Supabase project (Project Settings → API).',
    );
  }

  return parsed.data;
}

function parseServerEnv(): ServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error(
      'serverEnv was read in the browser. Move this code into a Server ' +
        'Component, Server Action, or Route Handler.',
    );
  }

  const parsed = serverSchema.safeParse({
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid server environment configuration.\n${formatIssues(parsed.error.issues)}`,
    );
  }

  return parsed.data;
}

/**
 * Validated once per process and cached. Access is lazy so that merely
 * importing a module does not crash a build that has no `.env.local` yet —
 * the failure surfaces on first use, where the message is actionable.
 */
let cachedClientEnv: ClientEnv | undefined;
let cachedServerEnv: ServerEnv | undefined;

export function clientEnv(): ClientEnv {
  cachedClientEnv ??= parseClientEnv();
  return cachedClientEnv;
}

export function serverEnv(): ServerEnv {
  cachedServerEnv ??= parseServerEnv();
  return cachedServerEnv;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}
