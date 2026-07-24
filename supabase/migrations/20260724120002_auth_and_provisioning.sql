-- ============================================================================
-- Project Atlas — 0003 — Auth lifecycle and organization provisioning
--
-- Bridges Supabase's auth schema to the application schema, and provides the
-- single supported way to create an organization.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Provision a profile whenever an auth user is created
--
-- Runs as a definer trigger because the new user has no session yet and could
-- not satisfy any RLS policy at this moment.
--
-- Defensiveness matters here beyond the usual: an exception raised in this
-- trigger aborts the enclosing transaction, which means the *signup itself*
-- fails with an opaque "Database error saving new user". Values from OAuth
-- providers are therefore truncated to fit the CHECK constraints rather than
-- allowed to violate them.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  resolved_name text;
  resolved_avatar text;
begin
  resolved_name := nullif(
    btrim(
      coalesce(
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'name',
        ''
      )
    ),
    ''
  );

  resolved_avatar := nullif(
    btrim(
      coalesce(
        new.raw_user_meta_data ->> 'avatar_url',
        new.raw_user_meta_data ->> 'picture',
        ''
      )
    ),
    ''
  );

  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    -- An auth user always has an identifier; fall back rather than fail the
    -- CHECK on a blank email for phone-only or anonymous sign-ins.
    coalesce(nullif(btrim(new.email), ''), new.id::text),
    left(resolved_name, 80),
    left(resolved_avatar, 2048)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Creates the public.profiles row for a newly registered auth user.';

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---------------------------------------------------------------------------
-- Keep the profile email in sync
--
-- Supabase updates auth.users.email once a change is confirmed. Without this,
-- profiles.email silently drifts and starts showing stale addresses in member
-- lists.
-- ---------------------------------------------------------------------------
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
     set email = coalesce(nullif(btrim(new.email), ''), email)
   where id = new.id;

  return new;
end;
$$;

comment on function public.handle_user_email_change() is
  'Mirrors a confirmed auth.users email change onto the profile.';

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();


-- ---------------------------------------------------------------------------
-- Create an organization together with its first owner
--
-- Definer, and atomic, for a specific reason: an organization and its founding
-- membership must appear together or not at all. Two separate client calls
-- could interleave a failure between them and leave an organization nobody can
-- reach — invisible under RLS and undeletable. That is also why `organizations`
-- carries no INSERT policy: this function is the only supported path in.
-- ---------------------------------------------------------------------------
create or replace function public.create_organization_with_owner(
  organization_name text,
  organization_slug text
)
returns public.organizations
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  created_organization public.organizations;
begin
  if current_user_id is null then
    raise exception 'Authentication required to create an organization.'
      using errcode = 'insufficient_privilege';
  end if;

  -- Normalise before the CHECK constraints see the values, so that a stray
  -- trailing space produces a usable organization rather than a 500.
  organization_name := btrim(organization_name);
  organization_slug := lower(btrim(organization_slug));

  insert into public.organizations (name, slug, created_by)
  values (organization_name, organization_slug, current_user_id)
  returning * into created_organization;

  insert into public.memberships (user_id, organization_id, role)
  values (current_user_id, created_organization.id, 'owner');

  return created_organization;
end;
$$;

comment on function public.create_organization_with_owner(text, text) is
  'Atomically creates an organization and its owner membership. Raises 23505 on slug collision.';

revoke all on function public.create_organization_with_owner(text, text) from public;
grant execute on function public.create_organization_with_owner(text, text) to authenticated;


-- ---------------------------------------------------------------------------
-- Slug availability, without leaking the organization directory
--
-- A plain SELECT against organizations would return nothing for a slug the
-- caller cannot see, making a taken slug look free and producing a confusing
-- failure on submit. This answers only the boolean question.
-- ---------------------------------------------------------------------------
create or replace function public.is_organization_slug_available(candidate_slug text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (
    select 1
      from public.organizations
     where slug = lower(btrim(candidate_slug))
  );
$$;

comment on function public.is_organization_slug_available(text) is
  'True when the slug is unclaimed. Reveals availability only, never organization data.';

revoke all on function public.is_organization_slug_available(text) from public;
grant execute on function public.is_organization_slug_available(text) to authenticated;
