-- Drop existing objects first
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop policy if exists "Users can view their own profile" on public.users;
drop policy if exists "Users can update their own profile" on public.users;
drop policy if exists "Enable insert for authenticated users only" on public.users;
drop policy if exists "Enable registration" on public.users;
drop table if exists public.match_sets cascade;
drop table if exists public.matches cascade;
drop table if exists public.users cascade;

-- Create users table
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text not null,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create matches table
create table public.matches (
  id uuid default gen_random_uuid() primary key,
  player1_id uuid references public.users(id) not null,
  player2_id uuid references public.users(id) not null,
  player1_score integer not null,
  player2_score integer not null,
  status text check (status in ('pending', 'confirmed', 'rejected')) not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create match sets table
create table public.match_sets (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references public.matches(id) on delete cascade not null,
  player1_score integer not null,
  player2_score integer not null,
  set_number integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.matches enable row level security;
alter table public.match_sets enable row level security;

-- Create policies for users table
create policy "Allow authenticated users to view all users"
  on public.users for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Enable insert for authenticated users only"
  on public.users for insert
  with check (auth.role() = 'authenticated');

create policy "Enable registration"
  on public.users for insert
  with check (true);

-- Create policies for matches table
create policy "Users can view matches they're involved in"
  on public.matches for select
  to authenticated
  using (
    auth.uid() = player1_id or 
    auth.uid() = player2_id
  );

create policy "Users can create matches as player1"
  on public.matches for insert
  to authenticated
  with check (auth.uid() = player1_id);

create policy "Players can update match status"
  on public.matches for update
  to authenticated
  using (
    auth.uid() = player2_id and 
    old.status = 'pending' and
    (new.status = 'confirmed' or new.status = 'rejected')
  );

create policy "Players can delete their matches"
  on public.matches for delete
  to authenticated
  using (
    (auth.uid() = player1_id or auth.uid() = player2_id or 
     exists(select 1 from public.users where id = auth.uid() and is_admin = true)) and
    (status = 'confirmed' or status = 'pending')
  );

-- Create policies for match sets table
create policy "Users can view match sets they're involved in"
  on public.match_sets for select
  to authenticated
  using (
    exists (
      select 1 from public.matches
      where id = match_id
      and (player1_id = auth.uid() or player2_id = auth.uid())
    )
  );

create policy "Users can create match sets as player1"
  on public.match_sets for insert
  to authenticated
  with check (
    exists (
      select 1 from public.matches
      where id = match_id
      and player1_id = auth.uid()
    )
  );

-- Set up auth triggers
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  raw_meta_data jsonb;
begin
  raw_meta_data := new.raw_user_meta_data::jsonb;
  
  insert into public.users (id, email, full_name, is_admin)
  values (
    new.id,
    new.email,
    coalesce(raw_meta_data->>'full_name', new.email),
    false
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create updated_at trigger for matches
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_matches_updated_at
  before update on public.matches
  for each row
  execute function public.update_updated_at_column();