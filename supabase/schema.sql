-- ============================================================
-- PRATHOMIX Supabase Schema
-- Run in Supabase -> SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";

-- chatbot_logs
create table if not exists public.chatbot_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete set null,
  query      text not null,
  intent     text,
  response   text,
  resolved   boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_chatbot_logs_created  on public.chatbot_logs(created_at desc);
create index if not exists idx_chatbot_logs_resolved on public.chatbot_logs(resolved);
create index if not exists idx_chatbot_logs_user     on public.chatbot_logs(user_id);

alter table public.chatbot_logs enable row level security;
create policy "Users read own" on public.chatbot_logs for select using (auth.uid() = user_id);
create policy "Service full"   on public.chatbot_logs for all    using (auth.role() = 'service_role');

-- projects
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  github_url  text,
  live_url    text,
  tags        text[] default '{}',
  created_at  timestamptz not null default now()
);
create index if not exists idx_projects_created on public.projects(created_at desc);

alter table public.projects enable row level security;
create policy "Public read"  on public.projects for select using (true);
create policy "Service full" on public.projects for all    using (auth.role() = 'service_role');

-- contact_submissions
create table if not exists public.contact_submissions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  created_at timestamptz not null default now()
);
alter table public.contact_submissions enable row level security;
create policy "Service full" on public.contact_submissions for all using (auth.role() = 'service_role');

-- profiles (auto-created on signup)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  avatar_url text,
  updated_at timestamptz
);
alter table public.profiles enable row level security;
create policy "Read own"   on public.profiles for select using (auth.uid() = id);
create policy "Update own" on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
