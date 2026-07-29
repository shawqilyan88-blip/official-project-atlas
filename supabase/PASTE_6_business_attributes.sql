-- Project Atlas - 0005 - Business attributes
-- Paste into Supabase Dashboard -> SQL Editor and Run, after PASTE_5.
-- Safe to run more than once. Expect: 'Success. No rows returned.'
--
-- Adds the enterprise-onboarding attributes captured by the refined selectors.
-- All are list- or single-value text columns validated in the application
-- against fixed option lists, so the vocabularies can grow without a migration.

-- Company Profile ------------------------------------------------------------

alter table public.trade_profiles
  add column if not exists business_types text[] not null default '{}';

alter table public.trade_profiles
  add column if not exists company_size text;

alter table public.trade_profiles
  add column if not exists incoterms text[] not null default '{}';

alter table public.trade_profiles
  add column if not exists payment_terms text[] not null default '{}';

alter table public.trade_profiles
  add column if not exists currencies text[] not null default '{}';

-- Trade Opportunity ----------------------------------------------------------

alter table public.trade_opportunities
  add column if not exists payment_terms text[] not null default '{}';

alter table public.trade_opportunities
  add column if not exists currencies text[] not null default '{}';
