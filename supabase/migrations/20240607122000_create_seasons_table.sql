create table if not exists seasons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text check (type in ('cutting', 'bulking')) not null,
  started_at date not null,
  ended_at date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table seasons enable row level security;

create policy "Users can view their own seasons"
  on seasons for select
  using (auth.uid() = user_id);

create policy "Users can insert their own seasons"
  on seasons for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own seasons"
  on seasons for update
  using (auth.uid() = user_id);

create policy "Users can delete their own seasons"
  on seasons for delete
  using (auth.uid() = user_id);

-- updated_at trigger
create or replace function update_seasons_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_seasons_updated_at
  before update on seasons
  for each row
  execute function update_seasons_updated_at_column(); 