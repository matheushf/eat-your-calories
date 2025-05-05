create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cutting_season_start date,
  bulking_season_start date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = user_id);

create policy "Users can delete their own profile"
  on profiles for delete
  using (auth.uid() = user_id);

-- updated_at trigger
create or replace function update_profiles_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_profiles_updated_at_column(); 