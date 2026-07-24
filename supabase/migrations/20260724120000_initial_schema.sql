-- ============================================================================
-- Project Atlas — 0001 — Initial schema
--
-- Establishes the multi-tenant core: organizations (the tenant boundary),
-- profiles (application-owned user data), and memberships (the join that
-- carries a role).
--
-- Every business table added in later sprints must carry `organization_id`
-- and follow the same RLS pattern established in migration 0002.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Roles
--
-- Enum member order is significant: PostgreSQL compares enum values by their
-- declaration order, so declaring them ascending by privilege lets an
-- authorisation check read as `role >= 'admin'` instead of an OR-chain that
-- has to be revisited every time a role is added.
-- ---------------------------------------------------------------------------
create type public.app_role as enum ('member', 'admin', 'owner');


-- ---------------------------------------------------------------------------
-- Shared trigger: keep `updated_at` honest
--
-- Set in the database rather than by the application, so a value written by a
-- migration, an admin script, or a future service is still correct.
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Trigger function: stamps updated_at on every UPDATE.';


-- ---------------------------------------------------------------------------
-- profiles
--
-- One row per authenticated user, keyed by the auth user id. Credentials stay
-- in auth.users and are never duplicated here. The cascade means deleting an
-- auth user cleanly removes their application data.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_email_not_blank check (length(btrim(email)) > 0),
  constraint profiles_full_name_length check (
    full_name is null or length(btrim(full_name)) between 1 and 80
  ),
  constraint profiles_avatar_url_length check (
    avatar_url is null or length(avatar_url) <= 2048
  )
);

comment on table public.profiles is
  'Application-owned user data. Mirrors auth.users 1:1 via trigger.';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------------
-- organizations
--
-- The tenant. `slug` is globally unique because it occupies the public URL
-- namespace; the lowercase-only CHECK keeps uniqueness unambiguous without
-- depending on the citext extension.
-- ---------------------------------------------------------------------------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  -- Retained for auditing even if the creator later leaves the organization.
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint organizations_slug_unique unique (slug),
  constraint organizations_name_length check (
    length(btrim(name)) between 2 and 60
  ),
  constraint organizations_slug_format check (
    slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) between 3 and 40
  )
);

comment on table public.organizations is
  'Tenant boundary. Every business record belongs to exactly one organization.';

create index organizations_created_by_idx on public.organizations (created_by);

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------------
-- memberships
--
-- Membership is the entire access rule: no row here means no visibility into
-- that organization's data, enforced by RLS in migration 0002.
-- ---------------------------------------------------------------------------
create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  role public.app_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint memberships_user_organization_unique unique (user_id, organization_id)
);

comment on table public.memberships is
  'Join between a user and an organization, carrying their role there.';

-- The unique constraint already indexes (user_id, organization_id), which
-- serves user_id lookups. This covers the other direction: listing an
-- organization's members, and the role filter used by authorisation checks.
create index memberships_organization_id_role_idx
  on public.memberships (organization_id, role);


-- ---------------------------------------------------------------------------
-- Guarantee: an organization always has at least one owner
--
-- Without this, an owner demoting or removing themselves leaves an
-- organization that nobody can administer or delete — unrecoverable without
-- support intervention.
-- ---------------------------------------------------------------------------
create or replace function public.prevent_last_owner_removal()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_organization uuid;
  remaining_owners integer;
begin
  target_organization := old.organization_id;

  -- When the organization itself is being deleted, these membership rows are
  -- disappearing with it via ON DELETE CASCADE. Guarding them here would make
  -- an organization impossible to delete, so stand down. The parent row is
  -- already gone from this transaction's snapshot by the time the cascade runs.
  if not exists (
    select 1 from public.organizations where id = target_organization
  ) then
    return old;
  end if;

  select count(*)
    into remaining_owners
    from public.memberships
   where organization_id = target_organization
     and role = 'owner'
     and id <> old.id;

  if remaining_owners = 0 then
    raise exception 'An organization must retain at least one owner.'
      using errcode = 'check_violation';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

comment on function public.prevent_last_owner_removal() is
  'Blocks removing or demoting the final owner of an organization.';

create trigger memberships_prevent_last_owner_delete
  before delete on public.memberships
  for each row when (old.role = 'owner')
  execute function public.prevent_last_owner_removal();

create trigger memberships_prevent_last_owner_demote
  before update of role on public.memberships
  for each row when (old.role = 'owner' and new.role <> 'owner')
  execute function public.prevent_last_owner_removal();

create trigger memberships_set_updated_at
  before update on public.memberships
  for each row execute function public.set_updated_at();
