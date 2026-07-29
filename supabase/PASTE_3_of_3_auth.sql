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
    coalesce(nullif(btrim(new.email), ''), new.id::text),
    left(resolved_name, 80),
    left(resolved_avatar, 2048)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

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

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

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

revoke all on function public.create_organization_with_owner(text, text) from public;
grant execute on function public.create_organization_with_owner(text, text) to authenticated;

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

revoke all on function public.is_organization_slug_available(text) from public;
grant execute on function public.is_organization_slug_available(text) to authenticated;
