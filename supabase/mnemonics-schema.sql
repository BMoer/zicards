-- ZìCards: mnemonics table
-- Moves the 595-LOC src/utils/mnemonics.js from code into the DB,
-- mirroring how characters and sentences already live in Supabase.
-- One row per hànzì (single char or compound). `parts` is a jsonb array
-- of [{ char, meaning }] used by MnemonicCard to render the
-- decomposition with already-learned components highlighted.

create table if not exists public.mnemonics (
  hanzi text primary key,
  mnemonic text not null,
  parts jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_mnemonics_hanzi on public.mnemonics(hanzi);

-- RLS: read-only for all authenticated users; writes go through service role
-- (admin / seed scripts only).
alter table public.mnemonics enable row level security;

drop policy if exists "Mnemonics readable by everyone" on public.mnemonics;
create policy "Mnemonics readable by everyone"
  on public.mnemonics for select using (true);

-- Trigger: keep updated_at fresh on writes
create or replace function public.mnemonics_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists mnemonics_updated_at on public.mnemonics;
create trigger mnemonics_updated_at
  before update on public.mnemonics
  for each row execute function public.mnemonics_set_updated_at();

-- Data-API GRANTs (siehe supabase/grants-2026-05-28-api-default-change.sql)
GRANT SELECT                 ON TABLE public.mnemonics TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.mnemonics TO service_role;
