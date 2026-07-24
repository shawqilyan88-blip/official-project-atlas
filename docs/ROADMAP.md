# Roadmap

The mission: software that feels like hiring an entire international business
development department. Sprint 1 built the foundation that makes the rest
possible. Everything below assumes tenant isolation, roles, and RLS already hold.

---

## Sprint 1 — Production foundation ✅

Complete. See `PROJECT_STATUS.md`.

Next.js 16 · strict TypeScript · Tailwind 4 · multi-tenant schema with RLS ·
authentication · dashboard shell · theme system · landing page · design system.

---

## Sprint 2 — Trust the foundation

Sprint 1 is verified by types and a passing build. Sprint 2 verifies it by
execution. Nothing below is a feature; all of it is a prerequisite for building
features confidently.

1. **Provision the Supabase project and apply migrations.** Blocks everything.
   See `NEXT_TASK.md`.
2. **RLS tenant-isolation tests.** Two organizations, two users, and assertions
   that neither can read, update, or delete the other's rows through any code
   path. The single highest-value test suite in the codebase — it verifies the
   claim the whole product rests on.
3. **Test harness.** Vitest for domain logic and use-cases against in-memory
   fakes; Playwright for the sign-up → onboarding → dashboard path.
4. **Regenerate database types from the live schema** (`npm run db:types`) and
   confirm the hand-written contract matches exactly.
5. **Team invitations and role editing.** The permission model and policies exist;
   the UI does not. Includes the privilege-escalation tests the policies imply.
6. **Workspace settings editing** for admins and owners.
7. **CI pipeline** running typecheck, lint, format, build, and tests on every push.
8. **Error tracking and structured logging** — `console.error` is not an
   observability strategy.

---

## Sprint 3 — Find counterparties

The first module that delivers on the mission.

- `buyers` and `suppliers` modules, following the established slice structure
- Trade-data ingestion and a normalised company model
- Search and ranking by fit, capacity, certification, and purchase signals
- Saved searches and watchlists
- Enrichment pipeline with provenance on every field, so a user can see why a
  company was suggested

**Architectural note.** These are the first tables to carry `organization_id`.
They must follow the Sprint 1 RLS pattern exactly. Copy the policy shape from
`20260724120001_row_level_security.sql`; do not invent a new one.

---

## Sprint 4 — Open conversations

- `conversations` module: unified threads across email and messaging channels
- Inbound routing, assignment, and shared team visibility
- Multilingual drafting and translation
- Timezone-aware send scheduling

---

## Sprint 5 — Automate outreach

- `outreach` module: sequences that branch on how a contact actually replies
- Per-contact personalisation from the enrichment data
- Deliverability controls, suppression lists, and sending-rate governance
- **Application-level rate limiting becomes mandatory here** (see ADR-013) — this
  is the first module that can send on a user's behalf

---

## Sprint 6 — Negotiate and close

- `deals` module: pipeline, stages, and forecasting
- Terms, incoterms, and counterparty records
- Document generation and an auditable trail
- Negotiation assistance with explicit human approval gates before anything is
  sent

---

## Continuous

- **Accessibility audits** each sprint, not once at the end
- **Performance budgets** on Core Web Vitals
- **Security review** whenever a table, policy, or Server Action is added
- **Dependency upgrades**, including the two pins in ADR-010 and ADR-011

---

## Deliberately not planned

Recorded so they are re-decided rather than drifted into:

- **Custom auth.** Supabase Auth is not the constraint. Rolling our own would be
  a large, permanent liability.
- **Subdomain-per-tenant routing.** Path-based tenancy with a server-resolved
  active workspace is simpler and sufficient. Revisit only for a concrete
  enterprise requirement.
- **Microservices.** A single well-layered application is the correct shape at
  this scale. The module boundaries mean extraction stays possible if it ever
  becomes necessary.
