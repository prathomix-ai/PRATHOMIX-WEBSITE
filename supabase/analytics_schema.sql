-- ============================================================
-- PRATHOMIX — Analytics Schema (addendum)
-- Run AFTER schema.sql in Supabase → SQL Editor
-- ============================================================

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

alter table public.analytics_events enable row level security;

-- Service role can do everything; anonymous inserts allowed for tracking
create policy "Anonymous insert"
  on public.analytics_events for insert
  with check (true);

create policy "Service full"
  on public.analytics_events for all
  using (auth.role() = 'service_role');

-- Handy summary function (used by /api/analytics/summary)
create or replace function public.analytics_summary()
returns table(event text, count bigint, last_seen timestamptz)
language sql stable as $$
  select event, count(*) as count, max(created_at) as last_seen
  from public.analytics_events
  group by event
  order by count desc;
$$;
