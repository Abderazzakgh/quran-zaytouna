alter table public.user_progress 
add column if not exists completed_surahs integer[] default '{}';
