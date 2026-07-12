-- ============================================================
-- OutReach CRM — Initial Schema for Supabase (PostgreSQL)
-- Run this in the Supabase SQL Editor or via the CLI.
-- ============================================================

-- Enable pg_trgm for full-text search on leads
create extension if not exists pg_trgm;

-- ── Enums ────────────────────────────────────────────────────
create type lead_status as enum (
  'new','initiated','message_sent','viewed','responded',
  'interested','meeting_scheduled','proposal_sent','negotiation',
  'waiting','won','lost','ghosted','rejected','archived'
);

create type lead_priority as enum ('low','medium','high','urgent');

create type lead_platform as enum (
  'linkedin','twitter','instagram','github','website','referral','email','other'
);

create type lead_response as enum ('positive','negative','neutral','none');

create type lead_project_type as enum (
  'web_development','mobile_app','design','consulting',
  'maintenance','seo','marketing','other'
);

create type activity_type as enum (
  'lead_created','lead_updated','email_sent','email_opened','email_clicked',
  'meeting_added','call_logged','note_added','proposal_uploaded',
  'project_won','project_lost','status_changed','follow_up_created',
  'follow_up_completed','attachment_added'
);

create type email_status as enum ('draft','sent','failed');

create type email_event_type as enum (
  'delivered','opened','clicked','bounced','complained','replied'
);

create type followup_status as enum ('pending','completed','overdue','cancelled');

create type recurring_unit as enum ('days','weeks','months');

create type meeting_type as enum ('call','video','in_person','other');

create type template_type as enum (
  'introduction','follow_up','reminder','proposal',
  'meeting_confirmation','thank_you','custom'
);

create type notification_type as enum ('info','success','warning','error');

create type theme_type as enum ('dark','light','system');

-- ── Users ────────────────────────────────────────────────────
-- Managed by better-auth; this mirrors the table it creates.
-- better-auth will create/manage this table automatically.

-- ── Tags ─────────────────────────────────────────────────────
create table if not exists tags (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  name        text not null,
  color       text not null default '#6366f1',
  created_at  timestamptz not null default now(),
  unique (user_id, name)
);

-- ── Leads ────────────────────────────────────────────────────
create table if not exists leads (
  id               uuid primary key default gen_random_uuid(),
  user_id          text not null,
  name             text not null,
  company          text,
  designation      text,
  industry         text,
  email            text,
  phone            text,
  whatsapp         text,
  website          text,
  linkedin         text,
  twitter          text,
  instagram        text,
  github           text,
  portfolio        text,
  location         text,
  bio              text,
  profile_image    text,
  tags             text[] not null default '{}',
  priority         lead_priority not null default 'medium',
  status           lead_status not null default 'new',
  platform         lead_platform not null,
  response         lead_response not null default 'none',
  budget           numeric,
  expected_revenue numeric,
  project_type     lead_project_type,
  last_contact     timestamptz,
  next_follow_up   timestamptz,
  score            integer check (score >= 0 and score <= 100),
  is_archived      boolean not null default false,
  archived_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists leads_user_id_created_at on leads (user_id, created_at desc);
create index if not exists leads_user_id_status      on leads (user_id, status);
create index if not exists leads_user_id_platform    on leads (user_id, platform);
create index if not exists leads_user_id_is_archived on leads (user_id, is_archived);
-- Trigram indexes for ILIKE search
create index if not exists leads_name_trgm    on leads using gin (name gin_trgm_ops);
create index if not exists leads_company_trgm on leads using gin (company gin_trgm_ops);
create index if not exists leads_email_trgm   on leads using gin (email gin_trgm_ops);

-- ── Activities ───────────────────────────────────────────────
create table if not exists activities (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  lead_id     uuid not null references leads (id) on delete cascade,
  type        activity_type not null,
  description text not null,
  icon        text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists activities_user_id_created_at on activities (user_id, created_at desc);
create index if not exists activities_lead_id_created_at on activities (lead_id, created_at desc);

-- ── Emails ───────────────────────────────────────────────────
create table if not exists emails (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  lead_id     uuid not null references leads (id) on delete cascade,
  message_id  text,
  subject     text not null,
  body        text not null,
  html        text,
  "from"      text not null,
  "to"        text not null,
  status      email_status not null default 'draft',
  thread_id   text,
  attachments text[] not null default '{}',
  opened_at   timestamptz,
  clicked_at  timestamptz,
  replied_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists emails_user_id_created_at on emails (user_id, created_at desc);
create index if not exists emails_lead_id_created_at on emails (lead_id, created_at desc);

-- ── Email Events ─────────────────────────────────────────────
create table if not exists email_events (
  id         uuid primary key default gen_random_uuid(),
  email_id   uuid not null references emails (id) on delete cascade,
  lead_id    uuid not null references leads (id) on delete cascade,
  type       email_event_type not null,
  data       jsonb,
  created_at timestamptz not null default now()
);

create index if not exists email_events_email_id on email_events (email_id);

-- ── Follow-ups ───────────────────────────────────────────────
create table if not exists follow_ups (
  id                 uuid primary key default gen_random_uuid(),
  user_id            text not null,
  lead_id            uuid not null references leads (id) on delete cascade,
  title              text not null,
  description        text,
  due_date           timestamptz not null,
  status             followup_status not null default 'pending',
  is_recurring       boolean not null default false,
  recurring_interval integer,
  recurring_unit     recurring_unit,
  completed_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists follow_ups_user_id_due_date on follow_ups (user_id, due_date);
create index if not exists follow_ups_user_id_status   on follow_ups (user_id, status);

-- ── Meetings ─────────────────────────────────────────────────
create table if not exists meetings (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  lead_id     uuid not null references leads (id) on delete cascade,
  title       text not null,
  description text,
  type        meeting_type not null default 'video',
  start_time  timestamptz not null,
  end_time    timestamptz,
  location    text,
  meeting_url text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists meetings_user_id_start_time on meetings (user_id, start_time);
create index if not exists meetings_lead_id            on meetings (lead_id);

-- ── Notes ────────────────────────────────────────────────────
create table if not exists notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  lead_id     uuid not null references leads (id) on delete cascade,
  content     text not null,
  is_pinned   boolean not null default false,
  attachments text[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists notes_lead_id on notes (lead_id);

-- ── Templates ────────────────────────────────────────────────
create table if not exists templates (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,
  name       text not null,
  subject    text not null,
  body       text not null,
  type       template_type not null default 'custom',
  variables  text[] not null default '{}',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists templates_user_id on templates (user_id);

-- ── Notifications ────────────────────────────────────────────
create table if not exists notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,
  title      text not null,
  message    text not null,
  type       notification_type not null default 'info',
  is_read    boolean not null default false,
  lead_id    uuid references leads (id) on delete set null,
  link       text,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_created_at on notifications (user_id, created_at desc);
create index if not exists notifications_user_id_is_read    on notifications (user_id, is_read);

-- ── Settings ─────────────────────────────────────────────────
create table if not exists settings (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   text not null unique,
  theme                     theme_type not null default 'dark',
  -- notifications (flattened from nested object)
  notif_email               boolean not null default true,
  notif_desktop             boolean not null default true,
  notif_follow_up_reminder  boolean not null default true,
  notif_meeting_reminder    boolean not null default true,
  -- email settings
  email_signature           text,
  email_default_from        text,
  email_track_opens         boolean not null default true,
  email_track_clicks        boolean not null default true,
  timezone                  text not null default 'UTC',
  api_key                   text unique,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- ── Attachments ──────────────────────────────────────────────
create table if not exists attachments (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,
  lead_id    uuid references leads (id) on delete cascade,
  email_id   uuid references emails (id) on delete cascade,
  name       text not null,
  url        text not null,
  size       integer not null,
  mime_type  text not null,
  created_at timestamptz not null default now()
);

create index if not exists attachments_user_id_created_at on attachments (user_id, created_at desc);
create index if not exists attachments_lead_id            on attachments (lead_id);
create index if not exists attachments_email_id           on attachments (email_id);

-- ── updated_at trigger ───────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger leads_updated_at        before update on leads        for each row execute procedure set_updated_at();
create trigger emails_updated_at       before update on emails       for each row execute procedure set_updated_at();
create trigger follow_ups_updated_at   before update on follow_ups   for each row execute procedure set_updated_at();
create trigger meetings_updated_at     before update on meetings      for each row execute procedure set_updated_at();
create trigger notes_updated_at        before update on notes        for each row execute procedure set_updated_at();
create trigger templates_updated_at    before update on templates    for each row execute procedure set_updated_at();
create trigger settings_updated_at     before update on settings     for each row execute procedure set_updated_at();
