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
       and role >= minimum_role
  );
$$;

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

revoke all on function public.is_org_member(uuid) from public;
revoke all on function public.org_role(uuid) from public;
revoke all on function public.has_org_role(uuid, public.app_role) from public;
revoke all on function public.shares_organization_with(uuid) from public;

grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.org_role(uuid) to authenticated;
grant execute on function public.has_org_role(uuid, public.app_role) to authenticated;
grant execute on function public.shares_organization_with(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;

revoke all on public.profiles from anon;
revoke all on public.organizations from anon;
revoke all on public.memberships from anon;

grant select, update on public.profiles to authenticated;
grant select, update, delete on public.organizations to authenticated;
grant select, insert, update, delete on public.memberships to authenticated;

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

create policy "memberships: visible to the holder and to organization members"
  on public.memberships for select
  to authenticated
  using (
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
