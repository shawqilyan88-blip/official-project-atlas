-- Project Atlas - 0004 - Trade Opportunities
-- Paste into Supabase Dashboard -> SQL Editor and Run, after PASTE_4.
-- Safe to run more than once. Expect: 'Success. No rows returned.'
--
-- A Trade Opportunity is a reusable trade project: "find buyers for Green
-- Edamame", "source frozen mango suppliers". It inherits the workspace's
-- Company Profile (the 0003 trade_profiles row) and only stores what is specific
-- to this pursuit, so a company can run hundreds without duplicating identity.

-- Enums ---------------------------------------------------------------------

do $$ begin
  create type public.trade_objective as enum
    ('find_buyers', 'find_suppliers', 'both');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.opportunity_status as enum ('draft', 'active', 'archived');
exception when duplicate_object then null; end $$;

-- Company Profile: languages spoken (part of the permanent identity) ---------

alter table public.trade_profiles
  add column if not exists languages text[] not null default '{}';

-- trade_opportunities -------------------------------------------------------

create table if not exists public.trade_opportunities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations (id) on delete cascade,

  -- Required
  name text not null,
  objective public.trade_objective not null default 'find_buyers',
  product text,

  -- Recommended (improves matching)
  category text,
  target_markets text[] not null default '{}',

  -- Optional
  min_order_quantity text,
  target_price text,
  incoterms text[] not null default '{}',
  required_certifications text[] not null default '{}',

  -- Advanced
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

comment on table public.trade_opportunities is
  'A reusable trade project (buyer/supplier search) owned by one organization.';

-- Lists are always scoped by organization and status, newest activity first.
create index if not exists trade_opportunities_org_status_idx
  on public.trade_opportunities (organization_id, status, updated_at desc);

drop trigger if exists trade_opportunities_set_updated_at
  on public.trade_opportunities;
create trigger trade_opportunities_set_updated_at
  before update on public.trade_opportunities
  for each row execute function public.set_updated_at();

-- Row Level Security --------------------------------------------------------
-- Opportunities are collaborative work, not admin config: any member of the
-- organization may create and manage them. RLS still confines every row to the
-- organization it belongs to.

alter table public.trade_opportunities enable row level security;
revoke all on public.trade_opportunities from anon;
grant select, insert, update, delete on public.trade_opportunities to authenticated;

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
