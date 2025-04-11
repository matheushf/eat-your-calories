create table if not exists food_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  grams integer not null,
  period text not null,
  is_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table food_items enable row level security;

create policy "Users can view their own food items"
  on food_items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own food items"
  on food_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own food items"
  on food_items for update
  using (auth.uid() = user_id);

create policy "Users can delete their own food items"
  on food_items for delete
  using (auth.uid() = user_id);

-- Create updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_food_items_updated_at
  before update on food_items
  for each row
  execute function update_updated_at_column(); 