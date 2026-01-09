create table if not exists public.user_progress (
  user_id uuid references auth.users not null primary key,
  surah_id integer default 1,
  ayah_number integer default 1,
  reciter_id text,
  font_size integer default 32,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_progress enable row level security;

create policy "Users can view their own progress" on public.user_progress
  for select using (auth.uid() = user_id);

create policy "Users can insert/update their own progress" on public.user_progress
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
