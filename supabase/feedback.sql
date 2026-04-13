-- Run this in the Supabase SQL Editor

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  comment text not null,
  screenshot_data text,        -- base64-encoded JPEG
  page_url text,
  created_at timestamptz default now()
);

alter table feedback enable row level security;

-- Users can submit their own feedback
create policy "users can insert own feedback"
  on feedback for insert to authenticated
  with check (auth.uid() = user_id);

-- Admins can read all feedback (reuses existing is_admin() function)
create policy "admins can read all feedback"
  on feedback for select to authenticated
  using (is_admin());
