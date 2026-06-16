-- ─────────────────────────────────────────────────────────────────────────────
-- CARB · Supabase (PostgreSQL) schema  [OPTIONAL]
--
-- The app is fully functional on browser localStorage with no database. Apply
-- this schema only if you want multi-device / team persistence and shared
-- longitudinal tracking. No personally identifiable information is stored
-- (AC-14): records are community-level only.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- A completed (or in-progress) assessment.
create table if not exists assessments (
  id              uuid primary key default gen_random_uuid(),
  owner           uuid references auth.users (id) on delete set null,
  community_name  text not null,
  community_type  text check (community_type in ('urban','suburban','rural','remote')),
  population      text,
  region          text,
  country         text,
  status          text not null default 'draft' check (status in ('draft','complete')),
  answers         jsonb not null default '{}'::jsonb,   -- { questionId: 0..1 }
  context         jsonb not null default '{}'::jsonb,   -- onboarding + free text
  overall         integer,                              -- 0..100 (when complete)
  tier            text,
  results         jsonb,                                -- full computed snapshot
  roadmap         jsonb,
  narrative       jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists assessments_owner_idx on assessments (owner);
create index if not exists assessments_community_idx on assessments (community_name);
create index if not exists assessments_created_idx on assessments (created_at desc);

-- Keep updated_at fresh.
create or replace function touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists assessments_touch on assessments;
create trigger assessments_touch before update on assessments
  for each row execute function touch_updated_at();

-- Row-level security: each user sees only their own rows; anonymous drafts allowed.
alter table assessments enable row level security;

drop policy if exists "own rows: select" on assessments;
create policy "own rows: select" on assessments
  for select using (owner = auth.uid() or owner is null);

drop policy if exists "own rows: insert" on assessments;
create policy "own rows: insert" on assessments
  for insert with check (owner = auth.uid() or owner is null);

drop policy if exists "own rows: update" on assessments;
create policy "own rows: update" on assessments
  for update using (owner = auth.uid() or owner is null);

drop policy if exists "own rows: delete" on assessments;
create policy "own rows: delete" on assessments
  for delete using (owner = auth.uid());
