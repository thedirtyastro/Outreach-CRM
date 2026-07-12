# OutReach CRM

A full-stack CRM for freelancers and agencies to track outreach leads from LinkedIn, Twitter, GitHub, and Instagram. Includes a Next.js web app, a Chrome extension for one-click profile capture, and a structured service layer ready to be extracted into a standalone API.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Credentials](#getting-credentials)
- [Local Setup](#local-setup)
- [Environment Variables Reference](#environment-variables-reference)
- [Running the App](#running-the-app)
- [Chrome Extension](#chrome-extension)
- [Feature Guide](#feature-guide)
- [API Authentication](#api-authentication)
- [Deployment](#deployment)

---

## Features

- **Lead Management** — Add, edit, and track leads with 15 pipeline statuses, 4 priority levels, tagging, budgets, and project types
- **Kanban Pipeline** — Drag-and-drop board view of your leads by status
- **Email Outreach** — Compose and send emails via Resend, with open/click tracking and thread view
- **Email Templates** — Reusable templates with variable substitution (7 built-in types)
- **Follow-ups** — Scheduled follow-up tasks with recurring support (daily/weekly/monthly)
- **Meetings** — Track calls, video calls, and in-person meetings against leads
- **Notes** — Pinnable rich notes per lead with file attachments
- **Activity Feed** — Auto-logged timeline of all actions taken on a lead
- **Analytics** — Charts and metrics on pipeline performance, conversion rates, and outreach activity
- **Calendar** — Monthly/agenda view of scheduled follow-ups and meetings
- **Notifications** — In-app notification bell for reminders and events
- **Settings** — Theme toggle (dark/light/system), email signature, notification preferences, timezone, and API key management
- **Chrome Extension** — One-click lead capture from LinkedIn, Twitter/X, GitHub, and Instagram
- **API Key Auth** — Generate a personal API key for use with the Chrome extension or external integrations

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript 5 |
| Database | Supabase (PostgreSQL) |
| Auth | better-auth v1 + PostgreSQL adapter |
| Email | Resend + React Email |
| UI | Radix UI + Tailwind CSS v4 |
| Charts | Recharts |
| Tables | TanStack Table |
| Forms | React Hook Form + Zod v4 |
| State | Zustand |
| Drag & drop | dnd-kit |
| Animations | Framer Motion |

---

## Project Structure

```
outreach-crm/
├── apps/
│   └── web/                 Next.js 16 — frontend + API routes (BFF)
│       ├── app/             App Router pages and API route handlers
│       ├── components/      React UI components
│       ├── hooks/           Custom React hooks
│       ├── lib/             Client utilities, API client, re-exports
│       ├── store/           Zustand state stores
│       └── .env.example     App-level env reference
│
├── packages/
│   ├── shared/              Types + Zod schemas (no Node deps — safe everywhere)
│   ├── database/            Supabase client, table types, SQL migrations
│   └── server/              Service layer, auth, Resend client
│
├── extension/               Chrome Extension (Manifest V3)
├── .env.example             Root env reference → copy to apps/web/.env.local
└── package.json             npm workspaces root
```

---

## Prerequisites

- **Node.js** 20+ and **npm** 10+
- **Supabase account** — free tier at [supabase.com](https://supabase.com) for PostgreSQL database
- **Resend account** — for sending transactional emails ([resend.com](https://resend.com))

---

## Getting Credentials

### Supabase

1. Sign up at [supabase.com](https://supabase.com) and create a new project
2. Go to **Project Settings → API** and copy:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
3. Go to **Project Settings → Database** and copy the **Connection string** (URI mode):
   ```
   DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
4. Open the **SQL Editor** and run the migration at `packages/database/migrations/001_initial_schema.sql` to create all CRM tables

### Resend (Email)

1. Sign up at [resend.com](https://resend.com)
2. Go to **API Keys** → click **Create API Key** → copy it:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
   ```
3. Go to **Domains** → add and verify your sending domain (or use `onboarding@resend.dev` for testing):
   ```
   RESEND_FROM_EMAIL=OutReach CRM <noreply@yourdomain.com>
   ```
4. Go to **Webhooks** → click **Add Webhook**
   - Set endpoint to `https://your-domain.com/api/webhooks/resend`
   - Select events: `email.delivered`, `email.opened`, `email.clicked`, `email.bounced`, `email.complained`
   - Copy the signing secret:
     ```
     RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
     ```
   > For local development you can use [ngrok](https://ngrok.com) to expose `localhost:3000` and point the webhook at your ngrok URL.

### Auth Secret

Generate a random 32-character string for session signing:

```bash
# macOS / Linux
openssl rand -base64 32

# Or use node
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

```
BETTER_AUTH_SECRET=<paste the generated string>
```

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/your-org/outreach-crm.git
cd outreach-crm
npm install
```

### 2. Configure environment variables

```bash
cp .env.example apps/web/.env.local
```

Open `apps/web/.env.local` and fill in all required values (see [Environment Variables Reference](#environment-variables-reference) below).

### 3. Start the development server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### 4. Create your account

Navigate to [http://localhost:3000/signup](http://localhost:3000/signup) and register. No email verification is required in the default configuration.

---

## Environment Variables Reference

Copy `.env.example` to `apps/web/.env.local` and set these values:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server-side only) |
| `DATABASE_URL` | ✅ | Postgres connection string for better-auth |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public base URL — `http://localhost:3000` in dev, your domain in production |
| `BETTER_AUTH_SECRET` | ✅ | Random 32-char string for signing sessions |
| `RESEND_API_KEY` | ✅ | API key from [resend.com/api-keys](https://resend.com/api-keys) |
| `RESEND_FROM_EMAIL` | ✅ | Verified sender address, e.g. `OutReach CRM <noreply@yourdomain.com>` |
| `RESEND_WEBHOOK_SECRET` | ✅ | Webhook signing secret from [resend.com/webhooks](https://resend.com/webhooks) |
| `AWS_ACCESS_KEY_ID` | ☐ | AWS access key (if using S3 for file uploads) |
| `AWS_SECRET_ACCESS_KEY` | ☐ | AWS secret key |
| `AWS_REGION` | ☐ | AWS region, e.g. `us-east-1` |
| `AWS_S3_BUCKET` | ☐ | S3 bucket name |
| `R2_ACCOUNT_ID` | ☐ | Cloudflare account ID (if using R2 instead of S3) |
| `R2_ACCESS_KEY_ID` | ☐ | R2 access key |
| `R2_SECRET_ACCESS_KEY` | ☐ | R2 secret key |
| `R2_BUCKET` | ☐ | R2 bucket name |
| `R2_PUBLIC_URL` | ☐ | R2 public URL, e.g. `https://pub-xxxx.r2.dev` |

> File storage variables are optional — attachments require either S3 or R2 to be configured.

---

## Running the App

All commands run from the repo root:

```bash
npm run dev        # Start dev server → http://localhost:3000
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Lint apps/web
npm run lint:all   # Lint all workspaces
```

To run commands directly inside the web app:

```bash
npm run dev --workspace=apps/web
```

---

## Chrome Extension

The extension captures lead profiles from LinkedIn, Twitter/X, GitHub, and Instagram with one click, and saves them directly to your CRM.

### Build the extension

```bash
# From the repo root — install if needed
npm install

# Build to extension/dist/
node extension/build.mjs

# Watch mode during development
node extension/build.mjs --watch
```

### Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `extension/dist/` folder

### Connect to your CRM

1. In the CRM, go to **Settings → API Key** and click **Generate API Key**
2. Click the extension icon in your browser toolbar
3. Click the ⚙ settings icon
4. Paste your API key
5. Set the CRM URL (default: `http://localhost:3000`)
6. Click **Save Settings**

Now visit any supported profile and a save card will appear automatically.

| Site | Data extracted |
|---|---|
| LinkedIn | Name, headline, company, location, bio, profile image |
| Twitter / X | Name, bio, location, profile image |
| GitHub | Name, bio, company, location, email |
| Instagram | Name, bio, profile image |

---

## Feature Guide

### Dashboard

The home screen at `/dashboard` shows:
- Key metrics: total leads, win rate, revenue pipeline, active follow-ups
- Leads-by-status chart and platform breakdown
- Recent activity feed

### Lead Management (`/dashboard/leads`)

- **Add a lead** — click **New Lead**, fill in contact details, choose the platform and initial status
- **Filter & search** — use the toolbar to filter by status, platform, priority, or tags; full-text search across name, company, and email
- **Bulk actions** — select multiple leads for bulk status updates or deletion
- **Import** — upload a CSV file via the toolbar **Import** button
- **Export** — download your filtered lead list as CSV

#### Lead detail page (`/dashboard/leads/[id]`)

Each lead has a detail page with tabs:
- **Overview** — contact info, status, priority, budget, project type, social links
- **Emails** — composed threads with open/click status indicators
- **Notes** — pinnable free-text notes with attachment support
- **Meetings** — logged calls, video calls, and in-person meetings
- **Attachments** — uploaded files linked to the lead
- **Activity** — auto-generated timeline of all interactions

### Pipeline (`/dashboard/pipeline`)

Kanban board with columns for each status. Drag cards between columns to update lead status in real time.

Available statuses: `New → Initiated → Message Sent → Viewed → Responded → Interested → Meeting Scheduled → Proposal Sent → Negotiation → Waiting → Won / Lost / Ghosted / Rejected / Archived`

### Emails (`/dashboard/emails`)

- Compose emails from any lead's detail page or the Emails section
- Select a template or write from scratch
- View threaded email history per lead
- Open and click events are tracked automatically via Resend webhooks

### Email Templates (`/dashboard/templates`)

- Create reusable templates with subject and body
- Insert variables like `{{name}}`, `{{company}}` that get replaced on send
- Template types: Introduction, Follow-up, Reminder, Proposal, Meeting Confirmation, Thank You, Custom
- Mark a template as default to pre-select it in the compose dialog

### Follow-ups (`/dashboard/followups`)

- Schedule a follow-up against any lead with a due date
- Set recurring follow-ups: repeat every N days, weeks, or months
- Mark as completed, and optionally auto-create the next recurrence
- Overdue follow-ups are highlighted

### Meetings (`/dashboard/calendar` and lead detail)

- Log meetings of type: Call, Video, In-Person, Other
- Set start/end times, location, and meeting URL
- View all meetings in the Calendar view (monthly grid + agenda list)

### Analytics (`/dashboard/analytics`)

- Pipeline funnel showing conversion at each stage
- Leads by platform breakdown
- Email engagement rates (open, click, bounce)
- Activity volume over time

### Settings (`/dashboard/settings`)

- **Profile** — update your name and profile image
- **Theme** — dark, light, or system
- **Notifications** — toggle email, desktop, follow-up reminders, and meeting reminders
- **Email** — set your default email signature and toggle open/click tracking
- **Timezone** — select your local timezone for follow-up and meeting times
- **API Key** — generate or regenerate a personal API key for Chrome extension and external API access

---

## API Authentication

All API routes support two authentication methods:

**1. Session cookie** (browser)
Standard better-auth session set on login. Used automatically by the web app.

**2. API key** (external / Chrome extension)
Pass the key generated in Settings in one of these headers:

```
X-API-Key: your-api-key
# or
Authorization: Bearer your-api-key
```

---

## Deployment

Deploy `apps/web` to [Vercel](https://vercel.com) (recommended) or any Node.js host.

### Vercel

1. Connect your repository in the Vercel dashboard
2. Set **Root Directory** to `apps/web`
3. Set **Framework Preset** to Next.js
4. Add all environment variables from the [reference table above](#environment-variables-reference) in **Project Settings → Environment Variables**
5. Deploy

The local `packages/` are compiled at build time via `transpilePackages` in `next.config.ts` — no separate build step is needed for them.

### Resend webhook in production

After deploying, update your Resend webhook endpoint to `https://your-domain.com/api/webhooks/resend` and ensure `RESEND_WEBHOOK_SECRET` is set to the same signing secret shown in the Resend dashboard.
