# OutReach CRM — Application Specification

## 1. Overview

OutReach CRM is a full-stack customer relationship management platform built for freelancers, solopreneurs, and small agencies who do cold outreach on social media platforms. It provides end-to-end lead tracking — from initial contact capture on LinkedIn/Twitter/GitHub/Instagram through pipeline management to deal closure — along with email outreach, meeting scheduling, follow-up automation, and analytics.

The application consists of three deliverables:
1. **Web Application** — A Next.js 16 dashboard for managing the entire CRM workflow
2. **Chrome Extension** — A Manifest V3 browser extension for one-click lead capture from social profiles
3. **API Layer** — RESTful API routes that power both the web app and extension, with session and API-key authentication

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.x |
| Runtime | React | 19.x |
| Language | TypeScript | 5.x |
| Database | Supabase (PostgreSQL) | — |
| Auth | better-auth + PostgreSQL adapter | 1.6.x |
| Email Service | Resend + React Email | 6.x |
| UI Components | Radix UI primitives | Latest |
| Styling | Tailwind CSS | 4.x |
| Charts | Recharts | 3.x |
| Data Tables | TanStack Table | 8.x |
| Forms | React Hook Form + Zod | 7.x / 4.x |
| State Management | Zustand | 5.x |
| Drag & Drop | dnd-kit | 6.x |
| Animations | Framer Motion | 12.x |
| Hosting | Vercel (recommended) | — |

---

## 3. Architecture

### 3.1 Monorepo Structure (npm workspaces)

```
outreach-crm/
├── apps/
│   └── web/                  Next.js 16 — frontend + BFF API routes
│       ├── app/              App Router: pages + API route handlers
│       ├── components/       React components (calendar, dashboard, emails, leads, layout, ui)
│       ├── hooks/            Custom React hooks
│       ├── lib/              Client-side utilities, API client, auth client
│       ├── store/            Zustand stores
│       └── proxy.ts          Middleware — session guard, public path allowlist
│
├── packages/
│   ├── shared/               Platform-agnostic types + Zod validation schemas
│   │   └── src/types/        api.ts, enums.ts, models.ts
│   ├── database/             Supabase client singleton, typed database interface, SQL migrations
│   │   ├── src/schemas/      TypeScript interfaces for each table
│   │   └── migrations/       PostgreSQL DDL scripts
│   └── server/               Service layer, auth config, Resend client, API-key resolver
│       └── src/services/     One service file per domain entity
│
├── extension/                Chrome Extension (Manifest V3)
│   ├── background.ts         Service worker
│   ├── content.ts            Content script — detects profiles, injects capture UI
│   ├── popup.html/ts         Extension popup — settings & connection status
│   └── manifest.json         Extension manifest
│
└── package.json              Workspace root — orchestrates all packages
```

### 3.2 Data Flow

```
Browser ──▶ Next.js API Routes (apps/web/app/api/) ──▶ Service Layer (@outreach/server)
                                                            │
                                                            ▼
                                                   Supabase (PostgreSQL)
```

- The **web app** makes fetch calls to its own API routes (BFF pattern).
- The **Chrome extension** calls the same API routes using an API key in the `X-API-Key` header.
- The **service layer** is stateless and interacts with Supabase via the typed client from `@outreach/database`.

### 3.3 Authentication

| Method | Usage | Mechanism |
|--------|-------|-----------|
| Session cookie | Web app (browser) | better-auth sets `better-auth.session_token` on login |
| API key | Chrome extension / external tools | `X-API-Key` or `Authorization: Bearer <key>` header |

The middleware (`proxy.ts`) redirects unauthenticated users to `/login`. Public paths (`/login`, `/signup`, `/forgot-password`, `/reset-password`, `/api/auth`) are exempt.

---

## 4. Database Schema

All data is stored in Supabase (PostgreSQL). The schema is defined in `packages/database/migrations/001_initial_schema.sql`.

### 4.1 Tables

| Table | Description | Key Relationships |
|-------|-------------|-------------------|
| `user` | User accounts (managed by better-auth) | — |
| `leads` | Contact/prospect records | Tags (text[]), links to activities, emails, notes, meetings, follow-ups |
| `tags` | User-defined colored labels | Unique per (user_id, name) |
| `activities` | Auto-logged timeline events | FK → leads |
| `emails` | Sent/draft emails | FK → leads |
| `email_events` | Open/click/bounce tracking events | FK → emails, leads |
| `follow_ups` | Scheduled tasks with optional recurrence | FK → leads |
| `meetings` | Logged calls, video calls, in-person meetings | FK → leads |
| `notes` | Free-text notes per lead | FK → leads |
| `templates` | Reusable email templates | — |
| `notifications` | In-app notification items | Optional FK → leads |
| `settings` | Per-user preferences (theme, email, notifications) | Unique on user_id |
| `attachments` | Uploaded files | FK → leads, emails |

### 4.2 Enums

| Enum | Values |
|------|--------|
| `lead_status` | new, initiated, message_sent, viewed, responded, interested, meeting_scheduled, proposal_sent, negotiation, waiting, won, lost, ghosted, rejected, archived |
| `lead_priority` | low, medium, high, urgent |
| `lead_platform` | linkedin, twitter, instagram, github, website, referral, email, other |
| `lead_response` | positive, negative, neutral, none |
| `lead_project_type` | web_development, mobile_app, design, consulting, maintenance, seo, marketing, other |
| `activity_type` | lead_created, lead_updated, email_sent, email_opened, email_clicked, meeting_added, call_logged, note_added, proposal_uploaded, project_won, project_lost, status_changed, follow_up_created, follow_up_completed, attachment_added |
| `email_status` | draft, sent, failed |
| `email_event_type` | delivered, opened, clicked, bounced, complained, replied |
| `followup_status` | pending, completed, overdue, cancelled |
| `recurring_unit` | days, weeks, months |
| `meeting_type` | call, video, in_person, other |
| `template_type` | introduction, follow_up, reminder, proposal, meeting_confirmation, thank_you, custom |
| `notification_type` | info, success, warning, error |
| `theme_type` | dark, light, system |

### 4.3 Indexes & Triggers

- Composite indexes on `(user_id, created_at)` for paginated queries
- Status/platform indexes on leads for filtered views
- Trigram (pg_trgm) GIN indexes on `leads.name`, `leads.company`, `leads.email` for fuzzy ILIKE search
- Auto-updating `updated_at` trigger on all tables with that column

---

## 5. Modules & Features

### 5.1 Authentication Module

| Route | Description |
|-------|-------------|
| `/login` | Email + password sign-in |
| `/signup` | Account registration |
| `/forgot-password` | Password reset request (sends email via Resend) |
| `/reset-password` | Set new password from email link |

- Session-based auth with 7-day expiry, auto-refresh after 1 day
- No email verification required by default (configurable)

### 5.2 Dashboard (Home)

**Route:** `/dashboard`

Displays at-a-glance metrics:
- Total leads, active pipeline count, win rate percentage
- Revenue pipeline (sum of expected_revenue for active leads)
- Active follow-ups count
- Leads-by-status chart
- Platform breakdown (pie/donut chart)
- Recent activity feed (last 8 actions)

### 5.3 Lead Management

**Routes:** `/dashboard/leads`, `/dashboard/leads/[id]`

**List View Features:**
- Paginated table with sortable columns (name, company, status, priority, created date)
- Full-text search across name, company, email (fuzzy matching via pg_trgm)
- Multi-filter toolbar: status, platform, priority, tags, archive state
- Bulk actions: update status, delete, archive
- CSV import with column mapping
- CSV export with current filters applied

**Detail View Tabs:**
- **Overview** — All contact fields, social links, status/priority selectors, budget, project type
- **Emails** — Thread view of all emails sent to this lead, with open/click indicators
- **Notes** — Pinnable notes with text content and optional file attachments
- **Meetings** — List of logged meetings with type, time, location, and notes
- **Attachments** — All files uploaded against this lead or its emails
- **Activity** — Complete auto-generated timeline of interactions

### 5.4 Pipeline (Kanban)

**Route:** `/dashboard/pipeline`

- Drag-and-drop board with columns for each `lead_status`
- Cards show lead name, company, priority badge, and last contact date
- Dragging a card between columns updates the lead's status in real time
- Built with dnd-kit for accessible, performant drag interactions

### 5.5 Email Outreach

**Route:** `/dashboard/emails`

**Features:**
- Compose emails with subject, rich body, and recipient (auto-filled from lead)
- Template selection with variable substitution (`{{name}}`, `{{company}}`, etc.)
- Draft saving — emails start as `draft` status until explicitly sent
- Send via Resend API
- Open/click tracking via Resend webhooks → stored as `email_events`
- Thread view: all emails to a lead grouped chronologically
- Status indicators: sent, opened, clicked, bounced, replied

**API Routes:**
- `GET /api/emails` — List emails with filters (lead_id, status, date range)
- `POST /api/emails/draft` — Save a draft
- `POST /api/emails` — Send an email
- `GET /api/emails/[id]` — Get single email with events
- `DELETE /api/emails/[id]` — Delete a draft

### 5.6 Email Templates

**Route:** `/dashboard/templates`

- CRUD for reusable email templates
- Fields: name, subject, body, type, variables list, is_default flag
- 7 template types: Introduction, Follow-up, Reminder, Proposal, Meeting Confirmation, Thank You, Custom
- Variable extraction — templates declare which `{{variables}}` they use
- Default template is pre-selected in compose dialogs

### 5.7 Follow-ups

**Route:** `/dashboard/followups`

- Schedule follow-up tasks against leads with a due date/time
- Status management: pending → completed / overdue / cancelled
- Recurring support: repeat every N days/weeks/months
- Overdue detection and visual highlighting
- Integrated into Calendar view

### 5.8 Meetings & Calendar

**Route:** `/dashboard/calendar`

- Monthly grid calendar showing meetings and follow-ups
- Agenda/list view alternative
- Meeting types: Call, Video, In-Person, Other
- Fields: title, description, start/end time, location, meeting URL, notes
- Create meetings from lead detail or calendar view

### 5.9 Analytics

**Route:** `/dashboard/analytics`

- Pipeline funnel chart: conversion rates at each stage
- Leads by platform breakdown
- Email engagement metrics: delivery rate, open rate, click rate, bounce rate
- Activity volume over time (line/area chart)
- Date range selector (7d, 30d, 90d, custom)

### 5.10 Notifications

- In-app notification bell in the header/sidebar
- Types: info, success, warning, error
- Optional link to related lead or resource
- Mark as read / mark all as read
- Triggered by system events (follow-up due, email bounced, etc.)

### 5.11 Settings

**Route:** `/dashboard/settings`

| Section | Options |
|---------|---------|
| Theme | Dark, Light, System |
| Notifications | Email notifications, Desktop notifications, Follow-up reminders, Meeting reminders |
| Email | Default signature, Default "from" address, Track opens, Track clicks |
| Timezone | User timezone for scheduling |
| API Key | Generate / regenerate personal API key for extension & integrations |

### 5.12 Chrome Extension

**Platform:** Manifest V3 (Chrome/Edge/Brave)

**Supported Sites:**
| Platform | Extracted Data |
|----------|---------------|
| LinkedIn | Name, headline (designation), company, location, bio, profile image |
| Twitter/X | Name, bio, location, profile image |
| GitHub | Name, bio, company, location, email |
| Instagram | Name, bio, profile image |

**Workflow:**
1. User visits a supported profile page
2. Content script detects the profile and injects a floating "Save to CRM" card
3. User clicks save → extension sends data to CRM API with API key auth
4. Lead is created with the detected platform set automatically

**Configuration (via popup):**
- CRM URL (defaults to `http://localhost:3000`)
- API Key (generated from Settings page)

---

## 6. API Routes Reference

All routes are at `/api/` and require authentication (session cookie or API key).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/leads` | List leads (paginated, filtered, sorted) |
| POST | `/api/leads` | Create a new lead |
| GET | `/api/leads/[id]` | Get lead details |
| PUT | `/api/leads/[id]` | Update a lead |
| DELETE | `/api/leads/[id]` | Delete a lead |
| POST | `/api/leads/bulk` | Bulk operations (status update, delete) |
| POST | `/api/leads/import` | CSV import |
| GET | `/api/leads/export` | CSV export |
| GET/POST | `/api/leads/[id]/attachments` | Lead attachments |
| GET | `/api/activities` | List activity feed |
| GET/POST | `/api/emails` | List / send emails |
| POST | `/api/emails/draft` | Save email draft |
| GET/DELETE | `/api/emails/[id]` | Get / delete email |
| GET/POST | `/api/followups` | List / create follow-ups |
| PUT/DELETE | `/api/followups/[id]` | Update / delete follow-up |
| GET/POST | `/api/meetings` | List / create meetings |
| PUT/DELETE | `/api/meetings/[id]` | Update / delete meeting |
| GET/POST | `/api/notes` | List / create notes |
| PUT/DELETE | `/api/notes/[id]` | Update / delete note |
| GET/POST | `/api/tags` | List / create tags |
| DELETE | `/api/tags/[id]` | Delete tag |
| GET/POST | `/api/templates` | List / create templates |
| PUT/DELETE | `/api/templates/[id]` | Update / delete template |
| GET | `/api/notifications` | List notifications |
| GET/PUT | `/api/settings` | Get / update user settings |
| GET | `/api/dashboard` | Dashboard stats |
| GET | `/api/analytics` | Analytics data |
| POST | `/api/upload` | File upload |
| ALL | `/api/auth/[...all]` | better-auth handler (login, signup, session, etc.) |

---

## 7. Services Layer

Each domain entity has a dedicated service in `packages/server/src/services/`:

| Service | Responsibility |
|---------|----------------|
| `lead.service.ts` | CRUD, search, filtering, pagination, bulk ops, import/export |
| `activity.service.ts` | Auto-logging timeline events, paginated feed |
| `email.service.ts` | Compose, send via Resend, draft management, event tracking |
| `followup.service.ts` | CRUD, recurring logic, status transitions |
| `meeting.service.ts` | CRUD, calendar queries |
| `note.service.ts` | CRUD, pin/unpin |
| `tag.service.ts` | CRUD, uniqueness enforcement |
| `template.service.ts` | CRUD, variable management |
| `notification.service.ts` | Create, list, mark read |
| `settings.service.ts` | Get/update preferences, API key generation |
| `analytics.service.ts` | Aggregation queries, date-range filtering |
| `dashboard.service.ts` | Summary stats, recent activity |
| `attachment.service.ts` | File metadata, linking to leads/emails |

All services import the Supabase client from `@outreach/database/client` and return typed results using interfaces from `@outreach/shared`.

---

## 8. Validation

All input validation uses **Zod v4** schemas defined in `packages/shared/src/validations.ts`. These schemas are shared between:
- Server-side API route handlers (request body validation)
- Client-side form validation (via `@hookform/resolvers/zod`)

This ensures consistent validation rules across the stack without duplication.

---

## 9. State Management

Client-side state is managed with **Zustand** stores located in `apps/web/store/`:
- Leads store — cached lead list, filters, pagination state
- UI store — sidebar collapse, modals, toasts

Server state (data fetching) follows the standard Next.js pattern of fetching in API routes and consuming via React hooks with SWR-like patterns.

---

## 10. Deployment

### Production Stack

| Component | Platform |
|-----------|----------|
| Frontend + API | Vercel |
| Database | Supabase (managed PostgreSQL) |
| Email | Resend |
| File Storage | AWS S3 or Cloudflare R2 (optional) |

### Environment Variables (Production)

| Variable | Required |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ |
| `DATABASE_URL` | ✅ |
| `NEXT_PUBLIC_APP_URL` | ✅ |
| `BETTER_AUTH_SECRET` | ✅ |
| `BETTER_AUTH_URL` | ✅ |
| `RESEND_API_KEY` | ✅ |
| `RESEND_FROM_EMAIL` | ✅ |
| `RESEND_WEBHOOK_SECRET` | ✅ |

### Vercel Configuration

- **Root Directory:** `apps/web`
- **Framework:** Next.js (auto-detected)
- **Build Command:** `next build` (default)
- **Install Command:** `npm install` (runs from workspace root)
- Internal packages (`@outreach/database`, `@outreach/server`, `@outreach/shared`) are transpiled at build time via `transpilePackages` in `next.config.ts`.

---

## 11. Security Considerations

- Service-role key is server-only — never exposed to client bundle
- API key auth validates against the `settings.api_key` column (hashed)
- CSRF protection via better-auth session cookies (SameSite, HttpOnly)
- Trusted origins configured in better-auth for cross-origin protection
- Row-level scoping — all queries filter by `user_id` to prevent cross-tenant data access
- Webhook signature verification for Resend events (`standardwebhooks`)
- Input validation on all mutation endpoints via Zod schemas

---

## 12. Admin Dashboard

**Route:** `/admin`

A dedicated administration portal separate from the user dashboard for platform management, user monitoring, subscription management, analytics, and system health.

**Implementation Status:** 🚧 Currently implementing

### 12.1 Dashboard Overview

Display platform-wide statistics:

**Key Metrics:**
- Total Registered Users
- Active Users (Today, Week, Month)
- Total Leads Stored
- Total Emails Sent
- Total Deals Won
- Revenue (Future — Subscription Revenue)
- Storage Usage
- API Requests Today
- Chrome Extension Installations
- Total Organizations (Future)

**Quick Cards:**
- New Users Today
- Users Online
- Free Plan Users
- Premium Users
- Trial Users
- Expired Subscriptions
- Monthly Recurring Revenue (Future)
- Server Status

**Charts:**
- User Growth
- Daily Active Users
- Monthly Signups
- Lead Creation Trend
- Email Volume
- Platform Usage
- Login Activity
- Subscription Growth (Future)

### 12.2 User Management

**Route:** `/admin/users`

Admin can manage every registered user.

**User Table Columns:**
| Column | Description |
|--------|-------------|
| Avatar | Profile image |
| Name | Full name |
| Email | Account email |
| Company | User's company |
| Plan | Free / Starter / Pro / Business |
| Status | Active / Suspended / Trial / Expired |
| Joined Date | Registration timestamp |
| Last Login | Most recent session |
| Leads Count | Total leads created |
| Emails Sent | Total outreach emails |
| Storage Used | Files + attachments size |

**Actions:**
- View User
- Suspend User
- Activate User
- Delete User
- Reset Password
- Impersonate User (optional)
- Export User Data

**Filters:**
- Free Users / Premium Users / Trial Users
- Suspended / Active
- Recently Joined / Last Active
- Country / Company

### 12.3 User Details Page

**Route:** `/admin/users/[id]`

**Sections:**

**Profile:**
- Name, Email, Phone, Company, Website
- Country, Timezone
- Registration Date, Last Login
- Email Verified status, Account Status

**CRM Statistics:**
- Total Leads / Active Leads / Closed Deals / Win Rate
- Emails Sent / Open Rate
- Meetings / Follow Ups / Notes / Templates / Attachments

**Activity Timeline:**
- Login History
- Lead Created / Email Sent / Pipeline Changes
- Subscription Changes / Password Changes
- API Key Generated

**Storage:**
- Database Size / Attachments / Images / Email Templates / Remaining Storage

**Security:**
- Active Sessions / Browser History / Devices
- Login Locations / Failed Login Attempts / API Keys

### 12.4 Platform Analytics

**Route:** `/admin/analytics`

**User Analytics:**
- Total Users / Active Users / Churn Rate / Retention
- Average Session Duration / New Registrations / Returning Users

**CRM Analytics:**
- Leads Created Daily / Pipeline Value / Conversion Rate
- Average Deal Size / Average Sales Cycle / Top Industries

**Email Analytics:**
- Emails Sent / Delivered / Opened / Clicked / Replied / Bounced

**Chrome Extension Analytics:**
- Installs / Active Users / Captured Leads / Platform Distribution

**API Analytics:**
- Requests Per Minute / Success Rate / Failed Requests / Average Response Time

**Geography:**
- Maps displaying User Countries, Most Active Regions, Timezone Distribution

### 12.5 System Monitoring

**Route:** `/admin/system`

Platform health dashboard.

**Monitor:**
- Database Health
- API Status
- Email Queue
- Storage Usage
- Background Jobs / Cron Jobs
- Error Logs
- Webhook Status (Resend Webhooks, Chrome Extension API)

### 12.6 Subscription Management (Future)

**Route:** `/admin/subscriptions`

Designed for future Stripe integration.

**Plans:**
| Plan | Price | Audience |
|------|-------|----------|
| Free | ₹0 | Individuals getting started |
| Starter | ₹499/month | Freelancers |
| Pro | ₹999/month | Agencies & consultants |
| Business | Custom | Teams & organizations |

**Manage:**
- Plans, Pricing, Trial Period
- Feature Limits, Seats, Storage, API Limits, Email Limits

**Subscription Table:**
- User, Plan, Billing Cycle, Status, Renewal Date, Amount, Payment Method, Invoice History

**Revenue Dashboard Charts:**
- Monthly Revenue / ARR / MRR / Churn / Failed Payments / Lifetime Value / ARPU

### 12.7 Roles & Permissions (Future)

Future RBAC support.

**Roles:** Super Admin, Admin, Support, Moderator, Finance

**Permissions:**
- Manage Users / Manage Plans / View Analytics / Manage Settings
- Delete Users / Refund Payments / Manage API Keys

### 12.8 Audit Logs

Every important action is logged.

**Examples:**
- User Created / User Deleted / Login / Password Changed
- Subscription Updated / API Key Generated / Lead Deleted
- Admin Login / Email Sent / Role Changed

---

## 13. Landing Page (Public Website)

**Route:** `/` (root — public, no auth required)

Marketing website to convert visitors into users before they sign up.

**Implementation Status:** 🚧 Currently implementing

### 13.1 Hero Section

- **Headline:** "Turn Social Profiles Into Clients"
- **Subheading:** "Capture leads from LinkedIn, X, GitHub, and Instagram in one click. Manage outreach, automate follow-ups, and close more deals from a single CRM."
- **CTA Buttons:** Start Free, Book Demo
- **Visuals:** Product dashboard mockup, Chrome Extension preview

**Trusted By:** Freelancers, Startups, Agencies, Sales Teams, Recruiters, Consultants

### 13.2 Features Section

- One-click Lead Capture
- Smart Pipeline
- Email Outreach
- Follow-up Automation
- Calendar & Meetings
- Analytics Dashboard
- Chrome Extension
- Team Collaboration (Future)
- AI Assistant (Future)

### 13.3 How It Works

1. Install the Chrome Extension
2. Save leads from social platforms
3. Organize your pipeline
4. Send personalized emails
5. Schedule follow-ups
6. Convert leads into clients

### 13.4 Product Screenshots

- Dashboard
- Pipeline
- Lead Details
- Analytics
- Email Composer
- Calendar
- Chrome Extension
- Mobile Responsive View

### 13.5 Pricing (Future Ready)

| Plan | Price | Intended Audience |
|------|-------|-------------------|
| Free | ₹0 | Individuals getting started |
| Starter | ₹499/month | Freelancers |
| Pro | ₹999/month | Agencies & consultants |
| Business | Custom | Teams & organizations |

### 13.6 Testimonials

- Freelancer
- Startup Founder
- Agency Owner
- Sales Manager

### 13.7 FAQ

Common questions covering:
- Supported platforms
- Browser compatibility
- Data privacy
- Team features
- API availability
- Pricing

### 13.8 Footer

**Product:** Features, Pricing, Blog, Documentation, API

**Legal:** Privacy Policy, Terms of Service

**Contact:** Social Links (Twitter, LinkedIn, GitHub)

---

## 14. Additional Database Tables (Future)

To support Admin, Subscriptions, and RBAC features, extend the schema with:

| Table | Purpose |
|-------|---------|
| `subscriptions` | User subscription records |
| `plans` | Available pricing plans |
| `payments` | Payment transactions |
| `invoices` | Billing invoices |
| `organizations` | Multi-user orgs / teams |
| `members` | Org membership |
| `roles` | Role definitions |
| `permissions` | Permission definitions |
| `audit_logs` | Admin action logging |
| `sessions` | Active session tracking |
| `user_devices` | Device fingerprints |
| `login_history` | Login timestamps + locations |
| `system_logs` | Platform health events |
| `api_usage` | API request metrics |
| `feature_flags` | Feature toggle management |
| `storage_usage` | Per-user storage accounting |

These additions fit naturally into the existing schema and provide a foundation for evolving into a production-ready SaaS platform with multi-user administration, subscription billing, and operational visibility.

---

## 15. Implementation Roadmap

### Phase 1 — Current (Implemented ✅)

- User authentication (signup, login, forgot/reset password)
- Lead management (CRUD, search, filter, bulk ops, import/export)
- Pipeline Kanban board
- Email outreach with Resend (compose, send, track)
- Email templates with variable substitution
- Follow-ups with recurring support
- Meetings & calendar
- Notes & attachments
- Activity feed
- Analytics dashboard
- Notifications
- Settings (theme, email, API key)
- Chrome extension for lead capture

### Phase 2 — In Progress (🚧)

- **Landing page** — Public marketing website
- **Admin dashboard** — Platform management portal

### Phase 3 — Future

- Subscription/billing (Stripe integration)
- Roles & permissions (RBAC)
- Organizations / team workspaces
- Audit logs
- System monitoring
- AI-powered features (email generation, lead scoring)
- Mobile app
- Row Level Security (RLS)
- Real-time subscriptions (Supabase Realtime)
