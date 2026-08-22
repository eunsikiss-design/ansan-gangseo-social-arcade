create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  student_id text not null unique,
  role text not null check (role in ('student', 'teacher')),
  display_name text not null,
  grade text not null default '1학년',
  class_name text not null,
  student_number text not null,
  school_name text not null default '안산강서고등학교',
  must_change_password boolean not null default true,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists public.activity_snapshots (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  score integer not null default 0 check (score >= 0),
  login_count integer not null default 0 check (login_count >= 0),
  save_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists activity_score_idx
  on public.activity_snapshots(score desc, updated_at asc);

create index if not exists profiles_class_idx
  on public.profiles(class_name, student_id);

alter table public.profiles enable row level security;
alter table public.activity_snapshots enable row level security;

create or replace function public.current_user_is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'teacher'
  );
$$;

revoke all on function public.current_user_is_teacher() from public;
grant execute on function public.current_user_is_teacher() to authenticated;

drop policy if exists "profiles_read_own_or_teacher" on public.profiles;
create policy "profiles_read_own_or_teacher"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.current_user_is_teacher());

drop policy if exists "profiles_update_own_or_teacher" on public.profiles;
create policy "profiles_update_own_or_teacher"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.current_user_is_teacher())
  with check (id = auth.uid() or public.current_user_is_teacher());

drop policy if exists "activity_read_own_or_teacher" on public.activity_snapshots;
create policy "activity_read_own_or_teacher"
  on public.activity_snapshots for select
  to authenticated
  using (user_id = auth.uid() or public.current_user_is_teacher());

drop policy if exists "activity_insert_own" on public.activity_snapshots;
create policy "activity_insert_own"
  on public.activity_snapshots for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "activity_update_own_or_teacher" on public.activity_snapshots;
create policy "activity_update_own_or_teacher"
  on public.activity_snapshots for update
  to authenticated
  using (user_id = auth.uid() or public.current_user_is_teacher())
  with check (user_id = auth.uid() or public.current_user_is_teacher());

revoke all on public.profiles from anon;
revoke all on public.activity_snapshots from anon;
grant select, update on public.profiles to authenticated;
grant select, insert, update on public.activity_snapshots to authenticated;

