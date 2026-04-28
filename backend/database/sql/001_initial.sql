-- Migration 001 — Initial PRATHOMIX schema
-- This mirrors supabase/schema.sql for version-controlled migrations

create extension if not exists "uuid-ossp";

create table if not exists public.chatbot_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid,
  query      text not null,
  intent     text,
  response   text,
  resolved   boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  github_url  text,
  live_url    text,
  tags        text[] default '{}',
  created_at  timestamptz not null default now()
);

create table if not exists public.contact_submissions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id         uuid primary key,
  full_name  text,
  avatar_url text,
  updated_at timestamptz
);
