-- blockr: one row per signed-in user, holding the whole app state as JSON.
-- Run this once in the Supabase SQL editor (Dashboard > SQL Editor > New query).

create table if not exists public.blockr_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.blockr_state enable row level security;

-- Each user can only ever see/touch their own row.
create policy "Users can read their own state"
  on public.blockr_state for select
  using (auth.uid() = user_id);

create policy "Users can insert their own state"
  on public.blockr_state for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own state"
  on public.blockr_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Keep updated_at current on every write.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger blockr_state_set_updated_at
  before update on public.blockr_state
  for each row
  execute function public.set_updated_at();
