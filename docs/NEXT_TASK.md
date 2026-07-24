# Next Task

**Provision the cloud Supabase project and apply the migrations.**

This is the only thing standing between the current verified build and a working
sign-in. Nothing else in Sprint 2 can be tested until it is done.

It requires your Supabase account, so it cannot be automated from here — the
project URL and keys are yours, and the secret key must never be pasted into a
shared context.

---

## 1. Create the project

At <https://supabase.com/dashboard>, create a project. Choose a region close to
your users; database latency dominates request time for most pages.

## 2. Copy the credentials

**Project Settings → API.** Replace the two placeholder values in `.env.local`:

| Variable                               | Where to find it                                      |
| -------------------------------------- | ----------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Project URL, e.g. `https://abcdefghijklm.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (formerly "anon")                     |

Leave `SUPABASE_SECRET_KEY` blank. Nothing in Sprint 1 needs it, and an unused
secret is just exposure. Add it only when a background job requires RLS bypass.

The publishable key is safe in the browser — it carries no privileges of its own
and every request it makes is constrained by RLS.

## 3. Link the project and push the migrations

```bash
npx supabase login
```

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

```bash
npx supabase db push
```

The three migrations apply in order: schema, then RLS, then auth triggers and
provisioning. Order matters — the policies reference the enum and tables created
in the first file.

## 4. Configure auth redirects

**Authentication → URL Configuration.** Without this, the confirmation email link
lands nowhere and signup appears broken.

- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

Add the production equivalents when you deploy.

## 5. Regenerate the database types

```bash
npm run db:types
```

`src/infrastructure/supabase/database.types.ts` is currently hand-written to
match the migrations exactly. This overwrites it with the generated version.
**Then run `npm run typecheck`** — if it still passes, the hand-written contract
was correct. If it fails, the generated file is the truth and the errors show
exactly where the migrations and my transcription diverged.

## 6. Verify end to end

```bash
npm run dev
```

Walk the full path and confirm each step:

1. Landing page renders at `/`
2. `/sign-up` creates an account and shows the "confirm your email" step
3. The confirmation link returns you to `/auth/callback` and on to `/onboarding`
4. Creating a workspace lands you on `/dashboard` with your name and role
5. `/settings` shows the workspace; `/settings/members` lists you as Owner
6. Sign out returns you to `/sign-in`
7. Visiting `/dashboard` while signed out redirects to `/sign-in?redirectTo=…`,
   and signing in returns you to `/dashboard`
8. Toggle light, dark, and system — no flash on reload
9. Narrow the window below `1024px` — navigation moves into the sheet
10. Tab through every screen — focus is always visible, skip link works

## 7. Then verify the isolation claim

Create a second account and a second workspace. Confirm that neither user can see
the other's organization, membership rows, or profile. Try editing the
`atlas.active_organization` cookie to the other organization's id — you should
land back on your own workspace, not theirs.

**Automate exactly this** as the first test in Sprint 2. It is the single most
valuable test in the codebase: it verifies the claim the entire product rests on.

---

## Gotchas

**Windows path casing.** If the build fails with
`Invariant: Expected workStore to be initialized`, the shell's working directory
casing does not match the folder's real name and Node has loaded two copies of
Next.js. Open a fresh terminal at the canonical path:

```bash
cd "C:/Users/Ahmed/Official Project Atlas" && npm run build
```

**Signup fails with "Database error saving new user."** The `handle_new_user`
trigger raised an exception, which rolls back the auth user too. Check the
Supabase logs. The trigger truncates long values to fit the CHECK constraints
specifically to avoid this, so a failure here means something else — most likely
that migration 3 did not apply.

**Sign-in succeeds but the dashboard redirects to onboarding.** The profile row is
missing, so `resolveTenantContext` cannot resolve. Confirm the
`on_auth_user_created` trigger exists on `auth.users`.

---

## After this

`ROADMAP.md` Sprint 2, in order: RLS isolation tests, test harness, then team
invitations.
