# Changelog

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] — 2026-07-25

Sprint 1 — production foundation. First release. No public API yet, so nothing
is deprecated or removed.

### Added

#### Toolchain

- Next.js 16.2.11 (App Router, Turbopack), React 19.2.8, TypeScript 6.0.3
- Strict TypeScript beyond `strict`: `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, `noImplicitOverride`, `noImplicitReturns`,
  `noFallthroughCasesInSwitch`, `noUnusedLocals`, `noUnusedParameters`,
  `verbatimModuleSyntax`
- Tailwind CSS 4.3.3 with CSS-first configuration
- ESLint 9 flat config, Prettier 3.9 with `prettier-plugin-tailwindcss`
- Architecture boundaries enforced via `no-restricted-imports`: `src/core` may
  not import a framework or vendor SDK; module application and domain layers may
  not import Supabase
- `npm run verify` — typecheck, lint, and format check in one command

#### Domain core

- `Result<T, E>` with `success`, `failure`, `isSuccess`, `isFailure`, `mapResult`
- Error hierarchy with stable codes, client-safe messages, and sensitive detail
  isolated in `cause`
- Branded `UserId`, `OrganizationId`, `MembershipId` — a compile error rather than
  a silent cross-tenant bug when ids are swapped
- `Organization`, `Profile`, `Membership`, `TenantContext` entities
- Role model (`owner` > `admin` > `member`) with named permissions and
  `assignableRoles`, which prevents promotion above one's own rank

#### Database

- `20260724120000_initial_schema.sql` — `app_role` enum ordered ascending by
  privilege so authorisation reads as `role >= 'admin'`; `profiles`,
  `organizations`, `memberships` with CHECK constraints; `updated_at` triggers;
  `prevent_last_owner_removal` guaranteeing every organization keeps an owner,
  while still permitting organization deletion via cascade
- `20260724120001_row_level_security.sql` — RLS enabled on all three tables;
  `SECURITY DEFINER` helpers (`is_org_member`, `org_role`, `has_org_role`,
  `shares_organization_with`) with `search_path = ''`; policies blocking
  privilege escalation on membership insert, update, and delete; `anon` revoked
  from every table
- `20260724120002_auth_and_provisioning.sql` — `handle_new_user` provisioning a
  profile on signup with values truncated to fit CHECK constraints so signup
  cannot fail opaquely; `handle_user_email_change` preventing email drift;
  `create_organization_with_owner` creating organization and owner atomically;
  `is_organization_slug_available` answering availability without exposing the
  organization directory
- `supabase/config.toml` with a 12-character minimum password and confirmations on

#### Authentication

- Cookie-based sessions via `@supabase/ssr`
- Four client factories with distinct constraints: browser (memoised),
  server (per request), admin (`server-only`, RLS-bypassing, documented as a
  security decision), proxy (request/response cookie wiring)
- `src/proxy.ts` — Next.js 16 proxy convention; refreshes the session and writes
  rotated tokens to both request and response, and propagates Supabase's
  `no-store` headers so a CDN cannot cache one user's `Set-Cookie`
- Sign up, sign in, sign out (`local` scope), email confirmation, PKCE callback
- Postgres and auth error translation to domain errors

#### Multi-tenancy

- `resolveTenantContext` returning a discriminated union so the onboarding case
  cannot be forgotten
- Active-workspace cookie: `httpOnly`, `sameSite=lax`, validated against real
  memberships on every read
- Workspace switcher posting to a Server Action, functional without JavaScript
- Onboarding flow, placed outside the `(app)` route group to avoid a redirect loop

#### Interface

- Design system on OKLCH semantic tokens with light and dark themes, elevation
  and motion scales, and the shadcn/ui variable contract for drop-in
  compatibility
- Primitives: Button, Input, Label, FormField, Card, Alert, Badge, Avatar,
  DropdownMenu, Sheet, Separator, Skeleton, PageHeader, Wordmark
- `FormField` centralising `htmlFor`, `aria-describedby`, and `aria-invalid`
- Theme system via `next-themes` with no flash on first paint
- Landing page, auth screens, dashboard, settings, members
- Responsive shell: sidebar above `lg`, focus-trapped Radix Dialog sheet below
- Skip links, `:focus-visible` rings, `prefers-reduced-motion`, uncapped zoom
- Security headers in `next.config.ts`: CSP scoped to the Supabase origin, HSTS,
  `nosniff`, `frame-ancestors 'none'`, restrictive `Permissions-Policy`

### Fixed

Issues found and resolved while verifying the build.

- **`asChild` with `loading` crashed the Button.** Radix `Slot` accepts exactly
  one child; the spinner treatment wraps children in a fragment. Now suppressed
  when `asChild` is set.
- **Onboarding inside `(app)` caused an infinite redirect loop.** The group's
  layout redirects to onboarding when no workspace exists. Moved to `src/app/`.
- **Invalid HTML on the onboarding page** — a `<form>` nested inside a `<p>`.
- **`prevent_last_owner_removal` made organizations undeletable.** The cascade
  from `organizations` fired the guard on its own membership rows. It now stands
  down when the parent organization is already gone.
- **Unvalidated profile name could 500.** `updateDisplayNameAction` hand-rolled
  its validation and omitted a length check, so a name over 80 characters hit the
  database CHECK. Replaced with `updateProfileSchema`.
- **`signOutAction` return type was incompatible with `<form action>`.** Now
  returns `void` and clears the local session even if the provider call fails.
- **Theme toggle triggered a cascading render.** The mount-flag pattern called
  `setState` inside an effect (`react-hooks/set-state-in-effect`). The trigger
  icon is now selected by CSS via the `dark:` variant — correct before hydration,
  zero JavaScript, no flicker.
- **`createContext is not a function` broke the production build.**
  `lucide-react`'s package entry re-exports a provider from a module that calls
  `React.createContext`, with no `'use client'` directive on the entry; the same
  applies to `@radix-ui/react-slot`. Added the `src/shared/ui/icons.ts` client
  boundary and marked `button.tsx` as client code.
- **Authenticated routes were being statically prerendered.** Declared
  `dynamic = 'force-dynamic'` on the `(app)` layout and onboarding.
- **`clientEnv()` ran before `cookies()`** in the server client factory, so a
  missing variable surfaced as a static-generation failure rather than a clear
  runtime error. Reordered.

### Known issues

- `.env.local` contains placeholder credentials; the Supabase project is not yet
  provisioned and migrations are not applied. See `NEXT_TASK.md`.
- No automated tests (ADR-015).
- Deleting an account fails for the sole owner of a surviving organization. Safe
  by design; needs an ownership-transfer flow.
- On Windows, running the toolchain from a path whose casing differs from the
  folder's real casing loads two copies of Next.js and fails the build with
  `Invariant: Expected workStore to be initialized`. See `PROJECT_STATUS.md`.

### Pinned dependencies

- `typescript@6.0.3` — typescript-eslint does not support TS 7 (ADR-010)
- `eslint@9.39.5` — `eslint-plugin-react` uses an API removed in ESLint 10
  (ADR-011)
