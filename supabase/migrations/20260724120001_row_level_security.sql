-- ============================================================================
-- Project Atlas — 0002 — Row Level Security
--
-- RLS is the real security boundary. Middleware and UI guards are convenience;
-- this file is what actually stops tenant A from reading tenant B's data, and
-- it holds even if the application layer is entirely bypassed.
--
-- Two design notes that matter:
--
-- 1. The helper functions below are SECURITY DEFINER. A policy on `memberships`
--    that queries `memberships` would recurse infinitely, because evaluating
--    the policy re-triggers the policy. A definer-owned function runs as the
--    table owner and is therefore exempt from RLS, breaking the cycle. This is
--    the standard fix, and the reason these tables must NOT use
--    `FORCE ROW LEVEL SECURITY` — that would re-subject the owner to RLS and
--    reintroduce the recursion.
--
-- 2. Every function pins `search_path = ''` and fully qualifies its references.
--    Without this, a caller can prepend a schema of their own and hijack an
--    unqualified name inside a definer function — privilege escalation by
--    shadowing.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Authorisation helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_org_member(target_organization uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.memberships
     where organization_id = target_organization
       and user_id = (select auth.uid())
  );
$$;

comment on function public.is_org_member(uuid) is
  'True when the current user belongs to the given organization. RLS-exempt by design.';


create or replace function public.org_role(target_organization uuid)
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select role
    from public.memberships
   where organization_id = target_organization
     and user_id = (select auth.uid());
$$;

comment on function public.org_role(uuid) is
  'The current user''s role in the given organization, or NULL if not a member.';


create or replace function public.has_org_role(
  target_organization uuid,
  minimum_role public.app_role
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.memberships
     where organization_id = target_organization
       and user_id = (select auth.uid())
       -- Enum comparison relies on the ascending declaration order in 0001.
       and role >= minimum_role
  );
$$;

comment on function public.has_org_role(uuid, public.app_role) is
  'True when the current user holds at least the given role in the organization.';


create or replace function public.shares_organization_with(target_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.memberships as viewer
      join public.memberships as subject
        on subject.organization_id = viewer.organization_id
     where viewer.user_id = (select auth.uid())
       and subject.user_id = target_user
  );
$$;

comment on function public.shares_organization_with(uuid) is
  'True when the current user shares at least one organization with the target user.';


-- These helpers must never be callable by anonymous visitors.
revoke all on function public.is_org_member(uuid) from public;
revoke all on function public.org_role(uuid) from public;
revoke all on function public.has_org_role(uuid, public.app_role) from public;
revoke all on function public.shares_organization_with(uuid) from public;

grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.org_role(uuid) to authenticated;
grant execute on function public.has_org_role(uuid, public.app_role) to authenticated;
grant execute on function public.shares_organization_with(uuid) to authenticated;


-- ---------------------------------------------------------------------------
-- Enable RLS
--
-- Enabled with no policy means deny-all, which is the correct default: a table
-- added later without policies fails closed rather than leaking.
-- ---------------------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships   enable row level security;


-- ---------------------------------------------------------------------------
-- Table privileges
--
-- RLS filters rows; GRANTs decide whether a role may attempt the operation at
-- all. Anonymous visitors get nothing — the marketing site reads no tables.
-- ---------------------------------------------------------------------------
revoke all on public.profiles      from anon;
revoke all on public.organizations from anon;
revoke all on public.memberships   from anon;

grant select, update            on public.profiles      to authenticated;
grant select, update, delete    on public.organizations to authenticated;
grant select, insert, update, delete on public.memberships to authenticated;

-- Organizations are created exclusively through create_organization_with_owner
-- (migration 0003), which also creates the owner membership in the same
-- transaction. Withholding INSERT makes an org with no members unrepresentable.


-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

-- Colleagues need each other's names and avatars to render assignments,
-- comments, and member lists. Visibility stops at the organization edge.
create policy "profiles: readable by self and organization colleagues"
  on public.profiles for select
  to authenticated
  using (
    id = (select auth.uid())
    or public.shares_organization_with(id)
  );

create policy "profiles: updatable only by their owner"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- No INSERT policy: profiles are created by the on-signup trigger in 0003.
-- No DELETE policy: profiles disappear only when the auth user is deleted.


-- ---------------------------------------------------------------------------
-- organizations
-- ---------------------------------------------------------------------------

create policy "organizations: visible to their members"
  on public.organizations for select
  to authenticated
  using (public.is_org_member(id));

create policy "organizations: editable by admins and owners"
  on public.organizations for update
  to authenticated
  using (public.has_org_role(id, 'admin'))
  with check (public.has_org_role(id, 'admin'));

create policy "organizations: deletable only by owners"
  on public.organizations for delete
  to authenticated
  using (public.has_org_role(id, 'owner'));


-- ---------------------------------------------------------------------------
-- memberships
--
-- The escalation rule throughout: you may never grant, or act upon, a role
-- higher than your own. Without it an admin could promote themselves to owner,
-- or delete the owner and take over the tenant.
-- ---------------------------------------------------------------------------

create policy "memberships: visible to the holder and to organization members"
  on public.memberships for select
  to authenticated
  using (
    -- Cheap non-recursive check first; short-circuits for the common case.
    user_id = (select auth.uid())
    or public.is_org_member(organization_id)
  );

create policy "memberships: created by admins, never above their own role"
  on public.memberships for insert
  to authenticated
  with check (
    public.has_org_role(organization_id, 'admin')
    and role <= public.org_role(organization_id)
  );

create policy "memberships: modified by admins, never above their own role"
  on public.memberships for update
  to authenticated
  using (
    public.has_org_role(organization_id, 'admin')
    -- You cannot act on someone who outranks you.
    and role <= public.org_role(organization_id)
  )
  with check (
    public.has_org_role(organization_id, 'admin')
    and role <= public.org_role(organization_id)
  );

create policy "memberships: removable by admins, or by the member leaving"
  on public.memberships for delete
  to authenticated
  using (
    user_id = (select auth.uid())
    or (
      public.has_org_role(organization_id, 'admin')
      and role <= public.org_role(organization_id)
    )
  );
