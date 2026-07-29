-- Project Atlas - 0003 - Trade Profile
-- Paste into Supabase Dashboard -> SQL Editor and Run.
-- Safe to run more than once. Expect: 'Success. No rows returned.'
-- Adds the per-organization Trade Profile, its uploaded documents, and a
-- private Storage bucket, all governed by the same RLS helpers as the core
-- schema (is_org_member / has_org_role).

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

-- trade_profiles ------------------------------------------------------------
-- One row per organization: the workspace's business identity. The trade
-- engines read this to search intelligently; it is created during onboarding.

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

comment on table public.trade_profiles is
  'Per-organization business identity that guides buyer and supplier discovery.';

drop trigger if exists trade_profiles_set_updated_at on public.trade_profiles;
create trigger trade_profiles_set_updated_at
  before update on public.trade_profiles
  for each row execute function public.set_updated_at();

-- trade_profile_documents ---------------------------------------------------
-- Business documents a user uploads so Atlas can (later) extract profile data.
-- The file itself lives in Storage; this row is its metadata and status.

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

comment on table public.trade_profile_documents is
  'Metadata for uploaded business documents; the bytes live in Storage.';

create index if not exists trade_profile_documents_org_idx
  on public.trade_profile_documents (organization_id, created_at desc);

drop trigger if exists trade_profile_documents_set_updated_at
  on public.trade_profile_documents;
create trigger trade_profile_documents_set_updated_at
  before update on public.trade_profile_documents
  for each row execute function public.set_updated_at();

-- Row Level Security --------------------------------------------------------

alter table public.trade_profiles enable row level security;
alter table public.trade_profile_documents enable row level security;

revoke all on public.trade_profiles from anon;
revoke all on public.trade_profile_documents from anon;

grant select, insert, update, delete on public.trade_profiles to authenticated;
grant select, insert, update, delete on public.trade_profile_documents to authenticated;

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

-- Storage: private bucket for the uploaded documents ------------------------
-- Files are keyed by organization: '<organization_id>/<uuid>-<filename>'. The
-- policies read that first path segment to decide access, so a file is only
-- ever reachable by members of the organization that owns it.

insert into storage.buckets (id, name, public)
values ('trade-documents', 'trade-documents', false)
on conflict (id) do nothing;

drop policy if exists "trade-documents: members read" on storage.objects;
create policy "trade-documents: members read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'trade-documents'
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "trade-documents: members upload" on storage.objects;
create policy "trade-documents: members upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'trade-documents'
    and owner = (select auth.uid())
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "trade-documents: owner or admin delete" on storage.objects;
create policy "trade-documents: owner or admin delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'trade-documents'
    and (
      owner = (select auth.uid())
      or public.has_org_role(((storage.foldername(name))[1])::uuid, 'admin')
    )
  );
