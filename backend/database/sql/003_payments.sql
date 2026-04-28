-- Migration 003 — Stripe / payments fields

alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists plan               text default 'free',
  add column if not exists plan_expires_at    timestamptz;

create table if not exists public.subscription_events (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid,
  stripe_event_id text unique,
  event_type      text not null,
  plan            text,
  amount          integer,
  currency        text default 'usd',
  status          text,
  metadata        jsonb default '{}',
  created_at      timestamptz not null default now()
);
