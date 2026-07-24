# Architecture

## The one rule

Dependencies point inward. Nothing else in this document matters as much.

```
app  ──▶  modules  ──▶  core
 │           │
 └───────────┴──────▶  shared
```

`core` knows nothing about React, Next.js, or Supabase. A module's application
layer knows nothing about Supabase. Only a module's infrastructure layer, and
`src/infrastructure/`, touch a vendor SDK.

This is enforced by tooling rather than trust — `eslint.config.mjs` declares
`no-restricted-imports` boundaries, so a violation fails `npm run lint` rather
than surviving until someone notices in review.

---

## Layout

```
src/
  core/                       Pure domain. No framework, no vendor, no I/O.
    entities/                 Organization, Profile, Membership, Role, branded ids
    errors.ts                 Error vocabulary with stable machine-readable codes
    result.ts                 Result<T, E> — failure as a typed return value

  modules/<slice>/            One vertical slice per business capability
    domain/                   Slice-specific rules and Zod schemas
    application/              Use-cases and port interfaces
    infrastructure/           Adapters implementing those ports
    ui/                       Components belonging to this slice
    actions.ts                Server Actions — the slice's public write surface

  infrastructure/supabase/    Client factories, generated types, error mapping
  server/                     Composition root and session helpers
  shared/                     Design system, config, cross-cutting utilities
  app/                        Routing only. Thin.
  proxy.ts                    Session refresh and route gating
```

Current modules: `auth`, `tenancy`. Sprint 2 adds `buyers`, `suppliers`,
`conversations`.

---

## Why a `Result` type instead of exceptions

Use-cases return `Result<T, AppError>`. An expected outcome — a taken slug, a
wrong password — is a value, and the compiler forces the caller to handle it.
Exceptions stay reserved for genuinely exceptional conditions.

The security payoff is concrete: `AppError.message` is written to be shown to a
user, while the underlying driver error travels in `cause`, which is logged
server-side and never serialised. Raw Postgres messages name tables, columns,
and constraints — free reconnaissance for an attacker.

---

## Ports and adapters

Two ports exist today:

- `AuthGateway` (`modules/auth/application/ports.ts`) — implemented by
  `SupabaseAuthGateway`
- `TenancyRepository` (`modules/tenancy/application/ports.ts`) — implemented by
  `SupabaseTenancyRepository`

They earn their keep in two ways: a use-case can be tested with an in-memory fake
instead of a live database, and replacing the vendor means writing one new
adapter rather than editing every call site.

`src/server/container.ts` is the composition root — the only module that knows
both sides. It is built **per request**, never cached, because the Supabase
client it holds carries the caller's session cookies. A shared container would
leak one user's identity into another user's request.

---

## Multi-tenancy

`organizations` is the tenant boundary. Every business table added from Sprint 2
onward carries `organization_id` and follows the same RLS pattern.

Access derives entirely from `memberships`: no row for an organization means no
visibility into a single one of its records.

### The three-layer guard

| Layer         | File                           | Purpose                         | Trustworthy alone? |
| ------------- | ------------------------------ | ------------------------------- | ------------------ |
| Proxy         | `src/proxy.ts`                 | Refresh session, redirect early | No                 |
| Page / action | `src/server/session.ts`        | Re-verify, resolve tenant       | No                 |
| Database      | `supabase/migrations/…rls.sql` | Enforce isolation               | **Yes**            |

Only the bottom layer is a security boundary. The other two exist so users get
a sensible redirect instead of an empty shell, and they hold even if the
application layer is bypassed entirely — which it can be, by anything that
speaks Postgres.

### Resolving the active tenant

`resolveTenantContext()` runs on every protected request, in this order:

1. Verify identity with `getClaims()` — the JWT signature is checked against the
   project's published keys. `getSession()` is never used for authorisation
   because it returns whatever the cookie claims, and a cookie is attacker input.
2. Load the user's real memberships.
3. Read the preferred-workspace cookie **as a hint only**. If it names an
   organization the user does not belong to, it is discarded silently.

Step 3 is the check that stops a forged cookie from selecting somebody else's
tenant. The cookie is a preference; membership is the permission.

The function returns a discriminated union — `unauthenticated`,
`needs-onboarding`, `ready` — so a caller cannot forget the onboarding case.

### Avoiding recursive RLS

A policy on `memberships` that queries `memberships` recurses infinitely: each
evaluation re-triggers the policy. The fix is `SECURITY DEFINER` helper functions
(`is_org_member`, `org_role`, `has_org_role`, `shares_organization_with`) which
run as the table owner and are therefore exempt from RLS.

Two consequences worth knowing before editing the schema:

- These tables must **not** use `FORCE ROW LEVEL SECURITY`. That would re-subject
  the owner to RLS and reintroduce the recursion.
- Every definer function pins `search_path = ''` and fully qualifies its
  references. Without that, a caller can shadow an unqualified name with their own
  schema — privilege escalation by shadowing.

---

## Server Actions are public endpoints

Anything can POST to a Server Action, in any order, without ever loading the page
that normally precedes it. Therefore every action:

1. Re-establishes the caller's identity from the session
2. Re-parses its input with the same Zod schema the client form used
3. Re-checks authorisation against real membership data

Client-side validation is a convenience for honest users. It is never a control.

---

## Design system

`src/shared/ui/` holds the primitives; feature code imports from the
`@/shared/ui` barrel and never reaches past it into a file path.

Colours are authored in **OKLCH**. Unlike HSL, equal lightness values look equally
light across hues, so the palette stays balanced when a hue shifts and contrast
behaves predictably between light and dark. Components reference semantic tokens
(`bg-card`, `text-muted-foreground`) and never a raw colour, which makes a
retheme a one-file edit.

Variable names follow the shadcn/ui contract deliberately, so a component pulled
from that ecosystem drops in without translation.

### Two client boundaries that are not obvious

Both exist because of upstream packaging, and both are commented at the source:

- **`src/shared/ui/icons.ts`** — every lucide icon is re-exported through this
  `'use client'` module. `lucide-react`'s package entry re-exports a provider from
  a file that calls `React.createContext` at import time, and the entry itself
  carries no `'use client'` directive. React's server build does not implement
  `createContext`, so a Server Component importing an icon directly breaks the
  build with `TypeError: createContext is not a function`.
- **`src/shared/ui/button.tsx`** — marked `'use client'` because
  `@radix-ui/react-slot`, which powers `asChild`, has the same problem and ships
  no directive at all.

Add new icons to `icons.ts` rather than importing at the call site, or a future
Server Component will reintroduce the break.

---

## Accessibility

Treated as correctness, not decoration.

- `FormField` centralises `htmlFor`, `aria-describedby`, and `aria-invalid`. That
  wiring is mechanical, easy to omit, and completely invisible when wrong — a
  screen reader user simply never hears why the form rejected them.
- The mobile navigation is a Radix Dialog, so it traps focus, closes on Escape,
  marks the rest of the page inert, and restores focus to the trigger.
- Focus is refined with `:focus-visible`, never removed.
- `prefers-reduced-motion` collapses durations; `maximumScale` never caps zoom.
