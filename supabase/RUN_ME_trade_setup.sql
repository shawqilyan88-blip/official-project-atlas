-- =====================================================================
-- Project Atlas — Trade setup (tables + RLS) — RUN THIS FIRST
-- =====================================================================
-- The ONE script the Company Profile and Trade Opportunity SAVES need.
-- Paste the whole thing into Supabase Dashboard -> SQL Editor -> Run.
-- Safe to run more than once. Expect: 'Success. No rows returned.'
--
-- Root cause it fixes: public.trade_profiles, public.trade_profile_documents,
-- and public.trade_opportunities did not exist, so every save returned PGRST205
-- ("could not find the table"). This creates them.
--
-- It depends ONLY on the base schema that already exists (organizations, the
-- is_org_member / has_org_role / set_updated_at helpers), so it cannot fail on
-- Storage permissions. Storage (for LOI uploads only) is a separate optional
-- file: RUN_ME_storage_optional.sql.

-- Preflight -----------------------------------------------------------------
-- Fail LOUDLY and clearly if this is the wrong project or the base schema
-- (PASTE_1/2/3) was never applied. Without this, a missing dependency makes a
-- statement deep in the script fail, the whole transaction rolls back, and you
-- are left with zero tables and a cryptic error — the exact trap we hit.

do $$
begin
  if to_regclass('public.organizations') is null then
    raise exception
      'PREFLIGHT FAILED: public.organizations is missing. You are on the WRONG project, or the base schema was never applied. Confirm the SQL Editor URL contains your project ref, then apply PASTE_1/2/3 first.';
  end if;
  if to_regclass('public.memberships') is null then
    raise exception 'PREFLIGHT FAILED: public.memberships is missing. Apply PASTE_1_of_3_schema.sql first.';
  end if;
  if to_regtype('public.app_role') is null then
    raise exception 'PREFLIGHT FAILED: type public.app_role is missing. Apply PASTE_1/PASTE_2 first.';
  end if;
  if to_regprocedure('public.set_updated_at()') is null then
    raise exception 'PREFLIGHT FAILED: public.set_updated_at() is missing. Apply PASTE_1_of_3_schema.sql first.';
  end if;
  if to_regproc('public.is_org_member') is null then
    raise exception 'PREFLIGHT FAILED: public.is_org_member is missing. Apply PASTE_2_of_3_security.sql first.';
  end if;
  if to_regproc('public.has_org_role') is null then
    raise exception 'PREFLIGHT FAILED: public.has_org_role is missing. Apply PASTE_2_of_3_security.sql first.';
  end if;
  raise notice 'Preflight OK — all dependencies present. Creating trade tables…';
end $$;

-- Enums ---------------------------------------------------------------------

do $$ begin
  create type public.trade_role as enum
    ('manufacturer', 'exporter', 'importer', 'trader', 'distributor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.trade_looking_for as enum ('buyers', 'suppliers', 'both');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.document_analysis_status as enum
    ('pending', 'processing', 'analyzed', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.trade_objective as enum
    ('find_buyers', 'find_suppliers', 'both');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.opportunity_status as enum ('draft', 'active', 'archived');
exception when duplicate_object then null; end $$;

-- Company Profile -----------------------------------------------------------

create table if not exists public.trade_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique
    references public.organizations (id) on delete cascade,
  products text[] not null default '{}',
  industry text,
  roles public.trade_role[] not null default '{}',
  looking_for public.trade_looking_for,
  countries text[] not null default '{}',
  production_capacity text,
  moq text,
  certifications text[] not null default '{}',
  languages text[] not null default '{}',
  business_types text[] not null default '{}',
  company_size text,
  incoterms text[] not null default '{}',
  payment_terms text[] not null default '{}',
  currencies text[] not null default '{}',
  website text,
  description text,
  completed_at timestamptz,
  skipped_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint trade_profiles_website_length
    check (website is null or length(website) <= 2048),
  constraint trade_profiles_description_length
    check (description is null or length(description) <= 2000),
  constraint trade_profiles_industry_length
    check (industry is null or length(industry) <= 120)
);

-- If the table already existed from a partial run, make sure the newer columns
-- are present too.
alter table public.trade_profiles add column if not exists languages text[] not null default '{}';
alter table public.trade_profiles add column if not exists business_types text[] not null default '{}';
alter table public.trade_profiles add column if not exists company_size text;
alter table public.trade_profiles add column if not exists incoterms text[] not null default '{}';
alter table public.trade_profiles add column if not exists payment_terms text[] not null default '{}';
alter table public.trade_profiles add column if not exists currencies text[] not null default '{}';

comment on table public.trade_profiles is
  'Per-organization business identity that guides buyer and supplier discovery.';

drop trigger if exists trade_profiles_set_updated_at on public.trade_profiles;
create trigger trade_profiles_set_updated_at
  before update on public.trade_profiles
  for each row execute function public.set_updated_at();

create table if not exists public.trade_profile_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations (id) on delete cascade,
  uploaded_by uuid references auth.users (id) on delete set null,
  file_name text not null,
  storage_path text not null unique,
  mime_type text,
  size_bytes bigint,
  status public.document_analysis_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint trade_profile_documents_file_name_length
    check (length(btrim(file_name)) between 1 and 255),
  constraint trade_profile_documents_size_nonneg
    check (size_bytes is null or size_bytes >= 0)
);

create index if not exists trade_profile_documents_org_idx
  on public.trade_profile_documents (organization_id, created_at desc);

drop trigger if exists trade_profile_documents_set_updated_at
  on public.trade_profile_documents;
create trigger trade_profile_documents_set_updated_at
  before update on public.trade_profile_documents
  for each row execute function public.set_updated_at();

-- Trade Opportunities -------------------------------------------------------

create table if not exists public.trade_opportunities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations (id) on delete cascade,
  name text not null,
  objective public.trade_objective not null default 'find_buyers',
  product text,
  category text,
  target_markets text[] not null default '{}',
  min_order_quantity text,
  target_price text,
  incoterms text[] not null default '{}',
  required_certifications text[] not null default '{}',
  payment_terms text[] not null default '{}',
  currencies text[] not null default '{}',
  keywords text[] not null default '{}',
  exclude_keywords text[] not null default '{}',
  criteria text,
  notes text,
  status public.opportunity_status not null default 'draft',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  last_opened_at timestamptz,

  constraint trade_opportunities_name_length
    check (length(btrim(name)) between 1 and 120),
  constraint trade_opportunities_product_length
    check (product is null or length(product) <= 160),
  constraint trade_opportunities_category_length
    check (category is null or length(category) <= 120),
  constraint trade_opportunities_criteria_length
    check (criteria is null or length(criteria) <= 2000),
  constraint trade_opportunities_notes_length
    check (notes is null or length(notes) <= 4000)
);

alter table public.trade_opportunities add column if not exists payment_terms text[] not null default '{}';
alter table public.trade_opportunities add column if not exists currencies text[] not null default '{}';

comment on table public.trade_opportunities is
  'A reusable trade project (buyer/supplier search) owned by one organization.';

create index if not exists trade_opportunities_org_status_idx
  on public.trade_opportunities (organization_id, status, updated_at desc);

drop trigger if exists trade_opportunities_set_updated_at
  on public.trade_opportunities;
create trigger trade_opportunities_set_updated_at
  before update on public.trade_opportunities
  for each row execute function public.set_updated_at();

-- Row Level Security --------------------------------------------------------

alter table public.trade_profiles enable row level security;
alter table public.trade_profile_documents enable row level security;
alter table public.trade_opportunities enable row level security;

revoke all on public.trade_profiles from anon;
revoke all on public.trade_profile_documents from anon;
revoke all on public.trade_opportunities from anon;

grant select, insert, update, delete on public.trade_profiles to authenticated;
grant select, insert, update, delete on public.trade_profile_documents to authenticated;
grant select, insert, update, delete on public.trade_opportunities to authenticated;

drop policy if exists "trade_profiles: visible to members" on public.trade_profiles;
create policy "trade_profiles: visible to members"
  on public.trade_profiles for select
  to authenticated
  using (public.is_org_member(organization_id));

drop policy if exists "trade_profiles: written by admins" on public.trade_profiles;
create policy "trade_profiles: written by admins"
  on public.trade_profiles for insert
  to authenticated
  with check (public.has_org_role(organization_id, 'admin'));

drop policy if exists "trade_profiles: updated by admins" on public.trade_profiles;
create policy "trade_profiles: updated by admins"
  on public.trade_profiles for update
  to authenticated
  using (public.has_org_role(organization_id, 'admin'))
  with check (public.has_org_role(organization_id, 'admin'));

drop policy if exists "trade_docs: visible to members"
  on public.trade_profile_documents;
create policy "trade_docs: visible to members"
  on public.trade_profile_documents for select
  to authenticated
  using (public.is_org_member(organization_id));

drop policy if exists "trade_docs: uploaded by members"
  on public.trade_profile_documents;
create policy "trade_docs: uploaded by members"
  on public.trade_profile_documents for insert
  to authenticated
  with check (
    public.is_org_member(organization_id)
    and uploaded_by = (select auth.uid())
  );

drop policy if exists "trade_docs: removed by uploader or admin"
  on public.trade_profile_documents;
create policy "trade_docs: removed by uploader or admin"
  on public.trade_profile_documents for delete
  to authenticated
  using (
    uploaded_by = (select auth.uid())
    or public.has_org_role(organization_id, 'admin')
  );

drop policy if exists "opportunities: visible to members"
  on public.trade_opportunities;
create policy "opportunities: visible to members"
  on public.trade_opportunities for select
  to authenticated
  using (public.is_org_member(organization_id));

drop policy if exists "opportunities: created by members"
  on public.trade_opportunities;
create policy "opportunities: created by members"
  on public.trade_opportunities for insert
  to authenticated
  with check (
    public.is_org_member(organization_id)
    and created_by = (select auth.uid())
  );

drop policy if exists "opportunities: updated by members"
  on public.trade_opportunities;
create policy "opportunities: updated by members"
  on public.trade_opportunities for update
  to authenticated
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

drop policy if exists "opportunities: deleted by members"
  on public.trade_opportunities;
create policy "opportunities: deleted by members"
  on public.trade_opportunities for delete
  to authenticated
  using (public.is_org_member(organization_id));

-- Tell PostgREST to reload its schema cache so the new tables are visible to
-- the REST API (and therefore the app) immediately, without a restart.
notify pgrst, 'reload schema';

-- =====================================================================
-- Verification — this runs automatically. The Results grid below the editor
-- must show one row with all three columns = true. If it does, the tables
-- exist and the saves will work. Paste this row back as proof of execution.
-- =====================================================================
select
  to_regclass('public.trade_profiles')          is not null as trade_profiles_created,
  to_regclass('public.trade_profile_documents')  is not null as documents_created,
  to_regclass('public.trade_opportunities')      is not null as trade_opportunities_created;
