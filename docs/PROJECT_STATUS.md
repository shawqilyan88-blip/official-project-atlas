# Project Status

**Project:** Project Atlas — an AI-powered international trade operating system
**Sprint:** 1 — Production foundation
**Status:** Complete, verified
**Last updated:** 2026-07-25

---

## Verification

Every gate below was run against a clean build tree and passes.

| Gate             | Command                | Result                              |
| ---------------- | ---------------------- | ----------------------------------- |
| Type safety      | `npm run typecheck`    | Pass, zero errors                   |
| Lint             | `npm run lint`         | Pass, zero errors and zero warnings |
| Formatting       | `npm run format:check` | Pass                                |
| Production build | `npm run build`        | Pass, 10 routes                     |

Route classification from the build output — authenticated routes are dynamic by
declaration, never prerendered:

```
○ /                      static
○ /sign-up               static
○ /_not-found            static
ƒ /sign-in               dynamic (reads searchParams)
ƒ /dashboard             dynamic
ƒ /settings              dynamic
ƒ /settings/members      dynamic
ƒ /onboarding            dynamic
ƒ /auth/callback         dynamic
ƒ /auth/auth-code-error  dynamic
ƒ Proxy (Middleware)     registered
```

---

## Delivered in Sprint 1

### Foundation

- Next.js 16.2 (App Router, Turbopack), React 19.2, TypeScript 6 in strict mode
  plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `noImplicitReturns`, and `verbatimModuleSyntax`
- Tailwind CSS 4.3 with a CSS-first semantic token layer
- ESLint 9 flat config, Prettier with the Tailwind class-order plugin
- Architecture boundaries enforced by lint rules, not convention alone

### Multi-tenancy

- `organizations`, `profiles`, `memberships` with a three-tier role model
  (`owner` > `admin` > `member`)
- Row Level Security on every table, with `SECURITY DEFINER` helper functions to
  avoid recursive policy evaluation
- Privilege-escalation guards: nobody may grant or act upon a role above their own
- An organization is guaranteed to always retain at least one owner
- Organizations can only be created through an atomic
  `create_organization_with_owner` function, making a member-less organization
  unrepresentable

### Authentication

- Cookie-based sessions via `@supabase/ssr`, verified with `getClaims()` (JWT
  signature checked) rather than the unvalidated `getSession()`
- Sign up, sign in, sign out, email confirmation, PKCE callback
- Session refresh in `src/proxy.ts` (Next.js 16's renamed middleware), writing
  rotated tokens to both request and response
- Two independent guards: the proxy for responsiveness, `requireTenantContext()`
  for authority, and RLS underneath both

### Interface

- Landing page, authentication screens, onboarding, workspace dashboard,
  settings, and members
- Responsive shell: sidebar rail above `lg`, focus-trapped sheet below it
- Light/dark/system theming with no flash on first paint
- Accessibility: skip links, visible focus rings, `aria-describedby` wiring on
  every field, `prefers-reduced-motion` honoured, zoom never capped

---

## Not yet done

These are deliberate Sprint 1 exclusions, not oversights. See `ROADMAP.md`.

- **Supabase project not provisioned.** `.env.local` holds placeholder values;
  migrations are written but not yet applied. This is the only thing standing
  between the current build and a working sign-in. See `NEXT_TASK.md`.
- No teammate invitations or role editing — the permission model and its
  policies exist, the UI does not
- No automated tests — the harness is a Sprint 2 task
- No trade modules (buyers, suppliers, conversations, outreach, deals)
- Account deletion is blocked for a sole owner by design; ownership transfer is
  not built yet

---

## Known environment issue

**Windows path casing.** This project folder was renamed from
`official Project atlas` to `Official Project Atlas`. Node caches modules by
literal path string, so invoking the toolchain from a shell whose working
directory uses the old casing loads **two copies of Next.js** — one per casing —
and the build fails during prerender with:

```
Invariant: Expected workStore to be initialized. This is a bug in Next.js.
```

It is not a Next.js bug. The two copies have separate `workAsyncStorage`
instances, so the store initialised by the prerenderer is invisible to the
renderer. If you hit this, open a fresh terminal at the canonical path:

```bash
cd "C:/Users/Ahmed/Official Project Atlas" && npm run build
```
