create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null default '익명',
  created_at timestamptz not null default now()
);

create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null default '익명',
  digit_count int not null check (digit_count between 3 and 8),
  answer jsonb not null,
  hints jsonb not null,
  remaining_pool jsonb not null default '[]'::jsonb,
  extra_hints_used int not null default 0,
  wrong_guesses int not null default 0,
  status text not null default 'playing' check (status in ('playing', 'won')),
  score int,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists attempts (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  guess jsonb not null,
  is_correct boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists attempts_game_id_idx on attempts (game_id);
create index if not exists games_user_id_idx on games (user_id);
create index if not exists games_leaderboard_idx
  on games (digit_count, score desc)
  where status = 'won';

alter table profiles enable row level security;
alter table games enable row level security;
alter table attempts enable row level security;

-- 의도적으로 select/insert/update policy를 추가하지 않는다.
-- anon/authenticated 역할은 RLS에 의해 전부 차단되고, 서버(Next.js API Route)에서
-- service_role 키로만 이 테이블들에 접근한다. 클라이언트가 Supabase에 직접 쿼리해서
-- games.answer(정답)를 읽어가는 것을 원천 차단하기 위한 안전장치.
