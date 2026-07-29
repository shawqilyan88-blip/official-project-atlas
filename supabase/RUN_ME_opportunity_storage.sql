-- =====================================================================
-- Project Atlas — Storage for opportunity documents (Sprint 3.2 Step 1)
-- =====================================================================
-- Run this AFTER RUN_ME_opportunity_engine.sql. It creates the private bucket
-- that opportunity documents are uploaded to, plus the RLS policies that keep
-- every object scoped to the owning organization.
--
-- Object paths are `<organization_id>/<opportunity_id>/<uuid>-<filename>`, so
-- `(storage.foldername(name))[1]` is the organization id and RLS reuses the same
-- is_org_member / has_org_role helpers as the tables.
--
-- Kept separate because creating policies on storage.objects needs elevated
-- privilege, and a failure here must not roll back the engine tables. If this
-- errors with a permission message, create the bucket in the Dashboard
-- (Storage → New bucket → "opportunity-documents", NOT public) and add the three
-- policies via Storage → Policies; the SQL below is the reference. Idempotent.

insert into storage.buckets (id, name, public)
values ('opportunity-documents', 'opportunity-documents', false)
on conflict (id) do nothing;

drop policy if exists "opportunity-docs: members read" on storage.objects;
create policy "opportunity-docs: members read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'opportunity-documents'
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "opportunity-docs: members upload" on storage.objects;
create policy "opportunity-docs: members upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'opportunity-documents'
    and owner = (select auth.uid())
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "opportunity-docs: owner or admin delete" on storage.objects;
create policy "opportunity-docs: owner or admin delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'opportunity-documents'
    and (
      owner = (select auth.uid())
      or public.has_org_role(((storage.foldername(name))[1])::uuid, 'admin')
    )
  );
