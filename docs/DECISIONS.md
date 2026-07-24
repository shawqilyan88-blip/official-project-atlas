# Decisions

Each entry records what was chosen, why, and what it costs. A decision without a
stated cost is usually a decision nobody examined.

---

## Fixed by the project brief

Multi-tenant from day one · Supabase client · SQL migrations · cloud Supabase
project · landing page in Sprint 1. Not revisited.

---

## ADR-001 — Layered architecture with enforced boundaries

**Decision.** `app → modules → core`, with ports in the application layer and
vendor code confined to infrastructure. Boundaries enforced by
`no-restricted-imports` in `eslint.config.mjs`.

**Why.** Architecture documented but unenforced decays on the first deadline. A
lint failure is a cheap, immediate, unarguable signal.

**Cost.** More files than a flat structure, and a port must be written before an
adapter. Justified for a system expected to grow several large modules; it would
be over-engineering for a single-screen tool.

---

## ADR-002 — `Result<T, E>` for expected failures

**Decision.** Use-cases return `Result`; exceptions are for genuinely exceptional
conditions.

**Why.** Compiler-enforced handling of the failure branch, and a clean separation
between a user-facing message and a loggable cause. Raw driver messages leak
schema detail.

**Cost.** Callers must unwrap. Mitigated by `isSuccess`/`isFailure` guards.

---

## ADR-003 — RLS is the security boundary; the app layer is UX

**Decision.** Every table has RLS from its first migration. The proxy and page
guards exist for user experience, not protection.

**Why.** Application checks can be bypassed by anything that talks to Postgres
directly — a background job, a SQL console, a future service, a bug in a route
matcher. Database policies cannot.

**Cost.** Authorisation is expressed twice: in SQL for enforcement, and in
`core/entities/role.ts` so the UI knows what to render. These must agree, and
`ARCHITECTURE.md` says so explicitly. The alternative — a single source that the
database cannot enforce — is worse.

---

## ADR-004 — `SECURITY DEFINER` helpers, and no `FORCE ROW LEVEL SECURITY`

**Decision.** Authorisation helpers are `SECURITY DEFINER` with
`search_path = ''`. The three core tables do not use `FORCE ROW LEVEL SECURITY`.

**Why.** A policy on `memberships` that queries `memberships` recurses infinitely.
A definer function runs as the table owner and is exempt from RLS, breaking the
cycle. `FORCE` would re-subject the owner and reintroduce the recursion.

**Cost.** Definer functions are privileged code and must be reviewed as such. The
pinned `search_path` is mandatory: without it a caller can shadow an unqualified
name and escalate.

---

## ADR-005 — Organizations are created only through an RPC

**Decision.** `organizations` has no `INSERT` policy. Creation goes through
`create_organization_with_owner`, which inserts the organization and its owner
membership in one transaction.

**Why.** Two separate client calls can fail between them, leaving an organization
with no members — invisible under RLS and undeletable. Withholding `INSERT` makes
that state unrepresentable rather than merely unlikely.

**Cost.** Creating an organization requires a migration to change, not just
application code. Acceptable for an operation this consequential.

---

## ADR-006 — `getClaims()` for identity, never `getSession()`

**Decision.** All authorisation reads `getClaims()`.

**Why.** `getSession()` returns whatever the cookie contains without verifying it.
A cookie is attacker-controlled input. `getClaims()` verifies the JWT signature
against the project's published keys.

**Cost.** Marginally more work per call. Irrelevant next to the failure mode.

---

## ADR-007 — Sign-out uses `local` scope

**Decision.** `signOut({ scope: 'local' })`, overriding the library default of
`global`.

**Why.** The default signs the user out on _every device_. Someone closing a
session on a shared laptop does not expect to be logged out of their phone.

**Cost.** A lost device needs an explicit "sign out everywhere" action. That
belongs in security settings and is on the roadmap.

---

## ADR-008 — The active-workspace cookie is a hint, not a permission

**Decision.** `atlas.active_organization` is `httpOnly`, `sameSite=lax`, and always
validated against the user's real memberships before use.

**Why.** Cookies are editable. Treating this one as authoritative would be a
one-line cross-tenant data leak.

**Cost.** One membership lookup per request, already needed for the workspace
switcher.

---

## ADR-009 — Authentication errors are deliberately vague

**Decision.** A failed sign-in returns one generic message regardless of whether
the address exists. Signup does not distinguish an already-registered address.

**Why.** Otherwise the form is a free account-enumeration oracle. Supabase itself
returns an obfuscated user for a duplicate signup for this reason, and we do not
undo it.

**Cost.** A user who mistypes their email sees a less specific message. Worth it.

---

## ADR-010 — TypeScript pinned to 6.0.3, not 7.0.2

**Decision.** Pin `typescript@6.0.3` despite 7.0.2 being `latest`.

**Why.** `typescript-eslint` refuses to load under TS 7 (`typescript-eslint does
not support TS 7.0`), and its peer range is `>=4.8.4 <6.1.0`. A green typecheck
with a dead linter is worse than a slightly older compiler. TS 7 also removed
`baseUrl`, which `tsconfig.json` no longer uses either way.

**Cost.** Forgoing the native compiler's speed. Revisit when typescript-eslint
ships TS 7 support (typescript-eslint#10940).

---

## ADR-011 — ESLint pinned to 9.39.5, not 10.7.0

**Decision.** Pin `eslint@9`.

**Why.** `eslint-config-next@16.2.11` depends on `eslint-plugin-react@^7.37`,
which calls `context.getFilename()` — removed in ESLint 10. Linting crashes with
`contextOrFilename.getFilename is not a function`. The peer range advertises
`>=9`, but the plugin chain is not actually ready.

**Cost.** None today. Revisit when `eslint-plugin-react` supports ESLint 10.

---

## ADR-012 — `exactOptionalPropertyTypes` stays on

**Decision.** Keep the flag enabled and work around third-party friction with
conditional spreads (`{...(x !== undefined ? { prop: x } : {})}`).

**Why.** It catches a real class of bug where `undefined` is passed explicitly and
silently overrides a default.

**Cost.** Occasional awkwardness at boundaries with libraries that do not model
optionality precisely. Two such sites exist so far, both commented.

---

## ADR-013 — Rate limiting is delegated to Supabase Auth

**Decision.** No application-level throttle on auth actions in Sprint 1.

**Why.** Supabase Auth already enforces per-IP and per-address limits on sign-in,
signup, and email sends. A second naive limiter would add failure modes without
adding protection.

**Cost.** No throttling on non-auth actions yet. Needed once the outreach module
can trigger outbound sends.

---

## ADR-014 — Unbuilt modules appear in the navigation, marked "Soon"

**Decision.** `navigationGroups` carries `available: false` items that render
inert with a badge, rather than linking to empty pages.

**Why.** No placeholder routes and no dead links, while the product's shape stays
legible. Showing the shape is useful; pretending a feature exists is not.

**Cost.** A visible reminder of what is unfinished. Honest.

---

## ADR-015 — Sprint 1 ships no automated tests

**Decision.** Defer the test harness to Sprint 2.

**Why.** The highest-value tests here are RLS tenant-isolation tests, and those
need a provisioned database to run against. Writing them before the project
exists would mean writing tests that cannot execute.

**Cost.** The foundation is verified by typecheck, lint, and a passing production
build, but not by tests. This is the largest single gap in Sprint 1 and is the
first item in Sprint 2.

---

## Open questions

**Account deletion for a sole owner.** The `prevent_last_owner_removal` trigger
blocks deleting a user who is the only owner of a surviving organization, so
`auth.users` deletion fails for that user. Blocking is the safe default — the
alternative silently orphans a tenant — but the product needs an explicit
ownership-transfer flow. Deliberately unresolved; requires a product decision.

**Slug reserved-word list.** Currently enforced in TypeScript
(`core/entities/organization.ts`) but not in SQL, to avoid two lists drifting
apart. A determined caller using the RPC directly could claim a reserved slug.
Low severity — the database's unique index still prevents collisions — but worth
revisiting if slugs ever appear in the URL path.
