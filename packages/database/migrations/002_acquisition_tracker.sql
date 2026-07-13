-- ============================================================
-- OutReach CRM — Client Acquisition Tracker Schema
-- Migration 002: acquisition_goals, outreach_logs, productivity_streaks
-- ============================================================

-- ── Enums ────────────────────────────────────────────────────
create type outreach_platform as enum (
  'linkedin', 'twitter', 'github', 'instagram', 'email', 'website'
);

create type outreach_type as enum (
  'connection', 'message', 'email', 'call'
);

create type outreach_status as enum (
  'sent', 'viewed', 'replied', 'interested'
);

create type goal_schedule as enum (
  'today_only', 'daily', 'weekdays', 'custom'
);

-- ── Acquisition Goals ────────────────────────────────────────
create table if not exists acquisition_goals (
  id               uuid primary key default gen_random_uuid(),
  user_id          text not null,
  date             date not null,
  target_contacts  integer not null default 0,
  linkedin_target  integer not null default 0,
  twitter_target   integer not null default 0,
  github_target    integer not null default 0,
  instagram_target integer not null default 0,
  email_target     integer not null default 0,
  calls_target     integer not null default 0,
  meetings_target  integer not null default 0,
  revenue_target   numeric(12, 2) not null default 0,
  working_hours    numeric(4, 2) not null default 8,
  notes            text,
  schedule         goal_schedule not null default 'daily',
  custom_days      integer[],
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists acquisition_goals_user_date
  on acquisition_goals (user_id, date);

-- ── Outreach Logs ────────────────────────────────────────────
create table if not exists outreach_logs (
  id             uuid primary key default gen_random_uuid(),
  user_id        text not null,
  lead_id        uuid references leads (id) on delete set null,
  platform       outreach_platform not null,
  contact_name   text not null,
  company        text,
  outreach_type  outreach_type not null,
  status         outreach_status not null default 'sent',
  replied        boolean not null default false,
  meeting_booked boolean not null default false,
  proposal_sent  boolean not null default false,
  client_won     boolean not null default false,
  revenue        numeric(12, 2),
  notes          text,
  created_at     timestamptz not null default now()
);

create index if not exists outreach_logs_user_created
  on outreach_logs (user_id, created_at desc);
create index if not exists outreach_logs_user_platform
  on outreach_logs (user_id, platform);
create index if not exists outreach_logs_user_status
  on outreach_logs (user_id, status);

-- ── Productivity Streaks ─────────────────────────────────────
create table if not exists productivity_streaks (
  id              uuid primary key default gen_random_uuid(),
  user_id         text not null unique,
  current_streak  integer not null default 0,
  longest_streak  integer not null default 0,
  completed_days  integer not null default 0,
  last_completed  date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists productivity_streaks_user
  on productivity_streaks (user_id);

-- ── Updated_at triggers ──────────────────────────────────────
create trigger acquisition_goals_updated_at
  before update on acquisition_goals
  for each row execute procedure set_updated_at();

create trigger productivity_streaks_updated_at
  before update on productivity_streaks
  for each row execute procedure set_updated_at();
