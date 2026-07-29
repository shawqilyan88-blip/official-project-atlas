-- =====================================================================
-- Project Atlas — Trade Opportunity Engine: opportunity-owned child tables
-- =====================================================================
-- Sprint 3.1. Each Trade Opportunity becomes a workspace that owns its own
-- documents, companies, messages, timeline, tasks, deals, and notes. These are
-- the seams that buyer discovery, supplier discovery, and outreach will plug
-- into later — this migration builds the storage and security, not those engines.
--
-- Designed for scale: one organization can own hundreds of opportunities, each
-- with many children. Every child carries organization_id (so RLS is a single
-- indexed predicate, never a join) AND opportunity_id (cascade-deleted with its
-- opportunity). Every list path is covered by a (opportunity_id, …) index.
--
-- Paste the whole file into Supabase -> SQL Editor -> Run. Idempotent; safe to
-- run more than once. The final SELECT prints one row of all-true when it worked.
--
-- Depends only on objects the base schema + RUN_ME_trade_setup already created:
-- organizations, trade_opportunities, is_org_member, set_updated_at.

-- Preflight -----------------------------------------------------------------

do $$
begin
  if to_regclass('public.organizations') is null then
    raise exception
      'PREFLIGHT FAILED: public.organizations is missing. Wrong project, or the base schema was never applied.';
  end if;
  if to_regclass('public.trade_opportunities') is null then
    raise exception
      'PREFLIGHT FAILED: public.trade_opportunities is missing. Apply RUN_ME_trade_setup.sql first.';
  end if;
  if to_regproc('public.is_org_member') is null then
    raise exception 'PREFLIGHT FAILED: public.is_org_member is missing. Apply PASTE_2_of_3_security.sql first.';
  end if;
  if to_regprocedure('public.set_updated_at()') is null then
    raise exception 'PREFLIGHT FAILED: public.set_updated_at() is missing. Apply PASTE_1_of_3_schema.sql first.';
  end if;
  raise notice 'Preflight OK — building the opportunity engine…';
end $$;

-- Enums ---------------------------------------------------------------------

do $$ begin
  create type public.opportunity_document_kind as enum
    ('loi', 'rfq', 'purchase_order', 'product_spec', 'company_profile', 'product_catalog', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.document_analysis_status as enum
    ('pending', 'processing', 'analyzed', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.opportunity_company_role as enum ('buyer', 'supplier');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.opportunity_company_status as enum
    ('suggested', 'shortlisted', 'contacted', 'qualified', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.opportunity_message_direction as enum ('inbound', 'outbound');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.opportunity_task_status as enum ('todo', 'in_progress', 'done');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.opportunity_deal_stage as enum
    ('lead', 'quote', 'sample', 'negotiation', 'contract', 'won', 'lost');
exception when duplicate_object then null; end $$;

-- Shared column shape (documented once) -------------------------------------
-- Every table below has: id, organization_id (RLS predicate), opportunity_id
-- (owner, cascade delete), created_by, created_at, updated_at + updated_at trigger.

-- 1. Documents --------------------------------------------------------------

create table if not exists public.opportunity_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  opportunity_id uuid not null references public.trade_opportunities (id) on delete cascade,
  kind public.opportunity_document_kind not null default 'other',
  file_name text not null,
  storage_path text not null unique,
  mime_type text,
  size_bytes bigint,
  status public.document_analysis_status not null default 'pending',
  extracted jsonb,
  -- Versioning: a "replace" inserts a new row that points at the one it
  -- supersedes and flips the old row's is_current to false. History is never
  -- deleted, so the version trail is preserved.
  version integer not null default 1,
  replaces_id uuid references public.opportunity_documents (id) on delete set null,
  is_current boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_documents_file_name_length check (length(btrim(file_name)) between 1 and 255),
  constraint opportunity_documents_size_nonneg check (size_bytes is null or size_bytes >= 0)
);
-- If the table already existed from an earlier run, add the versioning columns.
alter table public.opportunity_documents add column if not exists version integer not null default 1;
alter table public.opportunity_documents add column if not exists replaces_id uuid references public.opportunity_documents (id) on delete set null;
alter table public.opportunity_documents add column if not exists is_current boolean not null default true;

create index if not exists opportunity_documents_by_opportunity
  on public.opportunity_documents (opportunity_id, is_current, created_at desc);

-- 2. Companies (buyers / suppliers surfaced for this opportunity) ------------

create table if not exists public.opportunity_companies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  opportunity_id uuid not null references public.trade_opportunities (id) on delete cascade,
  role public.opportunity_company_role not null,
  name text not null,
  country text,
  website text,
  fit_score smallint,
  status public.opportunity_company_status not null default 'suggested',
  source text,
  metadata jsonb not null default '{}',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_companies_name_length check (length(btrim(name)) between 1 and 200),
  constraint opportunity_companies_fit_range check (fit_score is null or fit_score between 0 and 100)
);
create index if not exists opportunity_companies_by_opportunity
  on public.opportunity_companies (opportunity_id, role, status, created_at desc);

-- 3. Messages (threads with those companies) --------------------------------

create table if not exists public.opportunity_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  opportunity_id uuid not null references public.trade_opportunities (id) on delete cascade,
  company_id uuid references public.opportunity_companies (id) on delete set null,
  direction public.opportunity_message_direction not null,
  channel text,
  subject text,
  body text not null,
  sent_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_messages_body_length check (length(body) between 1 and 20000)
);
create index if not exists opportunity_messages_by_opportunity
  on public.opportunity_messages (opportunity_id, created_at desc);
create index if not exists opportunity_messages_by_company
  on public.opportunity_messages (company_id, created_at desc);

-- 4. Timeline (the opportunity's real, growing record) ----------------------

create table if not exists public.opportunity_timeline_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  opportunity_id uuid not null references public.trade_opportunities (id) on delete cascade,
  kind text not null,
  title text not null,
  detail text,
  metadata jsonb not null default '{}',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_timeline_kind_length check (length(btrim(kind)) between 1 and 60),
  constraint opportunity_timeline_title_length check (length(btrim(title)) between 1 and 200)
);
create index if not exists opportunity_timeline_by_opportunity
  on public.opportunity_timeline_events (opportunity_id, created_at desc);

-- 5. Tasks ------------------------------------------------------------------

create table if not exists public.opportunity_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  opportunity_id uuid not null references public.trade_opportunities (id) on delete cascade,
  title text not null,
  detail text,
  status public.opportunity_task_status not null default 'todo',
  due_at timestamptz,
  assigned_to uuid references auth.users (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_tasks_title_length check (length(btrim(title)) between 1 and 200)
);
create index if not exists opportunity_tasks_by_opportunity
  on public.opportunity_tasks (opportunity_id, status, due_at);

-- 6. Deals ------------------------------------------------------------------

create table if not exists public.opportunity_deals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  opportunity_id uuid not null references public.trade_opportunities (id) on delete cascade,
  company_id uuid references public.opportunity_companies (id) on delete set null,
  title text not null,
  stage public.opportunity_deal_stage not null default 'lead',
  value_amount numeric(14, 2),
  currency text,
  expected_close date,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_deals_title_length check (length(btrim(title)) between 1 and 200),
  constraint opportunity_deals_value_nonneg check (value_amount is null or value_amount >= 0)
);
create index if not exists opportunity_deals_by_opportunity
  on public.opportunity_deals (opportunity_id, stage, updated_at desc);

-- 7. Notes ------------------------------------------------------------------

create table if not exists public.opportunity_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  opportunity_id uuid not null references public.trade_opportunities (id) on delete cascade,
  body text not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_notes_body_length check (length(btrim(body)) between 1 and 8000)
);
create index if not exists opportunity_notes_by_opportunity
  on public.opportunity_notes (opportunity_id, created_at desc);

-- updated_at triggers -------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array[
    'opportunity_documents', 'opportunity_companies', 'opportunity_messages',
    'opportunity_timeline_events', 'opportunity_tasks', 'opportunity_deals',
    'opportunity_notes'
  ] loop
    execute format('drop trigger if exists %I_set_updated_at on public.%I;', t, t);
    execute format(
      'create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at();',
      t, t
    );
  end loop;
end $$;

-- Row Level Security --------------------------------------------------------
-- Uniform policy: any member of the owning organization may read and write its
-- opportunities' children. RLS is a single indexed predicate on organization_id.

do $$
declare
  t text;
begin
  foreach t in array array[
    'opportunity_documents', 'opportunity_companies', 'opportunity_messages',
    'opportunity_timeline_events', 'opportunity_tasks', 'opportunity_deals',
    'opportunity_notes'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('revoke all on public.%I from anon;', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated;', t);

    execute format('drop policy if exists "%s: members read" on public.%I;', t, t);
    execute format(
      'create policy "%s: members read" on public.%I for select to authenticated using (public.is_org_member(organization_id));',
      t, t
    );

    execute format('drop policy if exists "%s: members write" on public.%I;', t, t);
    execute format(
      'create policy "%s: members write" on public.%I for insert to authenticated with check (public.is_org_member(organization_id));',
      t, t
    );

    execute format('drop policy if exists "%s: members update" on public.%I;', t, t);
    execute format(
      'create policy "%s: members update" on public.%I for update to authenticated using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));',
      t, t
    );

    execute format('drop policy if exists "%s: members delete" on public.%I;', t, t);
    execute format(
      'create policy "%s: members delete" on public.%I for delete to authenticated using (public.is_org_member(organization_id));',
      t, t
    );
  end loop;
end $$;

-- Tell PostgREST to pick up the new tables immediately.
notify pgrst, 'reload schema';

-- =====================================================================
-- Verification — runs automatically; every column must be true.
-- =====================================================================
select
  to_regclass('public.opportunity_documents')        is not null as documents_ok,
  to_regclass('public.opportunity_companies')         is not null as companies_ok,
  to_regclass('public.opportunity_messages')          is not null as messages_ok,
  to_regclass('public.opportunity_timeline_events')   is not null as timeline_ok,
  to_regclass('public.opportunity_tasks')             is not null as tasks_ok,
  to_regclass('public.opportunity_deals')             is not null as deals_ok,
  to_regclass('public.opportunity_notes')             is not null as notes_ok;
