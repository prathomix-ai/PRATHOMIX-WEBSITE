-- ============================================================
-- PRATHOMIX — Payments / Subscriptions Schema (addendum)
-- Run AFTER schema.sql in Supabase → SQL Editor
-- ============================================================

-- Extend profiles with Stripe fields
alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists plan               text default 'free',
  add column if not exists plan_expires_at    timestamptz;

create index if not exists idx_profiles_stripe
  on public.profiles(stripe_customer_id);

-- Subscription audit log
create table if not exists public.subscription_events (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete set null,
  stripe_event_id text unique,
  event_type      text not null,
  plan            text,
  amount          integer,  -- in cents
  currency        text default 'usd',
  status          text,
  metadata        jsonb default '{}',
  created_at      timestamptz not null default now()
);

create index if not exists idx_sub_events_user on public.subscription_events(user_id);
create index if not exists idx_sub_events_type on public.subscription_events(event_type);

alter table public.subscription_events enable row level security;
create policy "Users read own" on public.subscription_events
  for select using (auth.uid() = user_id);
create policy "Service full"   on public.subscription_events
  for all    using (auth.role() = 'service_role');
