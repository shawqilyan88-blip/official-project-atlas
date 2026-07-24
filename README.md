# Project Atlas

An AI-powered international trade operating system. Atlas finds buyers and
suppliers, opens conversations, runs outreach, and moves deals toward signature —
software that works like an international business development department.

**Sprint 1 (production foundation) is complete.** The application will build and
run now, but authentication requires a Supabase project. See
[`docs/NEXT_TASK.md`](docs/NEXT_TASK.md).

---

## Stack

Next.js 16 (App Router) · React 19 · TypeScript 6 (strict) · Tailwind CSS 4 ·
Radix primitives · Supabase (Postgres, Auth, Row Level Security)

## Getting started

Requires Node.js 20.9 or newer.

```bash
npm install
```

Then provision Supabase and fill in `.env.local` — follow
[`docs/NEXT_TASK.md`](docs/NEXT_TASK.md), which walks through it step by step.

```bash
npm run dev
```

## Commands

| Command             | Purpose                                        |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Development server                             |
| `npm run build`     | Production build                               |
| `npm run verify`    | Typecheck, lint, and format check              |
| `npm run typecheck` | TypeScript, no emit                            |
| `npm run lint`      | ESLint                                         |
| `npm run format`    | Format with Prettier                           |
| `npm run db:push`   | Apply migrations to the linked project         |
| `npm run db:types`  | Regenerate database types from the live schema |

## Layout

```
src/
  core/            Pure domain — no framework, no vendor, no I/O
  modules/         Vertical slices: domain → application → infrastructure → ui
  infrastructure/  Supabase clients, generated types, error mapping
  server/          Composition root and session helpers
  shared/          Design system, config, utilities
  app/             Routing only
supabase/migrations/
docs/
```

Dependencies point inward: `app → modules → core`. This is enforced by lint
rules, so a violation fails `npm run lint`.

## Documentation

| Document                                    | Contents                                      |
| ------------------------------------------- | --------------------------------------------- |
| [PROJECT_STATUS.md](docs/PROJECT_STATUS.md) | What is built, what is verified, what is not  |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md)     | Layers, multi-tenancy, security model         |
| [DECISIONS.md](docs/DECISIONS.md)           | Every significant decision, with its cost     |
| [ROADMAP.md](docs/ROADMAP.md)               | Sprints 2–6 and what is deliberately excluded |
| [CHANGELOG.md](docs/CHANGELOG.md)           | Release history                               |
| [NEXT_TASK.md](docs/NEXT_TASK.md)           | Exactly what to do next                       |

## Security

Tenant isolation is enforced by Postgres Row Level Security, not by application
code. The proxy and page guards exist so users get a sensible redirect; the
database is what actually prevents one tenant from reading another's data, and it
holds even if the application layer is bypassed entirely.

Before adding a table, read the multi-tenancy section of
[ARCHITECTURE.md](docs/ARCHITECTURE.md). Every business table carries
`organization_id` and follows the RLS pattern established in
`supabase/migrations/20260724120001_row_level_security.sql`.

Never commit `.env.local`. `SUPABASE_SECRET_KEY` bypasses RLS completely and must
never reach the browser.
