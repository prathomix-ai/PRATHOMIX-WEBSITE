-- Migration 002 — Analytics events table

create table if not exists public.analytics_events (
  id         uuid primary key default gen_random_uuid(),
  event      text not null,
  page       text,
  properties jsonb default '{}',
  session_id text,
  referrer   text,
  created_at timestamptz not null default now()
);

create index if not exists idx_analytics_event   on public.analytics_events(event);
create index if not exists idx_analytics_page    on public.analytics_events(page);
create index if not exists idx_analytics_created on public.analytics_events(created_at desc);
