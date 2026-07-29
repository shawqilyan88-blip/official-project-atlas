-- =====================================================================
-- Project Atlas — Outreach engine (Sprint 3.2 Step 4)
-- =====================================================================
-- Adds the server-side message lifecycle (so sending can be gated on an
-- APPROVED state recorded here, not in the UI) and an append-only audit log.
--
-- Paste the whole file into Supabase -> SQL Editor -> Run. Idempotent; safe to
-- run more than once. The final SELECT prints one all-true row when it worked.
--
-- Depends on RUN_ME_opportunity_engine.sql (opportunity_messages,
-- opportunity_companies) and the base schema (organizations, is_org_member).

-- Preflight -----------------------------------------------------------------

do $$
begin
  if to_regclass('public.opportunity_messages') is null then
    raise exception
      'PREFLIGHT FAILED: public.opportunity_messages is missing. Apply RUN_ME_opportunity_engine.sql first.';
  end if;
  if to_regproc('public.is_org_member') is null then
    raise exception 'PREFLIGHT FAILED: public.is_org_member is missing. Apply PASTE_2_of_3_security.sql first.';
  end if;
  if to_regprocedure('public.set_updated_at()') is null then
    raise exception 'PREFLIGHT FAILED: public.set_updated_at() is missing. Apply PASTE_1_of_3_schema.sql first.';
  end if;
  raise notice 'Preflight OK — building the outreach engine…';
end $$;

-- Enums ---------------------------------------------------------------------

do $$ begin
  create type public.message_status as enum
    ('draft', 'approved', 'sending', 'sent', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.outreach_audit_event as enum (
    'draft_created', 'draft_regenerated', 'draft_edited', 'draft_approved',
    'message_send_attempted', 'message_sent', 'message_failed', 'reply_received'
  );
exception when duplicate_object then null; end $$;

-- Message lifecycle ---------------------------------------------------------
-- The approval gate lives on the row: a message can only be sent while its
-- status is 'approved'. Editing an approved draft resets it to 'draft' in the
-- application layer, so stale content can never be sent.

alter table public.opportunity_messages
  add column if not exists status public.message_status not null default 'draft';
alter table public.opportunity_messages
  add column if not exists approved_by uuid references auth.users (id) on delete set null;
alter table public.opportunity_messages
  add column if not exists approved_at timestamptz;
alter table public.opportunity_messages
  add column if not exists failed_reason text;
alter table public.opportunity_messages
  add column if not exists ai_generated boolean not null default false;

create index if not exists opportunity_messages_by_status
  on public.opportunity_messages (opportunity_id, status, created_at desc);

-- Audit log (append-only) ---------------------------------------------------
-- The compliance system-of-record: every draft transition and send attempt,
-- with actor and result. Distinct from the human-facing timeline.

create table if not exists public.outreach_audit_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  opportunity_id uuid not null references public.trade_opportunities (id) on delete cascade,
  company_id uuid references public.opportunity_companies (id) on delete set null,
  message_id uuid references public.opportunity_messages (id) on delete set null,
  channel text,
  actor uuid references auth.users (id) on delete set null,
  event public.outreach_audit_event not null,
  result text,
  detail jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists outreach_audit_log_by_opportunity
  on public.outreach_audit_log (opportunity_id, created_at desc);
create index if not exists outreach_audit_log_by_message
  on public.outreach_audit_log (message_id, created_at desc);

-- Row Level Security --------------------------------------------------------

alter table public.outreach_audit_log enable row level security;
revoke all on public.outreach_audit_log from anon;
-- Append-only: members may read and insert, but never update or delete.
grant select, insert on public.outreach_audit_log to authenticated;

drop policy if exists "outreach_audit: members read" on public.outreach_audit_log;
create policy "outreach_audit: members read"
  on public.outreach_audit_log for select
  to authenticated
  using (public.is_org_member(organization_id));

drop policy if exists "outreach_audit: members append" on public.outreach_audit_log;
create policy "outreach_audit: members append"
  on public.outreach_audit_log for insert
  to authenticated
  with check (public.is_org_member(organization_id));

-- opportunity_messages already has member RLS from the engine migration; the new
-- columns are covered by it. Nothing to change there.

notify pgrst, 'reload schema';

-- =====================================================================
-- Verification — runs automatically; every column must be true.
-- =====================================================================
select
  to_regtype('public.message_status')          is not null as message_status_ok,
  to_regtype('public.outreach_audit_event')     is not null as audit_event_enum_ok,
  to_regclass('public.outreach_audit_log')      is not null as audit_table_ok,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'opportunity_messages' and column_name = 'status'
  ) as messages_status_col_ok,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'opportunity_messages' and column_name = 'approved_at'
  ) as messages_approved_col_ok;
