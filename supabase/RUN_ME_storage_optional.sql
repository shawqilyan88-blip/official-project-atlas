-- =====================================================================
-- Project Atlas — Storage for LOI / document uploads (OPTIONAL)
-- =====================================================================
-- Run this AFTER RUN_ME_trade_setup.sql. It is only needed for the "Upload an
-- LOI" / document-upload feature — the Company Profile and Trade Opportunity
-- SAVES work without it. It is kept separate because creating policies on
-- storage.objects needs elevated privileges, and a failure here must not roll
-- back the core tables.
--
-- If this errors with a permission message, create the bucket in the Dashboard
-- (Storage -> New bucket -> name "trade-documents", not public) and add the
-- three policies via Storage -> Policies; the SQL below is the reference.
-- Safe to run more than once.

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
